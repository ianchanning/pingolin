# Elm Language Evolution Principles

## 1. The Sovereign Law
Language and library evolution must prioritize long-term ecosystem sustainability and cognitive stability over release velocity and package volume. Breaking changes impose a universal maintenance tax across the entire ecosystem, demanding deliberate problem distillation before API publication.

## 2. The Trigger & Context
Developers acclimated to fast-moving ecosystems (e.g., JavaScript/npm, Haskell) often equate ecosystem vitality with superficial velocity metrics: rapid release cadences, thousands of single-purpose packages, GitHub stars, and continuous churn. When language or core library releases span one to two years, misconceptions arise that development has stalled ("is Elm dead?", "is Evan killing momentum?").

Ignoring this Sovereign Law triggers severe systemic failure modes:
- **The Ecosystem Maintenance Tax:** In a purely functional ecosystem with strict semantic versioning, a breaking change to a core primitive cascades through every intermediate package down to end-user applications. Frequent minor/major breaks induce maintenance fatigue and package abandonment.
- **Premature Generalization & Ecosystem Fragmentation:** Shipping APIs before the domain's fundamental essence is understood results in leaky, bespoke abstractions (e.g., dozens of overlapping DOM measurement functions) that calcify poor mental models and force repeated breaking rewrites.
- **Cognitive Exhaustion:** Developers spend more time managing dependency upgrades, tracking framework deprecations, and navigating incompatible community packages than delivering resilient domain solutions.

## 3. Developer Intent vs. Elm Semantics

| Developer Intent (JS / React / Haskell Mindset) | Elm Architecture & Semantics |
| :--- | :--- |
| **Maximize Package Count & Velocity:** Publish early, release often, and accumulate vanity metrics (downloads, stars) as proxies for ecosystem health. | **Curated Quality & Sustainability:** 50 rock-solid, timeless packages (`elm/core`, `elm/browser`, `elm/http`, `elm/json`) trump 700,000 unstable building blocks. True health is a language that runs without modification for years. |
| **Expose Direct JavaScript Parity:** Map raw Web APIs 1:1 into Elm modules, wrapping DOM idiosyncrasies (e.g., `clientHeight`, `scrollHeight`, `offsetHeight`) in bloated record configs. | **Distilled Mental Models:** Explore the design space patiently until a unified abstraction emerges (e.g., modeling document and element scrolling alike through 3D graphics concepts: `Scene` and `Viewport`). |
| **Premature Abstraction:** Use complex typeclasses, higher-kinded types, or configurable megamorphic records to solve theoretical future requirements. | **Progressive Disclosure:** APIs start with minimal, obvious primitives (`Http.get`) and build systematically toward full power (`Http.request`), communicating affordances naturally without unnecessary complexity. |
| **Fast Breaking Upgrades as "Progress":** Ship breaking changes every quarter to iterate fast and break things. | **Surgical Invariance:** Every core release must justify the immense collective human cost required to migrate all applications and libraries across the entire ecosystem. |

## 4. The Pattern

### ❌ THE WRONG WAY: Premature, Bespoke & Leaky API Design
Publishing an unrefined API that exposes low-level DOM nuances with bespoke functions for every variation. This forces callers to navigate mismatched concepts between the root window and sub-elements, leading to immediate deprecation and ecosystem churn:

```elm
module AntiPattern.DomMeasurements exposing (..)

-- ANTI-PATTERN: Leaky, bespoke types that mirror raw JS confusion
type Boundary
    = ContentOnly
    | VisibleContent
    | VisibleContentWithBorders
    | VisibleContentWithBordersAndMargins

-- Bespoke getter functions with mismatched signatures and domain leakage
getWindowContentSize : (Float -> Float -> msg) -> Cmd msg
getWindowContentSize toMsg =
    -- Window doesn't have borders/margins, so Boundary cannot apply cleanly
    Debug.todo "Requires special window logic"

getElementSize : String -> Boundary -> (Result String { width : Float, height : Float } -> msg) -> Cmd msg
getElementSize elementId boundary toMsg =
    -- Bespoke ID-based queries with bespoke enum handling
    Debug.todo "Complex DOM querying with boundary math"

getOverallPageScroll : (Float -> Float -> msg) -> Cmd msg
getOverallPageScroll toMsg =
    Debug.todo "Bespoke page scroll"

getElementScroll : String -> (Result String { x : Float, y : Float } -> msg) -> Cmd msg
getElementScroll elementId toMsg =
    Debug.todo "Bespoke element scroll"
```

---

### ✅ THE RIGHT WAY: Unified Mental Model & Progressive Task Primitives
After deliberate exploration and whiteboard synthesis, Elm unifies window and element geometry under the 3D graphics concept of **Scene** and **Viewport** in modern `Browser.Dom` (Elm 0.19.1). The API is minimal, orthogonal, and stable for years:

```elm
module Idiomatic.DomViewport exposing
    ( Model
    , Msg(..)
    , init
    , update
    , scrollToElementTop
    )

import Browser.Dom as Dom
import Task

type alias Model =
    { windowViewport : Maybe Dom.Viewport
    , chatBoxElement : Maybe Dom.Element
    , errorMessage : Maybe String
    }

type Msg
    = GotWindowViewport Dom.Viewport
    | GotChatBoxElement Dom.Element
    | DomError Dom.Error
    | ScrollResetComplete

init : ( Model, Cmd Msg )
init =
    ( { windowViewport = Nothing
      , chatBoxElement = Nothing
      , errorMessage = Nothing
      }
    , Task.perform GotWindowViewport Dom.getViewport
    )

type alias ElementId =
    String

-- Unified Task-based operations that compose predictably
scrollToElementTop : ElementId -> Cmd Msg
scrollToElementTop id =
    Dom.getElement id
        |> Task.andThen (\elem -> Dom.setViewportOf id 0 0)
        |> Task.attempt
            (\res ->
                case res of
                    Ok () ->
                        ScrollResetComplete

                    Err err ->
                        DomError err
            )

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GotWindowViewport vp ->
            ( { model | windowViewport = Just vp }, Cmd.none )

        GotChatBoxElement elem ->
            ( { model | chatBoxElement = Just elem }, Cmd.none )

        DomError (Dom.NotFound id) ->
            ( { model | errorMessage = Just ("DOM Element not found: " ++ id) }, Cmd.none )

        ScrollResetComplete ->
            ( model, Cmd.none )
```
