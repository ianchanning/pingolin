# JavaScript Interop: Ports, Flags & Custom Elements

## 1. The Sovereign Law
JavaScript interop in Elm is strictly sandboxed across three distinct, immutable boundary protocols: initialization **Flags** for startup state (decoded defensively via `Json.Decode.Value`), asynchronous **Ports** (`port outgoing : Value -> Cmd msg`, `port incoming : (Value -> msg) -> Sub msg`) for decoupled message passing, and **Custom Elements** (Web Components) as synchronous DOM escape hatches. Userland Native/Kernel code is permanently barred.

## 2. The Trigger & Context
Developers arriving from JavaScript or TypeScript attempt to invoke JavaScript functions synchronously, expecting direct return values or shared memory:
- **The Synchronous Port Illusion:** Attempting to define a port that returns a value (`port getLocalStorage : String -> String`). In Elm, all ports are strictly asynchronous fire-and-forget commands or subscription listeners.
- **Startup Crash via Fragile Flags:** Defining `flags` in `init : Flags -> ...` as a concrete record. If JavaScript passes `null`, `undefined`, or a slightly mismatched schema, the entire Elm application crashes instantly before rendering the first frame.
- **Complex UI Widget Deadlock:** Attempting to manage rich JavaScript DOM libraries (e.g., CodeMirror, Chart.js, Google Maps, QR scanners) via continuous port roundtrips instead of encapsulating them within a Web Component (Custom Element).

---

## 3. Developer Intent vs. Elm Semantics

| Dimension | JavaScript / TS Intuition | Elm 0.19.1 Sovereign Semantics |
| :--- | :--- | :--- |
| **JS Function Invocation** | Call `window.someJsFunction()` and await synchronous return. | Emit a `Cmd msg` via an outgoing port. JS listens via `app.ports.outgoing.subscribe(...)` and optionally sends data back via an incoming port subscription. |
| **Startup Configuration** | Pass global config object directly to application instance. | Pass `flags` to `Elm.Main.init({ flags: ... })`. The Elm app receives `Json.Decode.Value` and explicitly decodes it in `init`, providing graceful fallback on corrupt storage. |
| **DOM Widgets** | Imperatively query and mutate DOM nodes via `document.getElementById()`. | Render a Custom Element tag (`node "qr-code" [ attribute "data" str ] []`). The browser's standard Web Component lifecycle manages DOM mutation. |
| **Safety Guarantees** | Runtime exceptions if JS types mismatch or dependencies fail. | Elm runtime guarantees zero crashes. Malformed port/flag messages are rejected safely at the boundary. |

---

## 4. The Pattern

### ❌ THE WRONG WAY: Fragile Typed Flags & Synchronous Port Assumptions

```elm
module AntiPattern.Interop exposing (..)

-- ANTI-PATTERN: Typed flags crash runtime if localStorage is null/corrupt
type alias BrokenFlags =
    { authToken : String
    , userSettings : { theme : String }
    }

-- If JS runs: Elm.Main.init({ flags: { authToken: null } })
-- The entire application crashes with an uncatchable browser error!
initBad : BrokenFlags -> ( (), Cmd msg )
initBad flags =
    ( (), Cmd.none )
```

---

### ✅ THE RIGHT WAY: Resilient Flags, Typed Ports & Custom Elements

#### 1. Resilient Initialization with `Json.Decode.Value` (`Main.elm`)

```elm
module Main exposing (Flags, Model, Msg(..), init, main)

import Browser
import Html exposing (Html, div, text)
import Json.Decode as Decode exposing (Decoder)

type alias Model =
    { token : Maybe String
    , theme : String
    , status : String
    }

type Msg
    = NoOp

-- 1. Accept untyped Value to prevent runtime boot crashes
init : Decode.Value -> ( Model, Cmd Msg )
init flagsValue =
    case Decode.decodeValue flagsDecoder flagsValue of
        Ok flags ->
            ( { token = flags.token
              , theme = flags.theme
              , status = "Loaded from storage"
              }
            , Cmd.none
            )

        Err _ ->
            -- Graceful fallback on missing or corrupt localStorage
            ( { token = Nothing
              , theme = "dark"
              , status = "Initialized with default settings"
              }
            , Cmd.none
            )

type alias Flags =
    { token : Maybe String
    , theme : String
    }

flagsDecoder : Decoder Flags
flagsDecoder =
    Decode.map2 Flags
        (Decode.field "token" (Decode.nullable Decode.string))
        (Decode.field "theme" Decode.string)

view : Model -> Html Msg
view model =
    div [] [ text ("App Status: " ++ model.status ++ " | Theme: " ++ model.theme) ]

main : Program Decode.Value Model Msg
main =
    Browser.element
        { init = init
        , update = \_ m -> ( m, Cmd.none )
        , view = view
        , subscriptions = \_ -> Sub.none
        }
```

#### 2. Clean Port Boundary Definition (`Ports.elm`)

```port module Ports exposing
    ( playNotificationSound
    , receiveStorageUpdate
    , saveAuthToken
    )

import Json.Encode as Encode

-- Outgoing commands (Elm -> JavaScript)
port saveToken : String -> Cmd msg
port playAudio : String -> Cmd msg

-- Incoming subscriptions (JavaScript -> Elm)
port onStorageChanged : (String -> msg) -> Sub msg

saveAuthToken : String -> Cmd msg
saveAuthToken token =
    saveToken token

playNotificationSound : String -> Cmd msg
playNotificationSound soundName =
    playAudio soundName

receiveStorageUpdate : (String -> msg) -> Sub msg
receiveStorageUpdate toMsg =
    onStorageChanged toMsg
```

#### 3. Custom Elements (Web Components) for Synchronous DOM (`QrCode.elm`)

```elm
module Ui.QrCode exposing (view)

import Html exposing (Html, node)
import Html.Attributes exposing (attribute)

{-| Renders a custom element `<qr-code data="..."></qr-code>`.
The JavaScript Custom Element handles rendering without port roundtrips.
-}
view : String -> Html msg
view dataString =
    node "qr-code"
        [ attribute "data" dataString
        , attribute "size" "256"
        ]
        []
```

#### 4. JavaScript Companion Bridge (`index.html`)

```html
<!DOCTYPE html>
<html>
<head>
  <script src="elm.js"></script>
  <script>
    // 1. Web Component Custom Element definition
    class QrCodeElement extends HTMLElement {
      connectedCallback() {
        this.render();
      }
      static get observedAttributes() { return ['data', 'size']; }
      attributeChangedCallback() { this.render(); }
      render() {
        const data = this.getAttribute('data') || '';
        this.innerHTML = `[QR: ${data}]`; // Render with canvas/library
      }
    }
    customElements.define('qr-code', QrCodeElement);

    window.addEventListener('DOMContentLoaded', () => {
      // 2. Safe flags extraction with fallback
      const flags = {
        token: localStorage.getItem('token'),
        theme: localStorage.getItem('theme') || 'dark'
      };

      // 3. Initialize Elm
      const app = Elm.Main.init({
        node: document.getElementById('elm-root'),
        flags: flags
      });

      // 4. Handle Ports
      app.ports.saveToken.subscribe((token) => {
        localStorage.setItem('token', token);
      });

      app.ports.playAudio.subscribe((sound) => {
        new Audio(`/sounds/${sound}.mp3`).play();
      });
    });
  </script>
</head>
<body>
  <div id="elm-root"></div>
</body>
</html>
```
