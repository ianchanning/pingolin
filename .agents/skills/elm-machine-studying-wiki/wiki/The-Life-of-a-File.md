# The Life of a File

## 1. The Sovereign Law
Never split code based on visual UI components or arbitrary line counts; grow single files organically until cohesive data structures and domain invariants demand extraction into opaque modules.

## 2. The Trigger & Context
Developers arriving from JavaScript and React suffer from "sneaky mutation trauma"—the learned instinct that as a file grows past 300 lines, the probability of accidental state mutation and spooky action-at-a-distance approaches 100%. Under this anxiety, developers prematurely fracture Elm applications into micro-components (`Sidebar.elm`, `Checkbox.elm`, `SettingsRow.elm`), wrapping each in a nested The Elm Architecture (TEA) triad (`Model`, `Msg`, `update`, `view`).

This creates severe architectural friction:
- **Component Explosion & Message Routing Overhead:** Wrapping child messages inside parent messages (`ParentMsg (ChildMsg SubChildMsg)`) and plumbing parent updates down creates massive, brittle boilerplate.
- **Surface-Level Unification Trap:** Grouping UI elements because they look identical (e.g., boolean settings toggles vs. fruit selection checkboxes) ignores the fact that their underlying data models, operational constraints, and domain invariants are completely different.
- **The Getter/Setter Anti-Pattern:** Creating a separate module to hide state, only to expose trivial `get...` and `set...` functions, re-exposes the implementation details and defeats encapsulation.

## 3. Developer Intent vs. Elm Semantics

| Dimension | JavaScript / React / Redux Intuition | Elm Semantics (0.19.1) |
| :--- | :--- | :--- |
| **File Size Mindset** | Short files prevent accidental mutation and cognitive overload. Big files are code smells. | Immutability guarantees $P(\text{mutation}) = 0$ at 50 or 5,000 lines. 600–1,000 line files are natural and healthy. |
| **Refactoring Cost** | Refactoring is risky, brittle, and terrifying. Architecture must be "correct up front." | Pure types and compiler-driven refactoring make restructuring trivial and safe; premature architecture is wasted effort. |
| **Unit of Reuse** | Visual UI components encapsulating local state, lifecycle, and view templates. | Pure functions for views (`viewCheckbox : Config -> Html Msg`) and opaque data structures for domain rules. |
| **Module Boundary** | Folders organized by MVC or visual sections (`components/`, `views/`, `containers/`). | Modules organized strictly around **data structures** that enforce invariants through restricted public APIs. |
| **Encapsulation** | OOP classes or modules with getters and setters for state mutation. | Opaque types (`exposing (Type, function)`) hiding constructors to enforce invariants; records when data is transparent. |

In Elm, a file should start small with a single record and simple TEA functions. As requirements grow:
1. First, extract visual repetition into local helper functions (e.g., `viewField : ... -> Html Msg`).
2. When fields in the `Model` develop dependencies or cross-field validation rules (e.g., `autoplay` enabling `audioSettings`), re-model the data structure (e.g., using custom types or dedicated sub-records).
3. Only extract a new module when a distinct **data structure with business invariants** crystallizes (e.g., a `BoundedSet` that guarantees a maximum selection limit and preserves insertion order).

## 4. The Pattern

### ❌ THE WRONG WAY: Premature Component Splitting (Micro-TEA Anti-Pattern)
Fracturing a simple checkbox selection into a child component with nested TEA, getters/setters, and message plumbing:

```elm
-- FruitCheckbox.elm (Anti-pattern: Visual component masquerading as a TEA module)
module Components.FruitCheckbox exposing (Model, Msg, init, update, view, isChecked, setChecked)

import Html exposing (Html, label, input, text)
import Html.Attributes exposing (type_, checked)
import Html.Events exposing (onClick)

type alias Model =
    { name : String
    , checked : Bool
    }

type Msg
    = Toggle

init : String -> Model
init name =
    { name = name, checked = False }

update : Msg -> Model -> Model
update msg model =
    case msg of
        Toggle ->
            { model | checked = not model.checked }

-- Pointless getters/setters destroying module boundaries
isChecked : Model -> Bool
isChecked model = model.checked

setChecked : Bool -> Model -> Model
setChecked val model = { model | checked = val }

view : Model -> Html Msg
view model =
    label []
        [ input [ type_ "checkbox", checked model.checked, onClick Toggle ] []
        , text model.name
        ]
```

