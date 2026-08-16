# Elm 0.19 Syntax Ground Truth

## 1. The Sovereign Law
Elm 0.19.1 enforces total expression purity and lexical structural invariance: every construct evaluates to a discrete value, functions are strictly curried single-argument mappings, records are shallowly updated immutable bags, and algebraic data types guarantee exhaustive runtime elimination of invalid state.

## 2. The Trigger & Context
Developers acclimated to JavaScript, TypeScript, Haskell, or legacy Elm (0.16–0.18) frequently attempt to port imperative habits, object-mutation idioms, or deprecated compiler conventions into Elm 0.19.1.

Violating Elm's core syntax rules triggers immediate, uncompromising compiler errors:
- **Record Update Syntax Failure:** Attempting `{ model.user | name = "Ada" }` or `{ Config.default | timeout = 5000 }` triggers:
  `"I just saw a field name, so I was expecting to see an equals sign next."` or `"The base of a record update must be a simple variable name."`
- **Let-In Scoping & Alignment Errors:** Misaligned bindings, missing `in` expressions, or attempting Haskell-style `where` clauses produces:
  `"I am looking at this 'let' expression, but something is wrong with how the definitions are laid out."`
- **Parentheses vs. Currying Precedence:** Writing `func a ++ b` (which Elm parses as `(func a) ++ b`) or calling functions with comma syntax `func(a, b)` produces:
  `"The 1st argument to 'func' is not what I expect."`
- **Non-Exhaustive Pattern Matching:** Omitting a branch in `case ... of` triggers:
  `"This 'case' does not have branches for all possibilities! Missing cases: ..."`
- **Legacy 0.16–0.18 Deprecation Errors:** Calling `toString x` (instead of `String.fromInt`, `String.fromFloat`, or `Debug.toString`) or referencing `Html.App` / `Signal` fails with:
  `"I cannot find a 'toString' variable."`

---

## 3. Developer Intent vs. Elm Semantics

| Developer Intent (JS / React / Haskell Mindset) | Elm 0.19.1 Semantics & Architecture |
| :--- | :--- |
| **Imperative Statements & Early Returns:** Use blocks to run sequential side-effects, mutate local state, and `return` early. | **Pure Expressions:** Every construct (including `if-then-else`, `case-of`, `let-in`) is an expression yielding a value. There are no statements, side-effects, or early returns. |
| **Object Spread Mutation (`{ ...obj.user, name }`):** Deeply modify nested properties inline using arbitrary expressions as the spread source. | **Simple Variable Base:** `{ baseRecord | field = value }` requires `baseRecord` to be an unqualified, simple identifier. Deep updates require explicit intermediate bindings and structural sharing. |
| **Tuple Argument Invocation (`func(x, y)`):** Pass comma-separated arguments in parentheses as an atomic function call. | **Strict Single-Argument Currying (`func x y`):** Functions accept exactly one argument and return a new function. Parentheses denote precedence, not invocation syntax. |
| **Pipeline Operator Chaining:** Treat `|>` and `<|` as OOP method-chaining or decorative sugar. | **Reverse & Forward Function Application:** `x |> f` is strictly `f x` (passing data as the *final* curried argument); `f <| x` is strictly `f x` (precedence grouping to eliminate outer parentheses). |
| **Loose Enums & Interfaces:** Use strings, booleans, or open duck-typed records to represent complex operational states. | **Custom Types (Tagged Unions) vs. Type Aliases:** Type aliases provide pure structural labels; custom types create closed nominal sum types that the compiler exhaustively verifies. |
| **Generic String Coercion (`toString` / `JSON.stringify`):** Convert any arbitrary data type into a string for display. | **Explicit Domain Serialization:** Generic `toString` is abolished. Primitives use explicit formatters (`String.fromInt`, `String.fromFloat`), while custom types use domain view functions or `Debug.toString` during development. |

---

## 4. The Pattern

