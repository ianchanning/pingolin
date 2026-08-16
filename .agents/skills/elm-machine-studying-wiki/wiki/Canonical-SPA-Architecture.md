# Canonical Production SPA Architecture

## 1. The Sovereign Law
Production Elm SPAs structure multi-page applications by delegating active screen state and commands to independent page modules (`Page.Home`, `Page.Article`) through a top-level `Model.page` sum type, while threading immutable shared credentials (`Session` / `Viewer`) explicitly through page initializers and update functions.

## 2. The Trigger & Context
When scaling Elm applications beyond a few views, developers without a canonical SPA architectural reference commit one of two severe architectural errors:
- **The Megamorphic Monolithic Model:** Placing all state fields for 20 distinct pages directly into a single top-level `Model` record. This creates an unmaintainable 500-field record where 95% of the fields are irrelevant to the currently active page.
- **Nested Component Tree Mania:** Attempting to build React-style component hierarchies where pages contain sub-components that contain sub-sub-components, each running nested TEA loops and requiring tedious parent-child message plumbing.
- **Global Mutable Session State:** Attempting to store authentication tokens in mutable global state or local storage singletons rather than threading an explicit `Session` record through page transitions.

---

## 3. Developer Intent vs. Elm Semantics

| Dimension | JavaScript / React / Redux SPA | Canonical Elm SPA (RealWorld Pattern) |
| :--- | :--- | :--- |
| **Active Screen State** | React components mount/unmount and store internal state in component hooks or Redux slices. | Top-level `Model` contains a closed sum type: `type Page = Home Page.Home.Model \| Settings Page.Settings.Model \| NotFound`. Switching routes atomically drops old page state. |
| **Authentication & Session** | Global React Context or Redux store accessible anywhere via `useAuth()` or `useSelector()`. | Explicit `Session` / `Viewer` data structure passed as an argument to `Page.init`, `Page.update`, and `Page.view`. |
| **Page Message Routing** | Actions dispatched directly to global Redux store or local setState. | Top-level `Msg` wraps page messages (`GotHomeMsg Page.Home.Msg`). `update` delegates to `Page.Home.update` and lifts commands via `Cmd.map GotHomeMsg`. |
| **Layout & Document Chrome** | Layout components (`<Header><Sidebar>{children}</Sidebar></Header>`) wrapping routed views. | Centralized `view` in `Main.elm` wraps page views inside a unified layout frame (`viewHeader`, `viewFooter`), returning `Browser.Document Msg`. |

---

## 4. The Pattern

### ❌ THE WRONG WAY: Megamorphic Flattened Model
Storing state for every page simultaneously in one giant record invites state corruption and impossible combinations:

```elm
module AntiPattern.MegaModel exposing (..)

-- ANTI-PATTERN: Megamorphic model retaining state for all pages simultaneously
type alias BadModel =
    { activeRoute : String
    -- Home page fields
    , homeFeedItems : List String
    , homeLoading : Bool
    -- Profile page fields
    , profileUsername : String
    , profileBio : String
    -- Settings page fields
    , settingsTheme : String
    , settingsNotifications : Bool
    -- 40 other page fields...
    }
```

---

### ✅ THE RIGHT WAY: Canonical Page Module Delegation with Shared Session

#### 1. The Shared Session & Viewer (`Session.elm`)

```elm
module Session exposing (Session, Viewer, fromViewer, navKey, viewer)

import Browser.Navigation as Nav

type alias Viewer =
    { username : String
    , token : String
    }

type Session
    = LoggedIn Nav.Key Viewer
    | Guest Nav.Key

navKey : Session -> Nav.Key
navKey session =
    case session of
        LoggedIn key _ ->
            key

        Guest key ->
            key

viewer : Session -> Maybe Viewer
viewer session =
    case session of
        LoggedIn _ v ->
            Just v

        Guest _ ->
            Nothing

fromViewer : Nav.Key -> Maybe Viewer -> Session
fromViewer key maybeViewer =
    case maybeViewer of
        Just v ->
            LoggedIn key v

        Nothing ->
            Guest key
```

#### 2. Isolated Page Module (`Page/Home.elm`)

```elm
module Page.Home exposing (Model, Msg, init, update, view)

import Html exposing (Html, div, h2, p, text)
import Session exposing (Session)

type alias Model =
    { session : Session
    , feed : List String
    }

type Msg
    = RefreshClicked

init : Session -> ( Model, Cmd Msg )
init session =
    ( { session = session
      , feed = [ "Elm 0.19.1 Ground Truth", "Machine Studying Activated" ]
      }
    , Cmd.none
    )

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        RefreshClicked ->
            ( model, Cmd.none )

view : Model -> Html Msg
view model =
    div []
        [ h2 [] [ text "Home Feed" ]
        , div [] (List.map (\item -> p [] [ text item ]) model.feed)
        ]
```

#### 3. Top-Level SPA Orchestrator (`Main.elm`)

```elm
module Main exposing (Model, Msg(..), init, main, update, view)

import Browser
import Browser.Navigation as Nav
import Html exposing (Html, a, div, footer, header, nav, text)
import Html.Attributes exposing (href)
import Page.Home as Home
import Route exposing (Route)
import Session exposing (Session, Viewer)
import Url

type PageModel
    = HomePage Home.Model
    | NotFoundPage Session

type alias Model =
    { session : Session
    , page : PageModel
    }

type Msg
    = LinkClicked Browser.UrlRequest
    | UrlChanged Url.Url
    | GotHomeMsg Home.Msg

init : Maybe Viewer -> Url.Url -> Nav.Key -> ( Model, Cmd Msg )
init maybeViewer url key =
    let
        session =
            Session.fromViewer key maybeViewer
    in
    changeRouteTo (Route.fromUrl url) { session = session, page = NotFoundPage session }

changeRouteTo : Route -> Model -> ( Model, Cmd Msg )
changeRouteTo route model =
    case route of
        Route.Home ->
            let
                ( homeModel, homeCmd ) =
                    Home.init model.session
            in
            ( { model | page = HomePage homeModel }
            , Cmd.map GotHomeMsg homeCmd
            )

        Route.NotFound ->
            ( { model | page = NotFoundPage model.session }
            , Cmd.none
            )

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case ( msg, model.page ) of
        ( LinkClicked urlRequest, _ ) ->
            case urlRequest of
                Browser.Internal url ->
                    ( model, Nav.pushUrl (Session.navKey model.session) (Url.toString url) )

                Browser.External href ->
                    ( model, Nav.load href )

        ( UrlChanged url, _ ) ->
            changeRouteTo (Route.fromUrl url) model

        ( GotHomeMsg homeMsg, HomePage homeModel ) ->
            let
                ( nextHomeModel, homeCmd ) =
                    Home.update homeMsg homeModel
            in
            ( { model | page = HomePage nextHomeModel }
            , Cmd.map GotHomeMsg homeCmd
            )

        ( _, _ ) ->
            ( model, Cmd.none )

view : Model -> Browser.Document Msg
view model =
    { title = "Pinboard Reorg - Production SPA"
    , body =
        [ header []
            [ nav []
                [ a [ href "/" ] [ text "Home" ]
                ]
            ]
        , case model.page of
            HomePage homeModel ->
                Html.map GotHomeMsg (Home.view homeModel)

            NotFoundPage _ ->
                div [] [ text "404 - Page Not Found" ]
        , footer [] [ text "Powered by Sovereign Elm 0.19.1" ]
        ]
    }

main : Program (Maybe Viewer) Model Msg
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