```elm
-- Main.elm (Polluted with child Msg routing and parent update boilerplate)
module Main exposing (..)

import Components.FruitCheckbox as FruitCheckbox
import Html exposing (Html, div)

type alias Model =
    { apples : FruitCheckbox.Model
    , bananas : FruitCheckbox.Model
    }

type Msg
    = ApplesMsg FruitCheckbox.Msg
    | BananasMsg FruitCheckbox.Msg

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        ApplesMsg subMsg ->
            ( { model | apples = FruitCheckbox.update subMsg model.apples }, Cmd.none )

        BananasMsg subMsg ->
            ( { model | bananas = FruitCheckbox.update subMsg model.bananas }, Cmd.none )
```

---

### ✅ THE RIGHT WAY: Single-File TEA with Data-Centric Module Extraction
Keep UI in the main file using simple helper functions. Extract a module **only** when domain logic requires an invariant-enforcing data structure (such as limiting fruit selection to a maximum of $N$ items while tracking selection order).

#### Step 1: The Opaque Data Structure Module (`BoundedSet.elm`)
Exposes only the type and functions that guarantee domain invariants. Internal implementation (a `List a` capped at `maxSize`) is hidden.

```elm
module BoundedSet exposing
    ( BoundedSet
    , empty
    , insert
    , remove
    , member
    , toList
    )

{-| An opaque data structure enforcing a strict capacity limit and FIFO eviction. -}
type BoundedSet a
    = BoundedSet Int (List a)

empty : Int -> BoundedSet a
empty maxSize =
    BoundedSet (max 0 maxSize) []

insert : a -> BoundedSet a -> BoundedSet a
insert item (BoundedSet maxSize items) =
    let
        filtered =
            List.filter (\x -> x /= item) items
    in
    BoundedSet maxSize (List.take maxSize (item :: filtered))

remove : a -> BoundedSet a -> BoundedSet a
remove item (BoundedSet maxSize items) =
    BoundedSet maxSize (List.filter (\x -> x /= item) items)

member : a -> BoundedSet a -> Bool
member item (BoundedSet _ items) =
    List.member item items

toList : BoundedSet a -> List a
toList (BoundedSet _ items) =
    items
```

#### Step 2: The Main Application (`Main.elm`)
Single-file TEA consumes the opaque data structure directly. View reuse is achieved with plain functions, keeping update and message flow completely flat.

```elm
module Main exposing (main)

import BoundedSet exposing (BoundedSet)
import Browser
import Html exposing (Html, div, fieldset, label, input, text, h3)
import Html.Attributes exposing (type_, checked)
import Html.Events exposing (onClick)

-- MODEL

type alias Model =
    { availableFruits : List String
    , selectedFruits : BoundedSet String
    }

init : () -> ( Model, Cmd Msg )
init _ =
    ( { availableFruits = [ "Apple", "Banana", "Mango", "Papaya" ]
      , selectedFruits = BoundedSet.empty 2 -- Hard domain invariant: max 2 fruits
      }
    , Cmd.none
    )

-- UPDATE

type Msg
    = ToggleFruit String

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        ToggleFruit fruit ->
            let
                nextSelected =
                    if BoundedSet.member fruit model.selectedFruits then
                        BoundedSet.remove fruit model.selectedFruits
                    else
                        BoundedSet.insert fruit model.selectedFruits
            in
            ( { model | selectedFruits = nextSelected }, Cmd.none )

-- VIEW

view : Model -> Html Msg
view model =
    fieldset []
        (h3 [] [ text "Select up to 2 seasonal fruits:" ]
            :: List.map (viewFruitCheckbox model.selectedFruits) model.availableFruits
        )

-- Plain view helper function: No component overhead, no message delegation
viewFruitCheckbox : BoundedSet String -> String -> Html Msg
viewFruitCheckbox selected fruit =
    label []
        [ input
            [ type_ "checkbox"
            , checked (BoundedSet.member fruit selected)
            , onClick (ToggleFruit fruit)
            ]
            []
        , text fruit
        ]

main : Program () Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = \_ -> Sub.none
        }
```
