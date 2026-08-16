# Making Impossible States Impossible

## 1. The Sovereign Law
Transform domain invariants from runtime defensive validation checks into compile-time structural guarantees by designing data models where invalid, contradictory, or out-of-order states cannot be represented in the type system.

## 2. The Trigger & Context
Developers frequently structure models using independent primitive fields (multiple booleans, disconnected lists, or optional strings) that permit invalid combinations:
- **Combinatorial Flag Disasters:** Having `isEditing : Bool`, `isSaving : Bool`, and `hasError : Bool` allows $2^3 = 8$ states, including `{ isEditing = False, isSaving = True, hasError = True }`.
- **The "Zero Data" UI Flicker:** Rendering a count as `0` while data is still loading (e.g., Twitter's "0 Retweets" or Slack's "No Messages" flicker) because the model initializes numbers to `0` or lists to `[]` alongside a boolean `isLoading = True`.
- **Out-of-Sync Parallel Lists:** Storing selected items in a parallel list (`items : List Item, selectedIndices : List Int`) allows indices to point to deleted elements.
- **Defensive Guard Clause Explosion:** Writing dozens of `if` checks across the codebase to catch invalid states that should never have existed in memory.

As Richard Feldman noted: *"Tests are good, but impossible is better. If the compiler forbids the invalid state, you don't even have to test it."*

---

## 3. Developer Intent vs. Elm Semantics

| Dimension | JavaScript / OOP Intuition | Elm 0.19.1 Type-Driven Modeling |
| :--- | :--- | :--- |
| **Enforcing Invariants** | Write runtime validation logic, assert statements, or sanitization functions. | Encode invariants directly into data structure constructors (e.g. `NonEmptyList`, `Zipper`, `History`). |
| **Selection Tracking** | Store a list of items and an integer index (`selectedIndex : Int`) or IDs. | Use a `Zipper` (`{ previous : List a, selected : a, remaining : List a }`), guaranteeing exactly one item is always selected. |
| **Mutually Exclusive States** | Multiple boolean properties (`isLoggedIn`, `isGuest`, `isBanned`). | A single closed custom type (`type User = Guest | LoggedIn Account | Banned String`). |
| **Ordering Constraints** | Accept arbitrary lists and sort/validate them before emitting output. | Separate disparate phases into dedicated record types so invalid sequencing fails compilation. |

---

## 4. The Pattern

### ❌ THE WRONG WAY: Multi-Boolean Combinatorial Flags (Anti-Pattern)
Allowing impossible states (like being simultaneously saving and in an error state without an error message):

```elm
module AntiPattern.SurveyForm exposing (..)

-- ANTI-PATTERN: Allows 2 × 2 × 2 × (1 + ∞) = ∞ states (most are invalid)
type alias FormModel =
    { isEditing : Bool
    , isSubmitting : Bool
    , hasFailed : Bool
    , errorMessage : Maybe String
    , answerText : String
    }

-- Defensive view with boolean blindness and fallback fragility
viewBad : FormModel -> String
viewBad model =
    if model.isSubmitting && model.isEditing then
        "ERROR: Cannot be editing and submitting at the same time!"

    else if model.hasFailed && model.errorMessage == Nothing then
        "ERROR: Failed state without error details!"

    else if model.isSubmitting then
        "Saving..."

    else
        "Editing: " ++ model.answerText
```

---

### ✅ THE RIGHT WAY: Disjoint Phase Custom Types

#### 1. Explicit Lifecycle Modeling

```elm
module Idiomatic.SurveyForm exposing (FormState(..), Model, init, view)

import Html exposing (Html, button, div, p, text, textarea)
import Html.Events exposing (onClick, onInput)

-- 1. Exact domain states: Mutually exclusive by definition
type FormState
    = Viewing String
    | Editing String
    | Submitting { draft : String, previous : String }
    | SaveFailed { draft : String, error : String }

type alias Model =
    { state : FormState
    }

init : String -> Model
init initialText =
    { state = Viewing initialText }

-- 2. Exhaustive, impossible-state-free rendering
view : Model -> Html msg
view model =
    case model.state of
        Viewing content ->
            div []
                [ p [] [ text content ]
                ]

        Editing draft ->
            div []
                [ textarea [] [ text draft ]
                ]

        Submitting { draft } ->
            div []
                [ p [] [ text ("Submitting: " ++ draft) ]
                , p [] [ text "Please wait..." ]
                ]

        SaveFailed { draft, error } ->
            div []
                [ p [] [ text ("Error saving: " ++ error) ]
                , textarea [] [ text draft ]
                ]
```

#### 2. The List Selection Invariant (Zipper Pattern)
Guaranteeing at compile time that a collection always has exactly one active selection:

```elm
module SelectionZipper exposing (Zipper, fromList, next, previous, selected)

type Zipper a
    = Zipper (List a) a (List a)

-- Guarantees a selection exists if the list is non-empty
fromList : a -> List a -> Zipper a
fromList first rest =
    Zipper [] first rest

selected : Zipper a -> a
selected (Zipper _ current _) =
    current

next : Zipper a -> Zipper a
next (Zipper left current right) =
    case right of
        firstRight :: restRight ->
            Zipper (current :: left) firstRight restRight

        [] ->
            Zipper left current right

previous : Zipper a -> Zipper a
previous (Zipper left current right) =
    case left of
        firstLeft :: restLeft ->
            Zipper restLeft firstLeft (current :: right)

        [] ->
            Zipper left current right
```
