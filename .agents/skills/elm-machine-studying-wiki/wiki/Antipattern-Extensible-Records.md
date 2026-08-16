# Anti-Pattern: Extensible Record Overuse

## 1. The Sovereign Law
Do not use extensible records (`{ a | field : Type }`) to simulate object-oriented interfaces, duck typing, or ubiquitous domain entities: extensible records degrade compiler type inference, balloon error diagnostics into unreadable polymorphic structural diffs, and obscure domain semantics. Always default to concrete named record types or custom types.

## 2. The Trigger & Context
Developers arriving from TypeScript (structural interfaces), Java/C# (interface inheritance), or Haskell (typeclasses) attempt to replicate polymorphic subtyping in Elm:
- **Simulating Inheritance / Traits:** Defining building-block aliases like `type alias HasId a = { a | id : Int }` and `type alias HasTimestamps a = { a | createdAt : Posix }` and composing models by chaining them: `type alias Bookmark a = HasId (HasTimestamps { a | url : String })`.
- **The Giant Type Error Explosion:** When a typo or type mismatch occurs in a codebase laden with extensible records, the Elm compiler cannot identify the intended nominal type. Instead, it emits massive, multi-page diffs comparing anonymous polymorphic record variables (`{ - a | id : Int, name : String, extra : ... } vs { + b | id : String, ... }`), destroying Elm's signature compiler empathy.
- **Lost Record Constructor Functions:** Unlike concrete `type alias User = { name : String }`, which automatically generates a constructor function `User : String -> User`, an extensible record alias `type alias User a = { a | name : String }` does NOT create a constructor function, breaking JSON pipeline decoding!

---

## 3. Developer Intent vs. Elm Semantics

| Dimension | TypeScript / Java (Structural / Interfaces) | Elm 0.19.1 Sovereign Semantics |
| :--- | :--- | :--- |
| **Polymorphism Strategy** | Interfaces / Abstract base classes (`interface HasName { name: string }`). | **Concrete Types & Functions:** Use concrete record types (`User`, `Bookmark`). If multiple types share logic, pass the specific field explicitly to a helper function. |
| **Model Definition** | Chained inheritance or interface intersection types (`A & B & C`). | **Flat Concrete Records:** Every domain entity has a single, unambiguous `type alias Name = { ... }`. |
| **Compiler Feedback** | Terse interface mismatch warnings. | Concrete types produce crystal-clear, 1-line error diffs. Extensible records produce sprawling, confusing diffs. |
| **Legitimate Use Case** | Ubiquitous everywhere in the codebase. | **Strictly Local Read-Only View Helpers:** e.g., a function `viewAvatar : { a | avatarUrl : String } -> Html msg` that only reads a single field from diverse models. |

---

## 4. The Pattern

### ❌ THE WRONG WAY: Extensible Records as Domain Models (Anti-Pattern)

```elm
module AntiPattern.ExtensibleModels exposing (..)

-- ANTI-PATTERN: Simulating OOP interfaces via extensible records
type alias Identifiable a =
    { a | id : Int }

type alias Timestamped a =
    { a | createdAt : String }

-- Chaining extensible records destroys constructor generation and bloats error messages
type alias BrokenUser a =
    Identifiable (Timestamped { a | name : String, email : String })

-- When you make a type error, the compiler error looks like an incomprehensible AST explosion!
```

---

### ✅ THE RIGHT WAY: Flat Concrete Records & Targeted Field Extraction

#### 1. Flat, Concrete Domain Models (`Domain.elm`)

```elm
module Domain exposing (Bookmark, Note, User)

-- 1. Unambiguous, concrete domain models (Auto-generates Bookmark constructor!)
type alias Bookmark =
    { id : Int
    , createdAt : String
    , url : String
    , title : String
    }

type alias Note =
    { id : Int
    , createdAt : String
    , content : String
    }

type alias User =
    { id : Int
    , name : String
    , email : String
    }
```

#### 2. Clean Function Composition over Field Arguments

Instead of constraining whole records with extensible types, simply extract the required field at the call site or write a simple helper:

```elm
module Ui.Helpers exposing (formatIdBadge, viewIdentifiable)

import Html exposing (Html, span, text)
import Html.Attributes exposing (class)

-- BEST: Just pass the specific field needed (Primitive & Clear!)
formatIdBadge : Int -> Html msg
formatIdBadge id =
    span [ class "badge" ] [ text ("#" ++ String.fromInt id) ]

-- ACCEPTABLE (Local Read-Only): Narrow extensible record for shared view helpers
viewIdentifiable : { a | id : Int, title : String } -> Html msg
viewIdentifiable item =
    span [] [ text ("[" ++ String.fromInt item.id ++ "] " ++ item.title) ]
```
