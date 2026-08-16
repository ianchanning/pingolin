# Elm 0.19 Breaking Changes & Migration

## 1. The Sovereign Law
Elm 0.19 enforces absolute type specificity, pure AST dead-code elimination, and hermetic package boundaries: polymorphic `toString` is abolished in favor of explicit monomorphic formatters, legacy `elm-lang/*` packages are replaced by distilled `elm/*` modules, and all userland native JavaScript escapes are permanently barred.

## 2. The Trigger & Context
Upgrading from Elm 0.18 or applying legacy habits to Elm 0.19.1 results in immediate compiler rejection across multiple foundational subsystems:

1. **Purge of Polymorphic `toString`:**
   - *Compiler Error:* `I cannot find a 'toString' variable.`
   - *Context:* In 0.18, `toString : a -> String` acted as a universal escape hatch, serializing any runtime value (Ints, Floats, Custom Types, Functions, Records). In 0.19, this is split into explicit monomorphic converters (`String.fromInt`, `String.fromFloat`), domain-specific formatting functions, or `Debug.toString` (strictly restricted to development).
2. **Package Ecosystem & Namespace Migration:**
   - *Compiler Error:* `CORRUPT ELM.JSON` / `I cannot find package elm-lang/core`.
   - *Context:* The `elm-lang/*` namespace and `elm-package.json` are completely deprecated. Official packages moved to `elm/*` (e.g., `elm/core`, `elm/html`, `elm/http`, `elm/json`, `elm/browser`, `elm/url`) and experimental libraries to `elm-explorations/*`.
3. **Purge of Userland Native/Kernel JavaScript:**
   - *Compiler Error:* `MODULE NOT ALLOWED NATIVE/KERNEL CODE`.
   - *Context:* In 0.18, community packages could contain unvalidated `Native/*.js` files, allowing runtime crashes (`undefined is not a function`). In 0.19, only vetted core packages may contain Kernel code; all application-level JS interop must use Ports or Custom Elements.
4. **Dead Code Elimination (DCE) & `--optimize` Invariants:**
   - *Compiler Error:* `DEBUG REMNANTS: You cannot use Debug functions with --optimize.`
   - *Context:* Elm 0.19 introduces whole-program AST dead code elimination, generating tiny JavaScript bundles by stripping unused record fields, uncalled constructors, and dead branches. Passing `--optimize` forbids all `Debug.*` functions (`Debug.log`, `Debug.todo`, `Debug.toString`) to ensure pure production builds.
5. **Record Update Strictness:**
   - *Compiler Error:* `I was expecting to see an equals sign next...`
   - *Context:* The base of `{ base | field = value }` must be an unqualified, simple variable identifier. Nested record updates, qualified bases (`{ Module.record | field = value }`), and duplicate field declarations in record literals are hard compilation errors.
6. **Unified CLI Tooling:**
   - *Context:* Standalone binaries (`elm-make`, `elm-package`, `elm-repl`, `elm-reactor`) are unified into a single command dispatcher (`elm make`, `elm install`, `elm repl`, `elm reactor`).

## 3. Developer Intent vs. Elm Semantics

| Developer Intent (0.18 / JS / Haskell Mindset) | Elm 0.19.1 Sovereign Semantics |
| :--- | :--- |
| **Universal String Serialization:** Use `toString value` to display integers, floats, and custom types directly in UI templates. | **Explicit Type Conversion:** Use `String.fromInt`, `String.fromFloat`, or write deliberate `case ... of` display helpers. `Debug.toString` is strictly for diagnostic logging and is stripped in production. |
| **Monolithic `elm-lang/core` & Global Runtime:** Rely on implicit application wiring through `Html.App.program` and ad-hoc window subscriptions. | **Modular `elm/browser` & `elm/url`:** Explicitly declare application topology via `Browser.sandbox`, `Browser.element`, `Browser.document`, or `Browser.application` with structured URL routing. |
| **Arbitrary JS Interop via Native Code:** Package arbitrary NPM libraries by slipping unverified `Native/*.js` files into userland packages. | **Guaranteed Runtime Immortality:** Interop is strictly sandboxed through typed Ports and DOM Custom Elements. Zero runtime exceptions guaranteed across the package repository. |
| **External Bundler Tree-Shaking:** Rely on Webpack or Babel plugins to heuristically remove unused JS code. | **Compiler-Level AST DCE:** Elm compiler emits pure, minifier-optimized JS (`elm make --optimize`) that eliminates uncalled constructors and unused record fields without bundler heuristic guesswork. |
| **Complex Record Update Chaining:** Perform inline nested updates `{ model | user = { model.user | name = "Nyx" } }` or update expressions `{ getRecord () | count = 1 }`. | **Strict Base Variable Invariant:** Record update base must be a flat, local variable. Nested mutations require explicit intermediate `let` bindings or sub-record constructors. |

