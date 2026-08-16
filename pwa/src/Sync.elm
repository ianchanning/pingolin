module Sync exposing (..)

import Dict exposing (Dict)
import Json.Decode as Decode
import Json.Encode as Encode
import Process
import Rpc exposing (..)
import Task
import Types exposing (..)



-- Helper to turn an Rpc envelope into a Cmd Msg


toWorkerCmd : Encode.Value -> Cmd Msg
toWorkerCmd env =
    Task.perform (\_ -> SendWorkerValue env) (Process.sleep 0)


type alias SyncEnv =
    { token : String
    , proxyUrl : String
    , query : String
    , bookmarks : List Bookmark
    , tagSuggestions : List String
    , isHydrated : Bool
    , status : String
    , progress : Float
    , lastSyncTime : String
    , targetSyncTime : String
    , syncPhase : SyncPhase
    , inFlightRpcs : Dict String RpcState
    , pendingFlush : List PendingRow
    , serverDates : Dict String Int
    , pendingDateReconciles : List String
    , dayServerHrefs : List String
    , renameOldTag : String
    , renameNewTag : String
    , renameQueue : List PendingRow
    }



-- Main entry point for worker messages


handleWorkerMsg : WorkerMsg -> SyncEnv -> ( SyncEnv, Cmd Msg )
handleWorkerMsg msg model =
    case msg of
        ProgressMsg status progress ->
            ( { model | status = status, progress = progress }, Cmd.none )

        SyncCompleteMsg ->
            ( { model | status = "Archive Restored. Finalizing...", progress = 1.0, isHydrated = True }
            , Task.perform (\_ -> QueryAll) (Process.sleep 0)
            )

        QueryResultsMsg bookmarks ->
            let
                hydrated =
                    model.isHydrated || not (List.isEmpty bookmarks)

                newStatus =
                    if hydrated && not (String.contains "Chaos" model.status) then
                        "Archive Online: " ++ String.fromInt (List.length bookmarks)

                    else
                        String.fromInt (List.length bookmarks)
            in
            ( { model | bookmarks = bookmarks, status = newStatus, isHydrated = hydrated }, Cmd.none )

        TagSuggestionsMsg suggestions ->
            ( { model | tagSuggestions = suggestions }, Cmd.none )

        ErrorMsg err ->
            ( { model | status = "Worker Chaos: " ++ err }, Cmd.none )

        RefreshRequiredMsg ->
            if model.query == "" then
                ( model, Task.perform (\_ -> QueryAll) (Process.sleep 0) )

            else
                ( model, Task.perform (\_ -> QuerySearch model.query) (Process.sleep 0) )

        SessionRestoredMsg token proxyUrl lastSync query ->
            let
                effectiveToken =
                    if token == "" then
                        model.token

                    else
                        token

                effectiveProxy =
                    if proxyUrl == "" then
                        model.proxyUrl

                    else
                        proxyUrl

                effectiveQuery =
                    if query == "" then
                        model.query

                    else
                        query

                restoredModel =
                    { model
                        | isHydrated = True
                        , status = "Session Restored."
                        , token = effectiveToken
                        , proxyUrl = effectiveProxy
                        , lastSyncTime = lastSync
                        , query = effectiveQuery
                    }

                queryCmd =
                    if model.query == "" then
                        Task.perform (\_ -> QueryAll) (Process.sleep 0)

                    else
                        Task.perform (\_ -> QuerySearch model.query) (Process.sleep 0)
            in
            if effectiveToken /= "" && effectiveProxy /= "" then
                let
                    ( rpc1, env1 ) =
                        rpcFetch "hb-update"
                            "/posts/update"
                            [ ( "auth_token", effectiveToken ), ( "format", "json" ) ]
                            effectiveProxy
                            restoredModel.inFlightRpcs

                    ( rpc2, env2 ) =
                        rpcSqlQuery "hb-pending"
                            "SELECT href, description, extended, tags, time, sync_status FROM bookmarks WHERE sync_status IN ('PENDING_INSERT', 'PENDING_UPDATE', 'PENDING_DELETE') ORDER BY local_last_modified ASC"
                            []
                            rpc1
                in
                ( { restoredModel | inFlightRpcs = rpc2, syncPhase = SyncCheckingUpdate, status = "Checking for updates..." }
                , Cmd.batch [ queryCmd, toWorkerCmd env1, toWorkerCmd env2 ]
                )

            else
                ( restoredModel, queryCmd )

        RpcSuccessMsg rpcId payload ->
            let
                updatedModel =
                    { model | inFlightRpcs = Dict.insert rpcId (RpcSuccess payload) model.inFlightRpcs }
            in
            routeRpcSuccess rpcId payload updatedModel

        RpcErrorMsg rpcId message code ->
            let
                updatedModel =
                    { model
                        | inFlightRpcs = Dict.insert rpcId (RpcFailed { message = message, code = code }) model.inFlightRpcs
                        , syncPhase = SyncIdle
                        , status = "Error (" ++ code ++ "): " ++ message
                    }
            in
            ( updatedModel, Cmd.none )

        UnknownMsg ->
            ( model, Cmd.none )



