# Elm: Pragmatism Over Purity

## 1. The Sovereign Law
Simpler foundations produce simpler code in practice. Elm deliberately sacrifices academic type purity, typeclasses, and category-theory abstractions to guarantee human accessibility, zero runtime exceptions, empathetic compiler diagnostics, and fearless long-term maintainability.

## 2. The Trigger & Context
Functional programming newcomers and veterans frequently encounter friction when expecting Elm to mirror Haskell, Scala, or PureScript idioms. 

The misconception manifests in common developer questions and architectural missteps:
- Attempting to simulate generalized `Monad`, `Functor`, or `Applicative` abstractions across container types (`Maybe`, `List`, `Result`).
- Resisting explicit `Json.Decode.Decoder` definitions and seeking automatic typeclass derivation (e.g., Haskell's `FromJSON` or Rust's `serde::Deserialize`).
- Emulating typeclasses through dictionary-passing records of functions (e.g., passing `{ show : a -> String }` or `{ eq : a -> a -> Bool }`).
- Experiencing frustration with Elm's compiler when attempting higher-kinded polymorphism or implicit instance resolution.

When this sovereign law is ignored, developers introduce unnecessary indirection, degrade compiler error clarity, inflate cognitive overhead, and resurrect the exact barrier to entry that has historically prevented typed functional programming from achieving mainstream adoption.

## 3. Developer Intent vs. Elm Semantics

| Dimension | Academic / Complex FP Intent | Pragmatic Elm Semantics |
| :--- | :--- | :--- |
| **Polymorphism** | Abstract across distinct data structures using Typeclasses (`Monad`, `Applicative`, `Monoid`, `Show`). | Use concrete, monomorphic functions. Readability and localized comprehension outweigh universal abstraction. |
| **JSON Decoding** | Automatically derive decoders using implicit typeclass instances tied 1:1 to types. | Compose explicit `Json.Decode.Decoder` values. Decouples wire formats from data models, allowing multiple decoders per type (versioning, migration). |
| **Terminology** | Academic jargon: "Pure function", "Monad / Monadic Bind", "Easy to reason about", "Type Safety". | Human-centered language: "Stateless function", "Callbacks / `andThen`", "Easy to refactor", "Reliability (zero crashes)". |
| **Compiler Role** | Adversarial type-checker verifying complex mathematical proofs; emits intimidating type equations on failure. | Empathetic assistant providing contextual diagnostics, hints, diffs, and actionable suggestions. |
| **Learning Curve** | High initial barrier requiring category theory and abstract algebra for everyday tasks. | Gradual on-ramp: newcomers build working interactive applications within minutes without prior FP knowledge. |
| **Tooling Guarantees** | Fragmented language extensions and compiler flags. | Hard compiler invariants (purity, immutability, managed effects) enable automated SemVer enforcement, zero runtime crashes, and time-travel debugging. |

### Core Architectural Principles:
1. **User-Focused Design & Gradual Learning:** Mainstream adoption requires an accessible on-ramp. An engineer should be productive on day one without needing to understand category theory. Advanced patterns are revealed organically as applications scale.
2. **Obvious Names & Direct Communication:** Jargon alienates. Instead of demanding that developers learn group theory to calculate $1 + 1 = 2$, Elm uses direct, obvious terminology (`andThen`, `elm make`, `elm install`, `elm/html`).
3. **Usage-Driven Design:** Start with the Minimum Viable Solution (MVS). Concrete functions and explicit data decoders consistently solve real-world problems with fewer moving parts than complex abstractions.
4. **Invariants as Competitive Advantage:** Enforcing total immutability and managed effects allows Elm to provide guarantees and developer tooling that massive corporate teams cannot replicate in TypeScript or JavaScript: guaranteed zero runtime exceptions, deterministic package versioning via automated AST diffing, and zero-configuration time-travel debugging.

## 4. The Pattern

### ❌ THE WRONG WAY: Simulating Typeclasses via Dictionary Passing (Anti-Pattern)
Attempting to emulate typeclasses or higher-kinded abstractions using records of functions creates unnecessary indirection, degrades error messages, and bloats the codebase.

```elm
-- WRONG: Emulating typeclasses via dictionary passing
type alias Show a =
    { show : a -> String }

type alias Monad m a =
    { return : a -> m a
    , bind : m a -> (a -> m a) -> m a
    }

-- Overly generic formatting function requiring dictionary passing
formatWith : Show a -> a -> String
formatWith dict val =
    "Value: " ++ dict.show val

-- Dictionary instances
intShow : Show Int
intShow =
    { show = String.fromInt }

userShow : Show { name : String, age : Int }
userShow =
    { show = \u -> u.name ++ " (" ++ String.fromInt u.age ++ ")" }

-- Usage requires threading dictionaries manually
renderedUser : String
renderedUser =
    formatWith userShow { name = "Alice", age = 30 }
```

### ✅ THE RIGHT WAY: Explicit, Monomorphic Elm 0.19.1 Functions & Direct Pipelines
Use concrete types, explicit transformations, composable `Json.Decode` pipelines, and readable sequential operations (`andThen`).

```elm
module User exposing (User, decoder, format, parseMonth, updateAge)

import Json.Decode as Decode exposing (Decoder)


-- 1. Concrete domain model
type alias User =
    { name : String
    , age : Int
    }


-- 2. Explicit, monomorphic function (Simple, direct, self-documenting)
format : User -> String
format user =
    user.name ++ " (" ++ String.fromInt user.age ++ ")"


-- 3. Composable, explicit JSON decoder (Supports versioning and custom migrations)
decoder : Decoder User
decoder =
    Decode.map2 User
        (Decode.field "name" Decode.string)
        (Decode.field "age" Decode.int)


-- 4. Pragmatic sequencing using standard andThen pipelines
parseMonth : String -> Maybe Int
parseMonth input =
    String.toInt input
        |> Maybe.andThen validateMonth


validateMonth : Int -> Maybe Int
validateMonth month =
    if month >= 1 && month <= 12 then
        Just month

    else
        Nothing


-- 5. Professional, readable record update
updateAge : Int -> User -> User
updateAge newAge user =
    { user | age = newAge }
```
