# Pingolin RPC Spinal Cord & Dumb Worker Architecture

## 1. The Sovereign Law
To achieve 30-year zero-maintenance (`0M`) reliability, strip web workers of all business logic and API state: the worker is a "Dumb Muscle" executing 4 primitive I/O channels (`RPC_FETCH`, `RPC_SQL_QUERY`, `RPC_SQL_EXEC`, `RPC_SQL_TRANSACTION`), commanded asynchronously by an Elm Sovereign General tracking in-flight requests via correlated IDs (`Dict String RpcState`).

## 2. The Trigger & Context
In early versions of Pingolin PWA, `sync-worker.js` contained heavy domain logic:
- **The "Fat Worker" Quagmire:** The worker ran internal `setInterval` timers, made autonomous HTTP calls to Pinboard, executed schema migrations, and managed sync state.
- **State Synchronization Drift:** Because the UI thread (Elm) and Worker thread (JS) both maintained independent models of sync progress, the UI frequently suffered from race conditions, stale status text, and uncatchable background errors.
- **The Great Lobotomy Solution:** Stripping the worker of all domain concepts (no Pinboard awareness, no timers, no tag parsing). The worker only executes generic SQL and HTTP requests, returning raw results tagged with the originating request `id`.

---

## 3. Developer Intent vs. Elm Semantics

| Dimension | Legacy Fat Worker Paradigm (JS) | Sovereign RPC Spinal Cord (Elm + Dumb Muscle) |
| :--- | :--- | :--- |
| **Worker Intelligence** | Worker knows API endpoints, throttling rules, and retry loops. | Worker is purely an I/O driver executing `{ sql, bind }` or `{ proxyUrl, path, params }`. |
| **Passage of Time** | Worker fires uncoordinated `setInterval` and `setTimeout`. | Elm controls time via `Time.every (60 * 1000) Tick` subscriptions and explicit `Process.sleep` delays. |
| **Error Handling** | Worker catches errors and logs to console (swallowed silently). | Worker emits `{ type: "RPC_ERROR", id, payload: { message, code } }`. Elm maps the error back to its exact in-flight request slot. |
| **State Ownership** | Fragmented between worker memory, IndexedDB, and UI. | **Single Source of Truth:** Elm owns 100% of application state and decides when to query or mutate SQLite. |

---

## 4. The Pattern

### ❌ THE WRONG WAY: Smart Worker with Autonomous Domain Logic (Anti-Pattern)

```javascript
// ANTI-PATTERN: Worker runs its own timers and hardcodes Pinboard API logic
setInterval(async () => {
  const bookmarks = await fetchFromPinboard('/posts/all');
  await db.insertAll(bookmarks);
  self.postMessage({ type: 'SYNC_DONE' }); // UI has no control or visibility!
}, 60000);
```

---

### ✅ THE RIGHT WAY: Sovereign Elm Dispatcher & Dumb RPC Muscle

#### 1. Correlated RPC Interface in Elm (`Rpc.elm`)

```elm
module Rpc exposing
    ( RpcState(..)
    , RpcMsg(..)
    , rpcFetch
    , rpcSqlQuery
    , rpcSqlExec
    , rpcSqlTransaction
    , handleRpcSuccess
    , handleRpcError
    )

import Dict exposing (Dict)
import Json.Decode as Decode
import Json.Encode as Encode

type RpcState
    = RpcPending
    | RpcSuccess (Maybe Decode.Value)
    | RpcFailed { message : String, code : String }

type alias InFlightRpcs =
    Dict String RpcState

-- 1. Dispatches generic HTTP fetch through proxy with unique ID
rpcFetch : String -> String -> String -> List ( String, String ) -> ( InFlightRpcs, Cmd msg )
rpcFetch requestId proxyUrl path params =
    let
        payload =
            Encode.object
                [ ( "type", Encode.string "RPC_FETCH" )
                , ( "id", Encode.string requestId )
                , ( "payload"
                  , Encode.object
                        [ ( "proxyUrl", Encode.string proxyUrl )
                        , ( "path", Encode.string path )
                        , ( "params", Encode.object (List.map (\( k, v ) -> ( k, Encode.string v )) params) )
                        ]
                  )
                ]
    in
    ( Dict.insert requestId RpcPending Dict.empty, toWorker payload )

-- 2. Dispatches atomic batch SQL mutations
rpcSqlTransaction : String -> List { sql : String, bind : List Encode.Value } -> ( InFlightRpcs, Cmd msg )
rpcSqlTransaction requestId queries =
    let
        payload =
            Encode.object
                [ ( "type", Encode.string "RPC_SQL_TRANSACTION" )
                , ( "id", Encode.string requestId )
                , ( "payload"
                  , Encode.list
                        (\q ->
                            Encode.object
                                [ ( "sql", Encode.string q.sql )
                                , ( "bind", Encode.list identity q.bind )
                                ]
                        )
                        queries
                  )
                ]
    in
    ( Dict.insert requestId RpcPending Dict.empty, toWorker payload )

port toWorker : Encode.Value -> Cmd msg
```

#### 2. Dumb Worker RPC Router (`sync-worker.ts`)

```typescript
// Worker has ZERO domain logic - it executes raw commands and echoes the ID back
self.onmessage = async (event: MessageEvent) => {
  const { type, id, payload } = event.data;

  try {
    switch (type) {
      case 'RPC_FETCH': {
        const { proxyUrl, path, params } = payload;
        const url = new URL(path, proxyUrl);
        Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
        const res = await fetch(url.toString());
        const data = await res.json();
        self.postMessage({ type: 'RPC_SUCCESS', id, payload: data });
        break;
      }

      case 'RPC_SQL_QUERY': {
        const { sql, bind } = payload;
        const rows = await db.query(sql, bind);
        self.postMessage({ type: 'RPC_SUCCESS', id, payload: rows });
        break;
      }

      case 'RPC_SQL_TRANSACTION': {
        await db.transaction(async (tx) => {
          for (const step of payload) {
            await tx.execute(step.sql, step.bind);
          }
        });
        self.postMessage({ type: 'RPC_SUCCESS', id, payload: null });
        break;
      }
    }
  } catch (err: any) {
    // Correlated error envelope
    self.postMessage({
      type: 'RPC_ERROR',
      id,
      payload: { message: err.message, code: err.code || 'SQL_ERROR' }
    });
  }
};
```