-- Routes completed RPC responses to the correct business logic handler.


routeRpcSuccess : String -> Maybe Decode.Value -> SyncEnv -> ( SyncEnv, Cmd Msg )
routeRpcSuccess rpcId maybePayload model =
    let
        refreshCmd =
            if model.query == "" then
                Task.perform (\_ -> QueryAll) (Process.sleep 0)

            else
                Task.perform (\_ -> QuerySearch model.query) (Process.sleep 0)
    in
    case rpcId of
        "hb-update" ->
            handleHeartbeatUpdate maybePayload model

        "hb-delta-fetch" ->
            handleDeltaFetchResult maybePayload model

        "hb-delta-tx" ->
            handleDeltaTxResult model

        "hb-pending" ->
            handleHeartbeatPending maybePayload model

        "hb-flush-add" ->
            handleFlushDone model

        "hb-flush-delete" ->
            handleFlushDeleteDone model

        "hb-mark-synced" ->
            ( model, refreshCmd )

        "hb-mark-deleted" ->
            ( model, refreshCmd )

        "hb-dates-server" ->
            handleDatesServerResult maybePayload model

        "hb-dates-local" ->
            handleDatesLocalResult maybePayload model

        "hb-day-get" ->
            handleDayGetResult maybePayload model

        "hb-day-local" ->
            handleDayLocalResult maybePayload model

        "hb-day-prune" ->
            let
                ( nextModel, nextCmd ) =
                    reconcileNextDay model
            in
            ( nextModel, Cmd.batch [ refreshCmd, nextCmd ] )

        "rename-query" ->
            handleRenameQueryResult maybePayload model

        "rename-tx" ->
            renamePushNext model

        "rename-push-add" ->
            handleRenamePushAddDone model

        "rename-mark-synced" ->
            ( model, refreshCmd )

        "rename-delete-tag" ->
            handleRenameDeleteTagDone model

        _ ->
            ( model, Cmd.none )


isSyncing : SyncPhase -> Bool
isSyncing phase =
    case phase of
        SyncIdle ->
            False

        _ ->
            True



-- HEARTBEAT HANDLERS


handleHeartbeatUpdate : Maybe Decode.Value -> SyncEnv -> ( SyncEnv, Cmd Msg )
handleHeartbeatUpdate maybePayload model =
    let
        serverTime =
            maybePayload
                |> Maybe.andThen
                    (\v -> Decode.decodeValue (Decode.field "update_time" Decode.string) v |> Result.toMaybe)
                |> Maybe.withDefault ""

        needsSync =
            serverTime /= "" && serverTime /= model.lastSyncTime
    in
    if needsSync then
        if model.lastSyncTime == "" then
            let
                hydrateEnvelope =
                    Encode.object
                        [ ( "type", Encode.string "START_HYDRATION" )
                        , ( "payload"
                          , Encode.object
                                [ ( "proxyUrl", Encode.string model.proxyUrl )
                                , ( "authToken", Encode.string model.token )
                                ]
                          )
                        , ( "id", Encode.string "hb-hydrate" )
                        ]
            in
            ( { model | syncPhase = SyncIdle, status = "Syncing...", lastSyncTime = serverTime }
            , toWorkerCmd hydrateEnvelope
            )

        else
            let
                ( m1, deltaEnv ) =
                    rpcFetch "hb-delta-fetch"
                        "/posts/all"
                        [ ( "auth_token", model.token )
                        , ( "format", "json" )
                        , ( "fromdt", model.lastSyncTime )
                        , ( "since", model.lastSyncTime )
                        ]
                        model.proxyUrl
                        model.inFlightRpcs
            in
            ( { model | inFlightRpcs = m1, syncPhase = SyncIdle, status = "Syncing...", targetSyncTime = serverTime }
            , toWorkerCmd deltaEnv
            )

    else
        let
            ( m1, datesEnv ) =
                rpcFetch "hb-dates-server"
                    "/posts/dates"
                    [ ( "auth_token", model.token ), ( "format", "json" ) ]
                    model.proxyUrl
                    model.inFlightRpcs
        in
        ( { model | inFlightRpcs = m1, syncPhase = SyncCheckingDates, status = "Checking for deletions..." }
        , toWorkerCmd datesEnv
        )