### 1. Record Updates: The Law of the Simple Base
The base of a record update `{ record | field = newVal }` must be a simple, unqualified local variable. Nested record updates cannot be written inline.

#### ❌ THE WRONG WAY (Inline & Qualified Record Updates)
```elm
module AntiPattern.Records exposing (..)

-- FAILS COMPILER: Base cannot be a qualified path or expression
updateUserBad : Model -> Model
updateUserBad model =
    -- Compiler error: "I just saw a field name, so I was expecting to see an equals sign next."
    { model.currentUser | name = "Ada Lovelace" }

-- FAILS COMPILER: Base cannot be another record update expression
updateNestedBad : Model -> Model
updateNestedBad model =
    { model | currentUser = { model.currentUser | active = True } }
```

#### ✅ THE RIGHT WAY (Explicit Intermediate Let-Bindings)
```elm
module Idiomatic.Records exposing (Model, User, updateUserName, updateUserStatus)

type alias User =
    { name : String
    , active : Bool
    }

type alias Model =
    { currentUser : User
    , revision : Int
    }

-- SUCCESS: Unpack the nested record to a simple variable, update, and reassemble
updateUserName : String -> Model -> Model
updateUserName newName model =
    let
        currentUser =
            model.currentUser

        updatedUser =
            { currentUser | name = newName }
    in
    { model | currentUser = updatedUser }

updateUserStatus : Bool -> Model -> Model
updateUserStatus isActive model =
    let
        user =
            model.currentUser

        updatedUser =
            { user | active = isActive }
    in
    { model
        | currentUser = updatedUser
        , revision = model.revision + 1
    }
```

---

### 2. Let-In Scoping & Immutable Bindings
Bindings declared in a `let` block are mutually recursive, order-independent within their scope, and only visible to the associated `in` expression.

#### ❌ THE WRONG WAY (Imperative Flow & Misaligned Layout)
```elm
module AntiPattern.LetIn exposing (..)

-- ANTI-PATTERN: Attempting imperative variable reassignment or Haskell where-clauses
calculateBad : Int -> Int
calculateBad input =
    let
        temp = input + 10
        temp = temp * 2 -- COMPILER ERROR: Duplicate definition of 'temp'
    in
    temp
```

#### ✅ THE RIGHT WAY (Pure Functional Transformation & Sub-functions)
```elm
module Idiomatic.LetIn exposing (calculateMetrics)

type alias Metrics =
    { raw : Int
    , scaled : Float
    , label : String
    }

calculateMetrics : Int -> Metrics
calculateMetrics rawInput =
    let
        scaleFactor =
            1.5

        computeScaled : Int -> Float
        computeScaled val =
            toFloat val * scaleFactor

        formattedLabel : Float -> String
        formattedLabel value =
            "Score: " ++ String.fromFloat value

        finalScaled =
            computeScaled rawInput
    in
    { raw = rawInput
    , scaled = finalScaled
    , label = formattedLabel finalScaled
    }
```

---

### 3. Currying, Partial Application & Argument Precedence
Every Elm function takes one argument. Multi-argument functions are curried single-argument pipelines. Parentheses dictate evaluation precedence.

#### ❌ THE WRONG WAY (JavaScript Tuples & Precedence Trap)
```elm
module AntiPattern.Currying exposing (..)

-- ANTI-PATTERN: Comma tuples (parses as a 1-argument function taking a 2-tuple)
addBad : ( Int, Int ) -> Int
addBad ( a, b ) =
    a + b

-- PRECEDENCE BUG: Function application binds tighter than infix operators
greetUserBad : String -> String -> String
greetUserBad prefix name =
    -- Parsed as: (prefix ++ " ") (String.toUpper name) -> Type mismatch!
    prefix ++ " " String.toUpper name
```

