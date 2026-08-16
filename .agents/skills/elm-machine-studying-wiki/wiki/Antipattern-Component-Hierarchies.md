# Anti-Pattern: Component Hierarchies & Nested TEA

## 1. The Sovereign Law
Do not architect Elm applications as nested hierarchies of stateful "components" (local `Model`, `Msg`, `update`, `view`): components are disguised object-oriented constructs that break single-source-of-truth, cause message-forwarding boilerplate cascades, and decouple related state. Modern Elm UI is built of stateless pure view functions over flat page models.

## 2. The Trigger & Context
Developers arriving from React, Vue, Angular, or Swift/SwiftUI carry strong instincts toward component-based encapsulation:
- **The "Everything is a Component" Fallacy:** Creating separate modules (`Sidebar.elm`, `Button.elm`, `Dropdown.elm`, `Header.elm`) where each module defines its own `Model`, `Msg`, and `update` function.
- **The Message Forwarding Cascade:** When the parent page needs to render a child dropdown, the parent must:
  1. Store the child's `Dropdown.Model` inside its own `Model`.
  2. Define a wrapper message: `type Msg = DropdownMsg Dropdown.Msg`.
  3. Intercept `DropdownMsg` in the parent `update`, pass it to `Dropdown.update`, and re-wrap the result.
  4. Map the child view via `Html.map DropdownMsg (Dropdown.view childModel)`.
- **State Synchronization Nightmares:** If the parent needs to know when the dropdown selection changes, the child cannot directly modify parent state. Developers end up inventing complex "OutMsg" patterns or callback acrobatics just to do simple UI updates.

As Evan Czaplicki emphasized in *The Life of a File* and *Structuring Web Apps*:
$$\text{Components} = \text{Local State} + \text{Methods} = \text{Objects}$$
There are no objects in Elm. Trying to simulate objects with nested TEA modules destroys developer velocity.

---

## 3. Developer Intent vs. Elm Semantics

| Dimension | React / Vue Component Paradigm | Elm 0.19.1 Sovereign Semantics |
| :--- | :--- | :--- |
| **Encapsulation Unit** | Visual widget (HTML + Local State + Event Handlers). | **Data-Centric Types:** Modules are built around a core custom type (e.g. `Bookmark.elm`, `Page.Home.elm`). |
| **State Ownership** | Fragmented across hundreds of nested component trees (`useState`, `this.state`). | **Centralized Single Source of Truth:** State lives flatly on the Page or Main `Model`. |
| **View Abstraction** | Stateful child classes or function components. | **Stateless Pure Functions:** `viewSidebar : Config -> Model -> Html Msg`. Just helper functions taking arguments! |
| **Communication** | Prop drilling, callbacks, Redux stores, contexts. | Direct message dispatch to the single top-level `update` function. |

---

## 4. The Pattern

### ❌ THE WRONG WAY: Nested Stateful Micro-TEA Component (Anti-Pattern)

```elm
module AntiPattern.NestedDropdown exposing (..)

import Html exposing (Html, div, text)

-- ANTI-PATTERN: Giving a trivial UI widget its own Model, Msg, and update
type alias DropdownModel =
    { isOpen : Bool
    , selected : Maybe String
    }

type DropdownMsg
    = Toggle
    | Select String

updateDropdown : DropdownMsg -> DropdownModel -> DropdownModel
updateDropdown msg model =
    case msg of
        Toggle -> { model | isOpen = not model.isOpen }
        Select val -> { model | selected = Just val, isOpen = False }

-- PARENT MODULE SUFFERS:
type alias ParentModel =
    { dropdownState : DropdownModel -- Nested state pollution!
    }

type ParentMsg
    = GotDropdownMsg DropdownMsg -- Forwarding boilerplate!

updateParent : ParentMsg -> ParentModel -> ParentModel
updateParent msg model =
    case msg of
        GotDropdownMsg dMsg ->
            { model | dropdownState = updateDropdown dMsg model.dropdownState }
```

---

### ✅ THE RIGHT WAY: Flat Page State & Pure Stateless View Functions

#### 1. Flat State in Page Module (`Page/Bookmarks.elm`)

```elm
module Page.Bookmarks exposing (Model, Msg(..), init, update, view)

import Html exposing (Html, button, div, text)
import Html.Events exposing (onClick)

type alias Model =
    { bookmarks : List String
    , isSortDropdownOpen : Bool -- Flat boolean on page model
    , selectedSort : String
    }

type Msg
    = ToggleSortDropdown
    | SelectSort String
    | DeleteBookmark String

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        ToggleSortDropdown ->
            ( { model | isSortDropdownOpen = not model.isSortDropdownOpen }, Cmd.none )

        SelectSort sortOption ->
            ( { model | selectedSort = sortOption, isSortDropdownOpen = False }, Cmd.none )

        DeleteBookmark id ->
            ( { model | bookmarks = List.filter (\b -> b /= id) model.bookmarks }, Cmd.none )
```

#### 2. Pure Stateless View Helper (`Ui/Dropdown.elm`)

When a view helper is shared across multiple pages, define it as a **stateless configuration function**:

```elm
module Ui.Dropdown exposing (DropdownConfig, view)

import Html exposing (Html, button, div, text)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)

type alias DropdownConfig msg =
    { isOpen : Bool
    , selected : String
    , options : List String
    , onToggle : msg
    , onSelect : String -> msg
    }

view : DropdownConfig msg -> Html msg
view config =
    div [ class "dropdown" ]
        [ button [ onClick config.onToggle ] [ text ("Sort: " ++ config.selected) ]
        , if config.isOpen then
            div [ class "dropdown-menu" ]
                (List.map (\opt -> button [ onClick (config.onSelect opt) ] [ text opt ]) config.options)

          else
            text ""
        ]
```
