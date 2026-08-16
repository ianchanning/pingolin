# Types as Sets: Algebraic Cardinality & State Disjointness

## 1. The Sovereign Law
Types are mathematical sets: records and tuples multiply cardinality, while custom types add cardinality to create disjoint, non-overlapping partitions. A program achieves total runtime reliability when the cardinality and structure of its type system precisely mirror the domain's valid states, making invalid states structurally unrepresentable.

## 2. The Trigger & Context
When frontend architectures evolve, developers frequently fall into **Boolean Blindness** and **Combinatorial State Explosion**. Instead of modeling mutually exclusive domain states with custom types, developers represent state using multiple independent boolean flags, optional fields, or primitive strings:

```elm
-- Anti-pattern: 2 × 2 × 2 × ∞ = ∞ states for a 4-state domain lifecycle!
type alias RequestState =
    { isLoading : Bool
    , isSuccess : Bool
    , isError : Bool
    , errorMessage : Maybe String
    }
```

This triggers severe architectural failures:
- **Impossible State Space:** A record of $N$ booleans produces $2^N$ possible states through Cartesian multiplication. For a 3-flag state machine (e.g., loading, success, error), $2^3 = 8$ states exist in the type system, yet only 3 or 4 represent valid reality. Combinations like `{ isLoading = True, isSuccess = True }` or `{ isError = False, errorMessage = Just "Failed" }` inevitably manifest at runtime.
- **Defensive Code Sprawl & Redundant Testing:** Because the type system allows invalid combinations, developers must write defensive guard clauses, sanity checks, and hundreds of unit tests to verify that invalid states are not rendered or processed.
- **Stringly-Typed Permissiveness:** Using `String` (cardinality: $\infty$) for enumerated concepts (e.g. traffic light colors, user roles) leaves $\infty - N$ invalid values that escape compiler detection and cause silent runtime failures on typos.
- **Venn Diagram Overlap & Boolean Blindness:** Booleans provide no semantic proof of what was checked; branching on `if model.isLoading then ... else ...` discards type-level knowledge of whether data or errors exist in the `else` branch.

### The Set-Theoretic Foundation
To eliminate these bugs, Elm models data types as mathematical sets:

1. **Primitive Sets:**
   $$\text{cardinality}(\text{Bool}) = \{ \text{True}, \text{False} \} = 2$$
   $$\text{cardinality}(\text{Int}) \approx 2^{32} \quad | \quad \text{cardinality}(\text{String}) = \infty$$

2. **Product Types (Multiplication):** Records and tuples form Cartesian products.
   $$\text{cardinality}((A, B)) = \text{cardinality}(A) \times \text{cardinality}(B)$$
   $$\text{cardinality}(\{ \text{r} : \text{Bool}, \text{y} : \text{Bool}, \text{g} : \text{Bool} \}) = 2 \times 2 \times 2 = 8$$

3. **Sum Types / Custom Types (Addition):** Custom types create disjoint unions where each variant is an isolated, non-overlapping partition ($A \cap B = \emptyset$).
   $$\text{cardinality}(A \mid B) = \text{cardinality}(A) + \text{cardinality}(B)$$
   $$\text{cardinality}(\text{type Light} = \text{Red} \mid \text{Yellow} \mid \text{Green}) = 1 + 1 + 1 = 3$$
   $$\text{cardinality}(\text{Maybe } A) = 1 + \text{cardinality}(A)$$
   $$\text{cardinality}(\text{Result } E\ A) = \text{cardinality}(E) + \text{cardinality}(A)$$

Evan Czaplicki's principle of **"Sharpening the Knife"** dictates that as application requirements change, the set of possible values in code inevitably drifts from the set of valid values in real life. Periodically refactoring types to restore exact cardinality parity eliminates bugs before they can be written.

## 3. Developer Intent vs. Elm Semantics

