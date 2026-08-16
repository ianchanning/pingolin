# The Elm Architecture (TEA) Core

## 1. The Sovereign Law
All application state transitions in Elm occur through a centralized, pure step function mapping `(Msg, Model) -> (Model, Cmd Msg)`. Side-effects can never be executed synchronously or inline; they are declared purely as inert data descriptions (`Cmd Msg`) for the runtime to execute and route back as new messages.

## 2. The Trigger & Context
Developers arriving from JavaScript, React, Vue, or Redux expect to trigger asynchronous side-effects, mutate local state slices, or perform I/O inline within event handlers or component lifecycle hooks.

When developers violate TEA invariants, they encounter severe architectural friction:
- **Attempting Synchronous I/O in `update`:** Trying to `fetch` data or read `localStorage` directly inside `update` halts compilation because Elm provides no imperative I/O statements.
- **Redux-Style Async Middleware Thinking:** Attempting to dispatch "thunks" or promises from view event handlers (`onClick (fetchUser id)`) fails because event attributes accept only pure `Msg` constructors.
- **State Tearing & Multiple Sources of Truth:** Scattering state across isolated components causes synchronization drift, out-of-order response bugs, and unreproducible race conditions.
- **Lost Time-Travel Capabilities:** Mutating data or executing unmanaged effects breaks deterministic state replay and automated testing.

---

## 3. Developer Intent vs. Elm Semantics

| Dimension | JavaScript / React / Redux Intent | Elm 0.19.1 Sovereign Semantics |
| :--- | :--- | :--- |
| **State Mutation** | `this.setState()`, `useState()`, or mutating drafts with Immer inside component closures. | The `update` function is a pure mathematical reducer: `Msg -> Model -> ( Model, Cmd Msg )`. Old model in, brand new immutable model out. |
| **Side-Effect Execution** | Fire async Promises, `fetch()`, or `axios` inline within `onClick` or `useEffect` hooks. | `update` returns data recipes (`Cmd Msg`). The Elm runtime executes the effect asynchronously and feeds the resulting `Msg` back into `update`. |
| **Component Hierarchy** | Nest independent stateful components, each holding its own lifecycle, reducer, and local state. | Single, centralized Model representing total application state. Views are pure projection functions (`Model -> Html Msg`). |
| **Event Dispatch** | Dispatch actions through middleware pipelines, event emitters, or context providers. | Strict single-channel message loop: UI triggers `Msg`, runtime invokes `update msg model`, view rerenders from new model. |
| **Background Listeners** | Register imperative window event listeners (`window.addEventListener`) inside lifecycle callbacks. | Declare declarative subscriptions (`Sub Msg`) via `subscriptions : Model -> Sub Msg`. The runtime attaches/detaches listeners automatically. |

---

## 4. The Pattern

### ❌ THE WRONG WAY: React/Redux-Style Inline Effects & Imperative State
Simulating async thunks, inline fetching, or unmanaged mutation within view event handlers:

```elm
module AntiPattern.TeaBypass exposing (..)

-- ANTI-PATTERN: Attempting to treat messages as async action functions
-- (This does not compile in Elm: Msg must be a data constructor, not an effect)
type alias Model =
    { count : Int
    , userData : Maybe String
    }

-- WRONG: Trying to perform I/O inside the message constructor
type BadMsg
    = FetchUserWithCallback (String -> BadMsg)
    | MutateInline (Model -> Model)

-- WRONG: update cannot execute Promises or async callbacks
updateBad : BadMsg -> Model -> Model
updateBad msg model =
    case msg of
        MutateInline transform ->
            transform model -- Unsafe imperative state transformation

        FetchUserWithCallback _ ->
            model
```

---

### ✅ THE RIGHT WAY: Pure Model-Update-View Loop with Managed Commands

```elm
module Idiomatic.CounterWithFetch exposing
    ( Model
    , Msg(..)
    , init
    , main
    , subscriptions
    , update
    , view
    )

import Browser
import Html exposing (Html, button, div, h2, p, text)
import Html.Events exposing (onClick)
import Http
import Json.Decode as Decode

-- 1. MODEL: Single source of truth

type Status
    = Idle
    | Fetching
    | Failure String
    | Success String

type alias Model =
    { count : Int
    , status : Status
    }

init : () -> ( Model, Cmd Msg )
init _ =
    ( { count = 0
      , status = Idle
      }
    , Cmd.none
    )

-- 2. MESSAGES: Pure, declarative intent

type Msg
    = IncrementClicked
    | DecrementClicked
    | FetchFactRequested
    | FactReceived (Result Http.Error String)

-- 3. UPDATE: Pure transition function emitting state and declarative commands

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        IncrementClicked ->
            ( { model | count = model.count + 1 }, Cmd.none )

        DecrementClicked ->
            ( { model | count = model.count - 1 }, Cmd.none )

        FetchFactRequested ->
            ( { model | status = Fetching }
            , fetchNumberFact model.count
            )

        FactReceived (Ok fact) ->
            ( { model | status = Success fact }, Cmd.none )

        FactReceived (Err _) ->
            ( { model | status = Failure "Could not retrieve fact." }, Cmd.none )

-- Declarative HTTP Command builder (pure function returning Cmd Msg)
fetchNumberFact : Int -> Cmd Msg
fetchNumberFact number =
    Http.get
        { url = "http://numbersapi.com/" ++ String.fromInt number
        , expect = Http.expectString FactReceived
        }

-- 4. VIEW: Pure function projecting state to HTML

view : Model -> Html Msg
view model =
    div []
        [ h2 [] [ text ("Current Count: " ++ String.fromInt model.count) ]
        , button [ onClick DecrementClicked ] [ text "-" ]
        , button [ onClick IncrementClicked ] [ text "+" ]
        , button [ onClick FetchFactRequested ] [ text "Get Fact for Number" ]
        , viewStatus model.status
        ]

viewStatus : Status -> Html Msg
viewStatus status =
    case status of
        Idle ->
            p [] [ text "Click button to fetch a trivia fact." ]

        Fetching ->
            p [] [ text "Loading trivia..." ]

        Failure err ->
            p [] [ text ("Error: " ++ err) ]

        Success fact ->
            p [] [ text ("Fact: " ++ fact) ]

-- 5. SUBSCRIPTIONS & ENTRY POINT

subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none

main : Program () Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }
```