handleDeltaFetchResult : Maybe Decode.Value -> SyncEnv -> ( SyncEnv, Cmd Msg )
handleDeltaFetchResult maybePayload model =
    let
        bookmarks =
            maybePayload
                |> Maybe.andThen (\v -> Decode.decodeValue deltaResponseDecoder v |> Result.toMaybe)
                |> Maybe.withDefault []

        anchor =
            if model.targetSyncTime /= "" then
                model.targetSyncTime

            else
                model.lastSyncTime
    in
    if List.isEmpty bookmarks then
        let
            txStmts =
                [ ( "INSERT INTO metadata (key, value) VALUES ('last_sync_time', ?), ('last_full_sync_time', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value"
                  , [ Encode.string anchor, Encode.string anchor ]
                  )
                ]

            ( m1, txEnv ) =
                rpcSqlTransaction "hb-delta-tx" txStmts model.inFlightRpcs
        in
        ( { model | inFlightRpcs = m1 }, toWorkerCmd txEnv )

    else
        let
            toSql stmtB =
                ( "INSERT INTO bookmarks (href, description, extended, tags, time, sync_status, local_last_modified) VALUES (?, ?, ?, ?, ?, 'SYNCHRONIZED', ?) ON CONFLICT(href) DO UPDATE SET description=excluded.description, extended=excluded.extended, tags=excluded.tags, time=excluded.time, local_last_modified=excluded.local_last_modified"
                , [ Encode.string stmtB.href
                  , Encode.string stmtB.description
                  , Encode.string stmtB.extended
                  , Encode.string (String.join " " stmtB.tags)
                  , Encode.string stmtB.time
                  , Encode.int 1700000000000
                  ]
                )

            bookmarkStmts =
                List.map toSql bookmarks

            metaStmt =
                ( "INSERT INTO metadata (key, value) VALUES ('last_sync_time', ?), ('last_full_sync_time', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value"
                , [ Encode.string anchor, Encode.string anchor ]
                )

            txStmts =
                bookmarkStmts ++ [ metaStmt ]

            ( m1, txEnv ) =
                rpcSqlTransaction "hb-delta-tx" txStmts model.inFlightRpcs
        in
        ( { model | inFlightRpcs = m1 }, toWorkerCmd txEnv )


handleDeltaTxResult : SyncEnv -> ( SyncEnv, Cmd Msg )
handleDeltaTxResult model =
    let
        refreshCmd =
            if model.query == "" then
                Task.perform (\_ -> QueryAll) (Process.sleep 0)

            else
                Task.perform (\_ -> QuerySearch model.query) (Process.sleep 0)
    in
    ( { model | syncPhase = SyncIdle, status = "Sync complete", lastSyncTime = model.targetSyncTime, targetSyncTime = "" }
    , refreshCmd
    )


handleHeartbeatPending : Maybe Decode.Value -> SyncEnv -> ( SyncEnv, Cmd Msg )
handleHeartbeatPending maybePayload model =
    let
        pending =
            maybePayload
                |> Maybe.andThen (\v -> Decode.decodeValue (Decode.list pendingRowDecoder) v |> Result.toMaybe)
                |> Maybe.withDefault []
    in
    if List.isEmpty pending then
        ( model, Cmd.none )

    else
        flushNext
            { model
                | pendingFlush = pending
                , syncPhase = SyncFlushing { index = 0, total = List.length pending }
            }



-- FLUSH LOOP


