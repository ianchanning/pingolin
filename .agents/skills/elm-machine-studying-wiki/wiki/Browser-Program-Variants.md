# Browser Program Variants & Topology

## 1. The Sovereign Law
Application topology and runtime capabilities are statically determined by the chosen `Browser` program variant: `sandbox` (pure, isolated state without effects), `element` (embedded DOM component with flags, commands, and subscriptions), `document` (full page control with title and body), or `application` (full Single Page Application with URL routing and history navigation).

## 2. The Trigger & Context
Developers frequently select the wrong `Browser` constructor when initiating or scaling Elm projects, triggering compiler type mismatches and architectural dead ends:
- **Attempting Side-Effects in `Browser.sandbox`:** Calling HTTP requests, random generators, or ports from a sandbox triggers type errors because `sandbox`'s `update` signature is `Msg -> Model -> Model` (cannot emit `Cmd Msg`).
- **Attempting SPA Routing in `Browser.element`:** Trying to capture browser back/forward buttons or URL changes inside `Browser.element` fails because URL lifecycle hooks are exclusive to `Browser.application`.
- **Title Control Friction in `Browser.element`:** Trying to set `<title>` from an embedded element without port plumbing fails; `Browser.document` or `Browser.application` is required.
- **Flags Decoding Failure at Startup:** Supplying dynamic JSON flags without proper decoders in `Browser.element` crashes initialization before `init` is reached.

---

## 3. Developer Intent vs. Elm Semantics

| Program Variant | Intended Use Case | `init` Signature | `view` Signature | Managed Effects (`Cmd` / `Sub`) | URL & Navigation Control |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`Browser.sandbox`** | Prototyping, purely visual widgets, learning TEA. | `Model` | `Model -> Html Msg` | ❌ None (`Cmd.none` not needed) | ❌ None |
| **`Browser.element`** | Embedding Elm inside existing React/HTML pages, micro-frontends, widgets with JS interop. | `flags -> ( Model, Cmd Msg )` | `Model -> Html Msg` | ✅ Full (`Cmd Msg`, `Sub Msg`, Ports) | ❌ None (Parent page controls URL) |
| **`Browser.document`** | Full-page multi-page apps without client-side routing (server handles routing). | `flags -> ( Model, Cmd Msg )` | `Model -> Browser.Document Msg` (`{ title : String, body : List (Html Msg) }`) | ✅ Full (`Cmd Msg`, `Sub Msg`, Ports) | ❌ None |
| **`Browser.application`** | Production Single Page Applications (SPAs) controlling URL changes and browser history. | `flags -> Url.Url -> Nav.Key -> ( Model, Cmd Msg )` | `Model -> Browser.Document Msg` | ✅ Full (`Cmd Msg`, `Sub Msg`, Ports) | ✅ Complete (`onUrlRequest`, `onUrlChange`, `Nav.pushUrl`) |

---

## 4. The Pattern

### ❌ THE WRONG WAY: Attempting Side-Effects in `Browser.sandbox`
Trying to execute HTTP commands or use ports inside a sandbox program halts compilation:

```elm
module AntiPattern.SandboxWithEffects exposing (..)

import Browser
import Html exposing (Html, button, div, text)
import Html.Events exposing (onClick)

type alias Model = Int
type Msg = FetchData

-- COMPILER ERROR: sandbox update must return Model, NOT (Model, Cmd Msg)
updateBad : Msg -> Model -> ( Model, Cmd Msg )
updateBad msg model =
    case msg of
        FetchData ->
            ( model, Cmd.none ) -- FAILS: sandbox does not accept Cmd Msg!
```

---

### ✅ THE RIGHT WAY: Modern Elm 0.19.1 Program Implementations

#### 1. Embedded Widget (`Browser.element`)
Ideal for embedding inside a legacy page or React container, receiving JS flags and emitting commands:

```elm
module Widgets.UserProfile exposing (Model, Msg, main)

import Browser
import Html exposing (Html, div, h3, text)
import Http
import Json.Decode as Decode

type alias Flags =
    { userId : Int
    , apiToken : String
    }

type alias Model =
    { userId : Int
    , token : String
    , status : String
    }

type Msg
    = GotData (Result Http.Error String)

init : Flags -> ( Model, Cmd Msg )
init flags =
    ( { userId = flags.userId
      , token = flags.apiToken
      , status = "Initializing..."
      }
    , Cmd.none
    )

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GotData (Ok response) ->
            ( { model | status = response }, Cmd.none )

        GotData (Err _) ->
            ( { model | status = "Error loading user." }, Cmd.none )

view : Model -> Html Msg
view model =
    div []
        [ h3 [] [ text ("User: " ++ String.fromInt model.userId) ]
        , text model.status
        ]

main : Program Flags Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = \_ -> Sub.none
        }
```

#### 2. Production SPA Entry Point (`Browser.application`)
Manages browser navigation keys, URL request intercepts, and dynamic document titles:

```elm
module Main exposing (Model, Msg(..), init, main, update, view)

import Browser
import Browser.Navigation as Nav
import Html exposing (Html, a, div, h1, text)
import Html.Attributes exposing (href)
import Url

type alias Model =
    { key : Nav.Key
    , url : Url.Url
    , pageTitle : String
    }

type Msg
    = LinkClicked Browser.UrlRequest
    | UrlChanged Url.Url

init : () -> Url.Url -> Nav.Key -> ( Model, Cmd Msg )
init _ url key =
    ( { key = key
      , url = url
      , pageTitle = "Pinboard Reorg - Home"
      }
    , Cmd.none
    )

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        LinkClicked urlRequest ->
            case urlRequest of
                Browser.Internal url ->
                    ( model, Nav.pushUrl model.key (Url.toString url) )

                Browser.External href ->
                    ( model, Nav.load href )

        UrlChanged url ->
            ( { model | url = url, pageTitle = "Route: " ++ url.path }
            , Cmd.none
            )

view : Model -> Browser.Document Msg
view model =
    { title = model.pageTitle
    , body =
        [ div []
            [ h1 [] [ text model.pageTitle ]
            , a [ href "/dashboard" ] [ text "Go to Dashboard" ]
            ]
        ]
    }

main : Program () Model Msg
main =
    Browser.application
        { init = init
        , view = view
        , update = update
        , subscriptions = \_ -> Sub.none
        , onUrlRequest = LinkClicked
        , onUrlChange = UrlChanged
        }
```
