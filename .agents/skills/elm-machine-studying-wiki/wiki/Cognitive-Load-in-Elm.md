# Cognitive Load in Elm: Code is the Easy Part

## 1. The Sovereign Law
Code is the easy part of software engineering; long-term codebase viability demands minimizing cognitive load through explicit data flow, readable architectures, and direct communication over clever abstractions.

## 2. The Trigger & Context
When teams build large frontend systems, developers often succumb to **Maintenance Fatigue** and **Cleverness Sprawl**. In an effort to eliminate perceived boilerplate or construct "reusable component frameworks," developers introduce complex meta-abstractions: extensible record gymnastics, higher-order update functions, dynamic message dispatching, and generalized wrapper types.

This triggers severe architectural friction:
- **Mental Graph Explosion:** To understand a single UI event or state mutation, an engineer must mentally unpack multiple layers of generic wrappers, polymorphic update helpers, and parameterized messages.
- **Compiler Indirection:** When type errors occur in deeply parameterized or higher-order code, the Elm compiler's usually crystalline error messages degrade into sprawling type unifications that are difficult to decipher.
- **Onboarding & Collaboration Paralysis:** New engineers cannot reason locally about a feature; understanding one view requires holding the entire meta-framework in working memory.
- **API Churn & Friction:** Chasing theoretical purity or prematurely abstracting components leads to constant breaking changes, high upgrade costs, and team burnout.

As Evan Czaplicki emphasizes in *Code is the Easy Part*, writing code is trivial compared to the human and cognitive effort required to read, maintain, collaborate on, and evolve software over years.

## 3. Developer Intent vs. Elm Semantics

| Paradigm / Ecosystem | Developer Intent & Assumption | Elm Semantics & Reality |
| :--- | :--- | :--- |
| **JavaScript / React / Redux** | Strives to build generic, dynamic component frameworks where components encapsulate their own state, lifecycle, and message handling to maximize DRY (Don't Repeat Yourself) reuse. | Elm views UI as pure functions over data (`Model -> Html Msg`). Encapsulation at the component level fragments the single source of truth. Repetition of simple, explicit code is dramatically cheaper than the wrong abstraction. |
| **Haskell / Pure FP** | Strives to introduce typeclasses, monad transformers, category theory constructs, and generalized lenses to make code maximally terse and mathematically unified. | Elm intentionally omits typeclasses and meta-programming. Elm prioritizes readability for humans over theoretical brevity. Code is read ten times more often than it is written; explicit data transformation wins over terse type-level wizardry. |
| **OOP / Middleware** | Strives to intercept and route actions through dynamic dispatchers, event buses, or generic plugins to decouple producers from consumers. | The Elm Architecture (TEA) enforces strict, centralized, explicit data flow. Every `Msg` is a concrete custom type variant handled in an exhaustive pattern match in `update`. Decoupling via indirection destroys traceability and explodes cognitive load. |

## 4. The Pattern

### ❌ THE WRONG WAY: Clever Meta-Abstractions & Indirection
Attempting to build a "generic configurable widget" with polymorphic state updates, parameterized messages, and opaque higher-order handlers that obscure data flow.

```elm
module AntiPattern.CleverWidget exposing (..)

import Html exposing (Html, button, div, text)
import Html.Events exposing (onClick)

-- WRONG: Generic parameterized wrapper attempting to mimic OOP/React component encapsulation
type alias GenericWidget config state msg =
    { config : config
    , state : state
    , update : msg -> state -> ( state, Cmd msg )
    , view : state -> (msg -> msg) -> Html msg
    }

-- Over-engineered extensible record and higher-order message wrapper
type WidgetMsg innerMsg
    = DynamicAction (innerMsg -> innerMsg)
    | Nested (List (WidgetMsg innerMsg))

-- Opaque update logic where control flow cannot be traced statically
updateWidget : WidgetMsg a -> a -> a
updateWidget msg state =
    case msg of
        DynamicAction transform ->
            transform state

        Nested _ ->
            state
```

### ✅ THE RIGHT WAY: Explicit Data Flow & Flat Architecture
Direct, concrete types, explicit message variants, and straightforward top-to-bottom pattern matching. Any engineer can trace the entire lifecycle in seconds with near-zero cognitive overhead.

```elm
module Idiomatic.FilterPanel exposing (Model, Msg(..), init, update, view)

import Html exposing (Html, button, div, span, text)
import Html.Events exposing (onClick)

-- 1. Explicit, transparent model
type Filter
    = All
    | Unread
    | Starred

type alias Model =
    { currentFilter : Filter
    , itemCount : Int
    }

init : Model
init =
    { currentFilter = All
    , itemCount = 0
    }

-- 2. Explicit, concrete messages (zero indirection)
type Msg
    = FilterSelected Filter
    | ResetFilterClicked

-- 3. Direct, exhaustive pattern matching
update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        FilterSelected newFilter ->
            ( { model | currentFilter = newFilter }, Cmd.none )

        ResetFilterClicked ->
            ( { model | currentFilter = All }, Cmd.none )

-- 4. Pure, direct view function
view : Model -> Html Msg
view model =
    div []
        [ renderFilterButton "All" All model.currentFilter
        , renderFilterButton "Unread" Unread model.currentFilter
        , renderFilterButton "Starred" Starred model.currentFilter
        , button [ onClick ResetFilterClicked ] [ text "Reset" ]
        , span [] [ text (" (" ++ String.fromInt model.itemCount ++ " items)") ]
        ]

renderFilterButton : String -> Filter -> Filter -> Html Msg
renderFilterButton label targetFilter activeFilter =
    let
        isActive =
            targetFilter == activeFilter
    in
    button
        [ onClick (FilterSelected targetFilter) ]
        [ text (if isActive then "[" ++ label ++ "]" else label) ]
```