flushNext : SyncEnv -> ( SyncEnv, Cmd Msg )
flushNext model =
    case model.pendingFlush of
        [] ->
            ( { model | syncPhase = SyncIdle, pendingFlush = [], status = "Flush complete." }, Cmd.none )

        first :: _ ->
            let
                flushIndex =
                    case model.syncPhase of
                        SyncFlushing { index } ->
                            index

                        _ ->
                            0

                total =
                    case model.syncPhase of
                        SyncFlushing flush ->
                            flush.total

                        _ ->
                            List.length model.pendingFlush

                statusText =
                    "Flushing " ++ String.fromInt (flushIndex + 1) ++ " of " ++ String.fromInt total

                ( m1, env ) =
                    if first.syncStatus == "PENDING_DELETE" then
                        rpcFetch "hb-flush-delete"
                            "/posts/delete"
                            [ ( "url", first.href )
                            , ( "auth_token", model.token )
                            , ( "format", "json" )
                            ]
                            model.proxyUrl
                            model.inFlightRpcs

                    else
                        rpcFetch "hb-flush-add"
                            "/posts/add"
                            [ ( "url", first.href )
                            , ( "description", first.description )
                            , ( "extended", first.extended )
                            , ( "tags", first.tags )
                            , ( "dt", first.time )
                            , ( "auth_token", model.token )
                            , ( "format", "json" )
                            ]
                            model.proxyUrl
                            model.inFlightRpcs
            in
            ( { model | inFlightRpcs = m1, status = statusText }, toWorkerCmd env )


handleFlushDone : SyncEnv -> ( SyncEnv, Cmd Msg )
handleFlushDone model =
    case model.pendingFlush of
        [] ->
            ( { model | syncPhase = SyncIdle }, Cmd.none )

        first :: rest ->
            let
                nextPhase =
                    case model.syncPhase of
                        SyncFlushing { index, total } ->
                            SyncFlushing { index = index + 1, total = total }

                        other ->
                            other

                ( m1, env ) =
                    rpcSqlExec "hb-mark-synced"
                        "UPDATE bookmarks SET sync_status = 'SYNCHRONIZED' WHERE href = ?"
                        [ Encode.string first.href ]
                        model.inFlightRpcs
            in
            ( { model | inFlightRpcs = m1, pendingFlush = rest, syncPhase = nextPhase }
            , Cmd.batch
                [ toWorkerCmd env
                , Task.perform (\_ -> FlushNext) (Process.sleep 3000)
                ]
            )


handleFlushDeleteDone : SyncEnv -> ( SyncEnv, Cmd Msg )
handleFlushDeleteDone model =
    case model.pendingFlush of
        [] ->
            ( { model | syncPhase = SyncIdle }, Cmd.none )

        first :: rest ->
            let
                nextPhase =
                    case model.syncPhase of
                        SyncFlushing { index, total } ->
                            SyncFlushing { index = index + 1, total = total }

                        other ->
                            other

                ( m1, env ) =
                    rpcSqlExec "hb-mark-deleted"
                        "DELETE FROM bookmarks WHERE href = ?"
                        [ Encode.string first.href ]
                        model.inFlightRpcs
            in
            ( { model | inFlightRpcs = m1, pendingFlush = rest, syncPhase = nextPhase }
            , Cmd.batch
                [ toWorkerCmd env
                , Task.perform (\_ -> FlushNext) (Process.sleep 3000)
                ]
            )



-- DATES HACK RECONCILIATION


handleDatesServerResult : Maybe Decode.Value -> SyncEnv -> ( SyncEnv, Cmd Msg )
handleDatesServerResult maybePayload model =
    let
        dates =
            maybePayload
                |> Maybe.andThen (\v -> Decode.decodeValue serverDatesDecoder v |> Result.toMaybe)
                |> Maybe.withDefault Dict.empty
    in
    let
        ( m1, env ) =
            rpcSqlQuery "hb-dates-local"
                "SELECT date(time) as d, count(*) as c FROM bookmarks WHERE sync_status = 'SYNCHRONIZED' GROUP BY d"
                []
                model.inFlightRpcs
    in
    ( { model | inFlightRpcs = m1, serverDates = dates, syncPhase = SyncComparingDates, status = "Checking for deletions..." }
    , toWorkerCmd env
    )