#### ✅ THE RIGHT WAY (Idiomatic Currying & Partial Application)
```elm
module Idiomatic.Currying exposing (add, addTen, formatNames, greetUser)

-- Standard curried function: Int -> Int -> Int
add : Int -> Int -> Int
add a b =
    a + b

-- Zero-cost partial application: specialized helper without boilerplate
addTen : Int -> Int
addTen =
    add 10

greetUser : String -> String -> String
greetUser prefix name =
    prefix ++ " " ++ String.toUpper name

-- Partial application inside higher-order functions
formatNames : List String -> List String
formatNames names =
    List.map (greetUser "Operator:") names
```

---

### 4. Pipeline Operators (`|>` and `<|`)
The forward pipe (`|>`) passes the result of the left-hand side as the **final argument** to the function on the right-hand side. The backward pipe (`<|`) replaces parentheses across complex expressions.

#### ❌ THE WRONG WAY (Excessive Piping & Nested Parenthesis Pyramid)
```elm
module AntiPattern.Pipelines exposing (..)

-- ANTI-PATTERN: Deeply nested pyramid of parentheses
processDataParen : List String -> String
processDataParen rawList =
    String.join ", " (List.sort (List.filter (\s -> String.length s > 3) (List.map String.trim rawList)))

-- ANTI-PATTERN: Useless piping of single variables
pointlessPipe : Int -> Int
pointlessPipe x =
    x |> (\n -> n + 1)
```

#### ✅ THE RIGHT WAY (Linear Left-to-Right Data Pipelines)
```elm
module Idiomatic.Pipelines exposing (cleanAndJoinTags, renderSummary)

import Html exposing (Html, div, p, text)
import Html.Attributes exposing (class)

cleanAndJoinTags : List String -> String
cleanAndJoinTags rawTags =
    rawTags
        |> List.map String.trim
        |> List.filter (\tag -> String.length tag > 2)
        |> List.sort
        |> String.join ", "

-- Using <| to eliminate outer parentheses in view functions
renderSummary : String -> Html msg
renderSummary summaryText =
    div [ class "summary-container" ]
        <| [ p [ class "summary-text" ] [ text summaryText ] ]
```

---

### 5. Type Aliases vs. Custom Types & Exhaustive Pattern Matching
`type alias` creates a structural type abbreviation (and record constructor function). `type` defines a closed algebraic sum type (custom type).

#### ❌ THE WRONG WAY (Stringly-Typed Enums & Incomplete Matches)
```elm
module AntiPattern.Types exposing (..)

-- ANTI-PATTERN: Boolean flags and stringly-typed state invite impossible states
type alias BrokenSession =
    { isLoading : Bool
    , errorMessage : Maybe String
    , userData : Maybe String
    }

-- ANTI-PATTERN: Partial match with wildcards hiding domain changes
handleStatusBad : String -> String
handleStatusBad status =
    case status of
        "AUTHENTICATED" -> "Welcome"
        _ -> "Unknown" -- Gremlins hide in wildcard catches
```

#### ✅ THE RIGHT WAY (Nominal Tagged Unions & Exhaustive Deconstruction)
```elm
module Idiomatic.Types exposing
    ( RemoteData(..)
    , SessionState(..)
    , User
    , viewSession
    )

import Html exposing (Html, div, span, text)
import Html.Attributes exposing (class)

type alias User =
    { id : Int
    , username : String
    }

-- Nominal sum type eliminating invalid states
type RemoteData error value
    = NotAsked
    | Loading
    | Failure error
    | Success value

type SessionState
    = Guest
    | Authenticated User

-- Exhaustive pattern matching: compiler enforces coverage when variants change
viewSession : RemoteData String User -> Html msg
viewSession state =
    case state of
        NotAsked ->
            div [ class "state-idle" ] [ text "Initializing session..." ]

        Loading ->
            div [ class "state-loading" ] [ text "Loading user profile..." ]

        Failure err ->
            div [ class "state-error" ] [ text ("Failed to load profile: " ++ err) ]

        Success user ->
            div [ class "state-user" ]
                [ span [ class "user-id" ] [ text ("ID: " ++ String.fromInt user.id) ]
                , span [ class "user-name" ] [ text ("Name: " ++ user.username) ]
                ]
```
