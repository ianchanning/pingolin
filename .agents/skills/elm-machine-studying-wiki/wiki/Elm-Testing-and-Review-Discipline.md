# Testing & Review Discipline: `elm-test` & `elm-review`

## 1. The Sovereign Law
Automated quality and architectural invariants are enforced through two complementary disciplines: property-based **Fuzz Testing** (`elm-explorations/test`) proving domain theorems across thousands of generated inputs, and compile-time **Static Analysis** (`jfmengels/elm-review`) mechanically eliminating anti-patterns and unused code before human review.

## 2. The Trigger & Context
Developers accustomed to dynamic JavaScript testing frameworks (Jest, Mocha) or traditional linters (ESLint) often misuse testing in Elm:
- **Testing the Type System:** Writing hundreds of unit tests asserting that functions return non-null values or handle basic types (which the Elm compiler already guarantees with 100% mathematical certainty).
- **Example-Based Test Blindness:** Testing algorithms with 2 or 3 hardcoded input strings, missing critical edge cases (empty strings, Unicode characters, negative integers, huge lists).
- **Manual Code Review Fatigue:** Debating code style, unused variables, forbidden imports, or premature module splits in GitHub PRs instead of enforcing architectural invariants statically via `elm-review`.

---

## 3. Developer Intent vs. Elm Semantics

| Dimension | JavaScript / Jest / ESLint | Elm Testing & Review Discipline |
| :--- | :--- | :--- |
| **Unit Test Scope** | Asserting null checks, type safety, and defensive runtime error guards. | Testing domain logic invariants, state transition rules, and decoder roundtrips. |
| **Test Generation** | Manual example fixtures: `expect(add(2, 3)).toBe(5)`. | **Property-Based Fuzz Testing:** `fuzz2 Fuzz.int Fuzz.int "Commutative law" (\a b -> Expect.equal (add a b) (add b a))`. |
| **Linting & AST Analysis** | Regex/AST rule checking with frequent false positives and disable comments (`// eslint-disable`). | **`elm-review`:** Type-aware, whole-project static analysis that eliminates unused code, enforces module boundaries, and auto-fixes violations. |
| **Refactoring Confidence** | Tests required for every minor function to prevent regression. | Compiler handles type refactoring; tests focus on complex mathematical and serialization properties. |

---

## 4. The Pattern

### ❌ THE WRONG WAY: Redundant Type-Checking & Brittle Examples

```elm
module AntiPattern.TestExamples exposing (..)

import Expect
import Test exposing (Test, test)

-- ANTI-PATTERN: Testing what the compiler already guarantees
pointlessTest : Test
pointlessTest =
    test "String.length returns an integer" <|
        \_ ->
            -- Useless: The type signature String -> Int already guarantees this!
            Expect.equal (String.length "hello") 5
```

---

### ✅ THE RIGHT WAY: Property-Based Fuzz Tests & `elm-review` Enforcement

#### 1. Fuzz Testing JSON Roundtrip Invariants (`BookmarkTests.elm`)

```elm
module BookmarkTests exposing (suite)

import Expect
import Fuzz exposing (Fuzzer)
import Json.Decode as Decode
import Json.Encode as Encode
import Test exposing (Test, describe, fuzz)

type alias TestBookmark =
    { id : Int
    , title : String
    , url : String
    }

-- 1. Custom domain Fuzzer generating random valid records
bookmarkFuzzer : Fuzzer TestBookmark
bookmarkFuzzer =
    Fuzz.map3 TestBookmark
        Fuzz.int
        Fuzz.string
        (Fuzz.map (\s -> "https://example.com/" ++ s) Fuzz.string)

-- 2. Property Test: Encoding then Decoding must equal the original value!
suite : Test
suite =
    describe "Bookmark Domain Theorems"
        [ fuzz bookmarkFuzzer "JSON Serialization Roundtrip (Encode >> Decode == Identity)" <|
            \original ->
                let
                    encoded =
                        Encode.object
                            [ ( "id", Encode.int original.id )
                            , ( "title", Encode.string original.title )
                            , ( "url", Encode.string original.url )
                            ]

                    decoder =
                        Decode.map3 TestBookmark
                            (Decode.field "id" Decode.int)
                            (Decode.field "title" Decode.string)
                            (Decode.field "url" Decode.string)

                    decodedResult =
                        Decode.decodeValue decoder encoded
                in
                Expect.equal (Ok original) decodedResult
        ]
```

#### 2. Static Architectural Enforcement (`ReviewConfig.elm`)

Using `elm-review` to statically ban `Debug.*` calls, unused code, and forbidden dependencies across the entire codebase:

```elm
module ReviewConfig exposing (config)

import NoDebug.Log
import NoDebug.TodoOr Игорь
import NoUnused.CustomTypeConstructors
import NoUnused.Dependencies
import NoUnused.Exports
import NoUnused.Parameters
import NoUnused.Variables
import Review.Rule exposing (Rule)

config : List Rule
config =
    [ -- Prevent Debug statements from creeping into production
      NoDebug.Log.rule
    , NoDebug.TodoOr.rule
    -- Clean up dead code automatically
    , NoUnused.Variables.rule
    , NoUnused.Exports.rule
    , NoUnused.Parameters.rule
    , NoUnused.CustomTypeConstructors.rule []
    , NoUnused.Dependencies.rule
    ]
```