handleDatesLocalResult : Maybe Decode.Value -> SyncEnv -> ( SyncEnv, Cmd Msg )
handleDatesLocalResult maybePayload model =
    let
        localCounts =
            maybePayload
                |> Maybe.andThen (\v -> Decode.decodeValue localDateCountDecoder v |> Result.toMaybe)
                |> Maybe.withDefault Dict.empty

        mismatches =
            Dict.keys localCounts
                |> List.filter
                    (\date ->
                        let
                            localC =
                                Dict.get date localCounts |> Maybe.withDefault 0

                            serverC =
                                Dict.get date model.serverDates |> Maybe.withDefault 0
                        in
                        localC > serverC
                    )
    in
    if List.isEmpty mismatches then
        ( { model | syncPhase = SyncIdle, status = "Synchronized." }, Cmd.none )

    else
        let
            m1 =
                { model | pendingDateReconciles = mismatches }
        in
        reconcileNextDay m1 |> Tuple.mapFirst (\m -> m)


reconcileNextDay : SyncEnv -> ( SyncEnv, Cmd Msg )
reconcileNextDay model =
    case model.pendingDateReconciles of
        [] ->
            ( { model | syncPhase = SyncIdle, status = "Synchronized." }, Cmd.none )

        date :: _ ->
            let
                ( m1, env ) =
                    rpcFetch "hb-day-get"
                        "/posts/get"
                        [ ( "dt", date )
                        , ( "auth_token", model.token )
                        , ( "format", "json" )
                        ]
                        model.proxyUrl
                        model.inFlightRpcs
            in
            ( { model | inFlightRpcs = m1, syncPhase = SyncReconcilingDay date, status = "Reconciling " ++ date ++ "..." }
            , toWorkerCmd env
            )


handleDayGetResult : Maybe Decode.Value -> SyncEnv -> ( SyncEnv, Cmd Msg )
handleDayGetResult maybePayload model =
    let
        serverHrefs =
            maybePayload
                |> Maybe.andThen (\v -> Decode.decodeValue hrefListDecoder v |> Result.toMaybe)
                |> Maybe.withDefault []

        date =
            case model.syncPhase of
                SyncReconcilingDay d ->
                    d

                _ ->
                    List.head model.pendingDateReconciles |> Maybe.withDefault ""
    in
    let
        ( m1, env ) =
            rpcSqlQuery "hb-day-local"
                "SELECT href FROM bookmarks WHERE date(time) = ? AND sync_status = 'SYNCHRONIZED'"
                [ Encode.string date ]
                model.inFlightRpcs
    in
    ( { model | inFlightRpcs = m1, dayServerHrefs = serverHrefs, syncPhase = SyncPruningDay date }
    , toWorkerCmd env
    )


handleDayLocalResult : Maybe Decode.Value -> SyncEnv -> ( SyncEnv, Cmd Msg )
handleDayLocalResult maybePayload model =
    let
        localHrefs =
            maybePayload
                |> Maybe.andThen (\v -> Decode.decodeValue hrefListDecoder v |> Result.toMaybe)
                |> Maybe.withDefault []

        ghosts =
            List.filter (\h -> not (List.member h model.dayServerHrefs)) localHrefs

        remaining =
            List.drop 1 model.pendingDateReconciles
    in
    if List.isEmpty ghosts then
        reconcileNextDay { model | pendingDateReconciles = remaining }

    else
        let
            deleteStmts =
                List.map
                    (\href -> ( "DELETE FROM bookmarks WHERE href = ?", [ Encode.string href ] ))
                    ghosts

            ( m1, env ) =
                rpcSqlTransaction "hb-day-prune"
                    deleteStmts
                    model.inFlightRpcs
        in
        ( { model | inFlightRpcs = m1, pendingDateReconciles = remaining }, toWorkerCmd env )



-- TAG RENAME WORKAROUND


replaceTag : String -> String -> String -> String
replaceTag old new tagsStr =
    tagsStr
        |> String.split " "
        |> List.filter (not << String.isEmpty)
        |> List.map
            (\t ->
                if t == old then
                    new

                else
                    t
            )
        |> String.join " "


