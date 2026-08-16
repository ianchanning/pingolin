# SPA Navigation & URL Parsing

## 1. The Sovereign Law
Client-side routing in Elm is a deterministic two-step state machine: `onUrlRequest` intercepts user clicks into `Browser.UrlRequest` (`Internal` vs `External`), while `onUrlChange` consumes the resulting `Url.Url` to be decoded into strongly-typed `Route` sum types via `Url.Parser` combinators. Navigation commands (`Nav.pushUrl`, `Nav.replaceUrl`) strictly require an unforgeable runtime `Browser.Navigation.Key`.

## 2. The Trigger & Context
Developers arriving from JavaScript routers (e.g. React Router, Next.js) often treat routing as string pattern matching or try to trigger navigation anywhere via global hooks.

This causes immediate architectural friction:
- **Missing `Browser.Navigation.Key`:** Attempting to call `Nav.pushUrl` without a `Nav.Key` or attempting to forge a key in tests fails compilation because `Nav.Key` can only be obtained through `Browser.application` initialization.
- **Conflating `LinkClicked` with `UrlChanged`:** Mutating page state directly inside `LinkClicked` instead of delegating to `Nav.pushUrl` breaks browser back/forward history and direct URL entry.
- **Fragile Stringly-Typed Routing:** Using regex or `String.startsWith` to parse URLs creates edge-case parsing bugs, URL encoding failures, and broken query-parameter extraction.
- **External Link Traps:** Treating all links as internal SPAs causes external links (like `https://github.com`) to be erroneously intercepted by `Nav.pushUrl` instead of `Nav.load`.

---

## 3. Developer Intent vs. Elm Semantics

| Dimension | JavaScript / React Router Intent | Elm 0.19.1 Sovereign Semantics |
| :--- | :--- | :--- |
| **Route Definition** | Dynamic string templates (`/user/:id/posts?page=1`) evaluated at runtime. | Composable algebraic parsers (`s "user" </> int </> s "posts" <?> Query.int "page"`) producing a closed `Route` custom type. |
| **Link Click Handling** | `<Link to="...">` components automatically push state to browser history via global context. | All `<a>` clicks are intercepted as `Browser.UrlRequest` (`Internal url` vs `External href`). The application explicitly decides whether to push the URL, prompt confirmation, or load externally. |
| **History Navigation** | Global `history.pushState()` callable from any nested component or utility function. | `Nav.pushUrl key urlString` requires a `Nav.Key` issued exclusively to `Browser.application`, proving that the program is equipped to handle `onUrlChange`. |
| **Route State Sync** | Components listen to router context and mount/unmount accordingly. | Centralized `UrlChanged Url` message decodes the route and updates the top-level `Model.page`, providing atomic state transitions. |

---

## 4. The Pattern

### ❌ THE WRONG WAY: Stringly-Typed Manual URL Splitting (Anti-Pattern)
Using manual string splitting and regexes to determine routes leads to fragile edge cases, poor refactorability, and compiler blindness:

```elm
module AntiPattern.StringRouting exposing (..)

import Url

type Route
    = Home
    | UserProfile Int
    | NotFound

-- FRAGILE ANTI-PATTERN: Manual string manipulation
parseUrlBad : Url.Url -> Route
parseUrlBad url =
    let
        segments =
            String.split "/" url.path
    in
    case segments of
        [ "", "" ] ->
            Home

        [ "", "user", idStr ] ->
            case String.toInt idStr of
                Just id ->
                    UserProfile id

                Nothing ->
                    NotFound

        _ ->
            NotFound
```

---

### ✅ THE RIGHT WAY: Composable `Url.Parser` & `Browser.Navigation`

#### 1. Strongly-Typed Route Parser (`Route.elm`)

```elm
module Route exposing (Route(..), fromUrl, toString)

import Url
import Url.Parser as Parser exposing ((</>), (<?>), Parser, int, oneOf, s, string)
import Url.Parser.Query as Query

type Route
    = Home
    | Bookmarks (Maybe String)
    | BookmarkDetail Int
    | Settings
    | NotFound

parser : Parser (Route -> a) a
parser =
    oneOf
        [ Parser.map Home Parser.top
        , Parser.map Bookmarks (s "bookmarks" <?> Query.string "tag")
        , Parser.map BookmarkDetail (s "bookmarks" </> int)
        , Parser.map Settings (s "settings")
        ]

fromUrl : Url.Url -> Route
fromUrl url =
    Parser.parse parser url
        |> Maybe.withDefault NotFound

toString : Route -> String
toString route =
    case route of
        Home ->
            "/"

        Bookmarks maybeTag ->
            case maybeTag of
                Just tag ->
                    "/bookmarks?tag=" ++ Url.percentEncode tag

                Nothing ->
                    "/bookmarks"

        BookmarkDetail id ->
            "/bookmarks/" ++ String.fromInt id

        Settings ->
            "/settings"

        NotFound ->
            "/404"
```

#### 2. Centralized SPA Navigation Routing (`Main.elm`)

```elm
module Main exposing (Model, Msg(..), init, main, update, view)

import Browser
import Browser.Navigation as Nav
import Html exposing (Html, a, div, h1, nav, p, text)
import Html.Attributes exposing (href)
import Route exposing (Route)
import Url

type alias Model =
    { key : Nav.Key
    , currentRoute : Route
    }

type Msg
    = LinkClicked Browser.UrlRequest
    | UrlChanged Url.Url

init : () -> Url.Url -> Nav.Key -> ( Model, Cmd Msg )
init _ url key =
    ( { key = key
      , currentRoute = Route.fromUrl url
      }
    , Cmd.none
    )

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        -- Step 1: Intercept link request
        LinkClicked urlRequest ->
            case urlRequest of
                Browser.Internal url ->
                    ( model, Nav.pushUrl model.key (Url.toString url) )

                Browser.External href ->
                    ( model, Nav.load href )

        -- Step 2: Handle resulting URL change (via pushUrl, back/forward button, or reload)
        UrlChanged url ->
            ( { model | currentRoute = Route.fromUrl url }
            , Cmd.none
            )

view : Model -> Browser.Document Msg
view model =
    { title = "Pinboard Reorg SPA"
    , body =
        [ nav []
            [ a [ href (Route.toString Route.Home) ] [ text "Home" ]
            , a [ href (Route.toString (Route.Bookmarks Nothing)) ] [ text "Bookmarks" ]
            , a [ href (Route.toString Route.Settings) ] [ text "Settings" ]
            ]
        , renderPage model.currentRoute
        ]
    }

renderPage : Route -> Html Msg
renderPage route =
    case route of
        Route.Home ->
            h1 [] [ text "Welcome to Pinboard Reorg" ]

        Route.Bookmarks maybeTag ->
            div []
                [ h1 [] [ text "Bookmarks" ]
                , p [] [ text ("Filter Tag: " ++ Maybe.withDefault "All" maybeTag) ]
                ]

        Route.BookmarkDetail id ->
            h1 [] [ text ("Bookmark Detail #" ++ String.fromInt id) ]

        Route.Settings ->
            h1 [] [ text "User Settings" ]

        Route.NotFound ->
            h1 [] [ text "404 - Page Not Found" ]

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