| Paradigm / Ecosystem | Developer Intent & Assumption | Elm Semantics & Reality |
| :--- | :--- | :--- |
| **JavaScript / TypeScript** | Uses object shapes with optional properties and boolean flags (`{ loading?: boolean, error?: Error, data?: T }`). Relies on structural subtyping and manual type narrowing guards. | Structural types allow overlapping property combinations. Elm's nominal custom types enforce strict, disjoint partitioning: a value is exactly one variant at any point in time, verified exhaustively by the compiler. |
| **React / Redux** | Manages independent state slices (`isFetching`, `isLoaded`, `error`) updated via distributed action reducers, leading to state tearing where `isFetching` and `error` are simultaneously true. | Elm represents lifecycle state as a single closed custom type (e.g. `RemoteData`). State tearing is mathematically impossible because the type cardinality matches the domain lifecycle. |
| **OOP (Java / C#)** | Product types (classes with fields) are simple; sum types (addition) require verbose class hierarchies, inheritance, or visitor patterns. Consequently, OOP developers default to multiplication and runtime validation. | Elm makes sum types (`type Status = Idle \| Busy \| Done`) first-class and low-friction. Addition is the primary tool for constraining state spaces. |
| **Haskell / Pure FP** | Explores generalized algebraic data types (GADTs), typeclasses, and category-theoretic abstractions to make types maximally polymorphic and generalized. | Elm deliberately restricts types to concrete product and sum types. Types serve as clear domain models and cognitive boundaries, optimizing for human legibility and compiler-enforced exhaustiveness. |

## 4. The Pattern

### ❌ THE WRONG WAY: Multi-Boolean Combinatorial Explosion & Stringly Typing
Modeling mutually exclusive states with boolean flags or loose strings introduces invalid states, requires defensive error handling, and blinds the compiler to impossible branches.

```elm
module AntiPattern.TrafficAndFetch exposing (..)

import Html exposing (Html, div, text)

-- WRONG: Cardinality is 2 × 2 × 2 = 8 states for a 3-state system (5 invalid states!)
type alias TrafficLightModel =
    { isRed : Bool
    , isYellow : Bool
    , isGreen : Bool
    }

-- WRONG: Cardinality is 2 × 2 × (1 + ∞) = ∞ states (allows isLoading=True with hasError=True)
type alias UserState =
    { isLoading : Bool
    , hasError : Bool
    , error : Maybe String
    , username : String -- Using String allows invalid empty or malformed names
    }

-- Fragile view with boolean blindness and defensive branching
viewTrafficLight : TrafficLightModel -> Html msg
viewTrafficLight model =
    if model.isRed && model.isGreen then
        -- Invalid state leaked into runtime!
        div [] [ text "ERROR: Quantum light is both Red and Green!" ]

    else if model.isRed then
        div [] [ text "Stop" ]

    else if model.isYellow then
        div [] [ text "Caution" ]

    else if model.isGreen then
        div [] [ text "Go" ]

    else
        -- Invalid state: all booleans False!
        div [] [ text "ERROR: No light active!" ]
```

### ✅ THE RIGHT WAY: Disjoint Custom Types (Set Addition)
Model states using custom types whose cardinality exactly equals the valid domain states. The compiler enforces exhaustive pattern matching and eliminates all invalid states.

```elm
module Idiomatic.TrafficAndFetch exposing
    ( Light(..)
    , RemoteData(..)
    , User
    , viewLight
    , viewUserStatus
    )

import Html exposing (Html, div, p, span, text)

-- 1. Exact Set Match: Cardinality = 1 + 1 + 1 = 3 (Zero invalid states)
type Light
    = Red
    | Yellow
    | Green

-- 2. Exact Lifecycle Disjoint Union: Cardinality = 1 + 1 + |HttpError| + |User|
type RemoteData error data
    = NotAsked
    | Loading
    | Failure error
    | Success data

type alias User =
    { id : Int
    , name : String
    }

type alias HttpError =
    { statusCode : Int
    , message : String
    }

-- 3. Exhaustive, bug-free view without defensive fallback branches
viewLight : Light -> Html msg
viewLight light =
    case light of
        Red ->
            div [] [ text "Stop" ]

        Yellow ->
            div [] [ text "Caution" ]

        Green ->
            div [] [ text "Go" ]

-- 4. Exhaustive lifecycle rendering: Data is ONLY accessible in Success state
viewUserStatus : RemoteData HttpError User -> Html msg
viewUserStatus status =
    case status of
        NotAsked ->
            span [] [ text "Click to load user profile." ]

        Loading ->
            span [] [ text "Loading profile..." ]

        Failure err ->
            span [] [ text ("Failed to load: " ++ err.message ++ " (Code: " ++ String.fromInt err.statusCode ++ ")") ]

        Success user ->
            div []
                [ p [] [ text ("User ID: " ++ String.fromInt user.id) ]
                , p [] [ text ("Name: " ++ user.name) ]
                ]
```