handleRenameQueryResult : Maybe Decode.Value -> SyncEnv -> ( SyncEnv, Cmd Msg )
handleRenameQueryResult maybePayload model =
    let
        bookmarks =
            maybePayload
                |> Maybe.andThen (\v -> Decode.decodeValue (Decode.list pendingRowDecoder) v |> Result.toMaybe)
                |> Maybe.withDefault []

        oldTag =
            model.renameOldTag

        newTag =
            model.renameNewTag

        updatedQueue =
            List.map
                (\b -> { b | tags = replaceTag oldTag newTag b.tags, syncStatus = "PENDING_UPDATE" })
                bookmarks

        txStmts =
            List.map
                (\b ->
                    ( "UPDATE bookmarks SET tags = ?, sync_status = 'PENDING_UPDATE', local_last_modified = ? WHERE href = ?"
                    , [ Encode.string b.tags, Encode.int 1700000000000, Encode.string b.href ]
                    )
                )
                updatedQueue

        m1 =
            { model
                | renameQueue = updatedQueue
                , syncPhase = SyncRenameProcessing { oldTag = oldTag, newTag = newTag, index = 0, total = List.length updatedQueue }
                , status = "Renaming tag: updating local DB"
            }

        ( m2, env ) =
            rpcSqlTransaction "rename-tx" txStmts m1.inFlightRpcs
    in
    ( { model | inFlightRpcs = m2 }, toWorkerCmd env )


renamePushNext : SyncEnv -> ( SyncEnv, Cmd Msg )
renamePushNext model =
    case model.renameQueue of
        [] ->
            let
                oldTag =
                    case model.syncPhase of
                        SyncRenameProcessing r ->
                            r.oldTag

                        _ ->
                            model.renameOldTag
            in
            if oldTag /= "" then
                let
                    ( m1, env ) =
                        rpcFetch "rename-delete-tag"
                            "/tags/delete"
                            [ ( "tag", oldTag )
                            , ( "auth_token", model.token )
                            , ( "format", "json" )
                            ]
                            model.proxyUrl
                            model.inFlightRpcs
                in
                ( { model | inFlightRpcs = m1, syncPhase = SyncIdle, status = "Rename complete." }, toWorkerCmd env )

            else
                ( { model | syncPhase = SyncIdle, status = "Rename complete." }, Cmd.none )

        first :: _ ->
            let
                rState =
                    case model.syncPhase of
                        SyncRenameProcessing r ->
                            r

                        _ ->
                            { oldTag = model.renameOldTag, newTag = model.renameNewTag, index = 0, total = List.length model.renameQueue }

                statusText =
                    "Renaming tag: pushing bookmark " ++ String.fromInt (rState.index + 1) ++ " of " ++ String.fromInt rState.total

                ( m1, env ) =
                    rpcFetch "rename-push-add"
                        "/posts/add"
                        [ ( "url", first.href )
                        , ( "description", first.description )
                        , ( "extended", first.extended )
                        , ( "tags", first.tags )
                        , ( "dt", first.time )
                        , ( "auth_token", model.token )
                        , ( "format", "json" )
                        , ( "replace", "yes" )
                        ]
                        model.proxyUrl
                        model.inFlightRpcs
            in
            ( { model | inFlightRpcs = m1, status = statusText }, toWorkerCmd env )


handleRenamePushAddDone : SyncEnv -> ( SyncEnv, Cmd Msg )
handleRenamePushAddDone model =
    case model.renameQueue of
        [] ->
            ( model, Cmd.none )

        first :: rest ->
            let
                rState =
                    case model.syncPhase of
                        SyncRenameProcessing r ->
                            r

                        _ ->
                            { oldTag = model.renameOldTag, newTag = model.renameNewTag, index = 0, total = List.length model.renameQueue }

                ( m1, env ) =
                    rpcSqlExec "rename-mark-synced"
                        "UPDATE bookmarks SET sync_status = 'SYNCHRONIZED' WHERE href = ?"
                        [ Encode.string first.href ]
                        model.inFlightRpcs
            in
            ( { model | inFlightRpcs = m1, renameQueue = rest, syncPhase = SyncRenameProcessing { rState | index = rState.index + 1 } }
            , Cmd.batch
                [ toWorkerCmd env
                , Task.perform (\_ -> RenamePushNextMsg) (Process.sleep 100)
                ]
            )


handleRenameDeleteTagDone : SyncEnv -> ( SyncEnv, Cmd Msg )
handleRenameDeleteTagDone model =
    let
        refreshCmd =
            if model.query == "" then
                Task.perform (\_ -> QueryAll) (Process.sleep 0)

            else
                Task.perform (\_ -> QuerySearch model.query) (Process.sleep 0)
    in
    ( { model
        | syncPhase = SyncIdle
        , renameOldTag = ""
        , renameNewTag = ""
        , status = "Rename complete."
      }
    , refreshCmd
    )