## 4. The Pattern

### ❌ THE WRONG WAY: Legacy Elm 0.18 Anti-Patterns

```elm
-- 0.18 LEGACY (Will NOT compile in Elm 0.19+)
module LegacyApp exposing (..)

import Html exposing (Html, div, text)
import Html.App as App -- REMOVED: Replaced by Browser module
import String exposing (toUpper)

type Status
    = Pending
    | Active Int
    | Completed

type alias Model =
    { count : Int
    , score : Float
    , status : Status
    }

init : ( Model, Cmd Msg )
init =
    ( { count = 0, score = 98.6, status = Pending }, Cmd.none )

type Msg
    = Increment

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Increment ->
            -- ANTI-PATTERN: In 0.18, record update base expressions could be convoluted
            ( { model | count = model.count + 1 }, Cmd.none )

view : Model -> Html Msg
view model =
    div []
        [ -- BROKEN: toString is completely removed in 0.19
          text ("Count: " ++ toString model.count)
        , text ("Score: " ++ toString model.score)
        , text ("Status: " ++ toString model.status) -- Leaks internal constructor name to UI
        ]

-- BROKEN: Html.App.program is obsolete; package is now elm/browser
main =
    App.program
        { init = init
        , update = update
        , view = view
        , subscriptions = \_ -> Sub.none
        }
```

---

### ✅ THE RIGHT WAY: Idiomatic Elm 0.19.1 Patterns

```elm
module ModernApp exposing (Model, Msg(..), Status(..), init, main, update, view)

import Browser
import Html exposing (Html, div, p, text)
import Html.Events exposing (onClick)

-- 1. Explicit domain modeling
type Status
    = Pending
    | Active Int
    | Completed

type alias Model =
    { count : Int
    , score : Float
    , status : Status
    }

init : () -> ( Model, Cmd Msg )
init _ =
    ( { count = 0
      , score = 98.6
      , status = Active 42
      }
    , Cmd.none
    )

type Msg
    = Increment
    | SetStatus Status

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Increment ->
            ( { model | count = model.count + 1 }, Cmd.none )

        SetStatus newStatus ->
            ( { model | status = newStatus }, Cmd.none )

-- 2. Explicit, monomorphic string formatting
formatStatus : Status -> String
formatStatus status =
    case status of
        Pending ->
            "Awaiting confirmation..."

        Active level ->
            "Active (Level " ++ String.fromInt level ++ ")"

        Completed ->
            "Finished"

view : Model -> Html Msg
view model =
    div []
        [ -- Monomorphic integer conversion
          p [] [ text ("Count: " ++ String.fromInt model.count) ]

        -- Monomorphic float conversion
        , p [] [ text ("Score: " ++ String.fromFloat model.score) ]

        -- Domain-specific custom type formatter
        , p [] [ text ("Status: " ++ formatStatus model.status) ]
        ]

-- 3. Modern Browser.element entry point from elm/browser
main : Program () Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = \_ -> Sub.none
        }
```

---

### 📦 Build & Package Configuration Invariants

#### 1. Package Manifest (`elm.json` replacing `elm-package.json`)
Modern Elm projects use `elm.json` with explicit package namespaces:

```json
{
    "type": "application",
    "source-directories": [
        "src"
    ],
    "elm-version": "0.19.1",
    "dependencies": {
        "direct": {
            "elm/browser": "1.0.2",
            "elm/core": "1.0.5",
            "elm/html": "1.0.0",
            "elm/http": "2.0.0",
            "elm/json": "1.1.3",
            "elm/url": "1.0.0"
        },
        "indirect": {
            "elm/bytes": "1.0.8",
            "elm/file": "1.0.5",
            "elm/time": "1.0.0",
            "elm/virtual-dom": "1.0.3"
        }
    },
    "test-dependencies": {
        "direct": {},
        "indirect": {}
    }
}
```

#### 2. Production Build Pipeline (`--optimize` + Minification)
To achieve ultra-small asset payloads, compile with `--optimize` and run through Terser with pure function compression:

```bash
# 1. Compile to optimized JavaScript (Debug.* calls must be removed)
elm make src/Main.elm --optimize --output=dist/elm.js

# 2. Minify with Terser pure_funcs to strip dead code
terser dist/elm.js --compress "pure_funcs=[F2,F3,F4,F5,F6,F7,F8,F9,A2,A3,A4,A5,A6,A7,A8,A9],pure_getters,keep_fargs=false,unsafe_comps,unsafe" --mangle --output=dist/elm.min.js
```
