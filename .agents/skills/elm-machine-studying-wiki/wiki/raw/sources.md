# Elm Machine Studying: Sources & Curriculum

This manifest tracks the raw sources and target curriculum for the Elm Machine Studying Knowledge Base.
Each source is classified by category to ensure balanced, comprehensive domain coverage across the Elm ecosystem.

## Ingestion Status Legend
- `[ ]` Queued (not yet downloaded/ingested)
- `[/]` Ingested to raw markdown / initial summary created
- `[x]` Fully integrated into wiki (entities updated, sovereign laws forged, cross-referenced, logged)

---

## 0. Theoretical Foundations & Meta-Studying (`cat:meta`)
*Foundational theory of Machine Studying, Recursive Language Models, and LLM-Wiki architecture.*

| Status | Title / Topic | Type | Path / Reference | Key Concepts |
| :--- | :--- | :--- | :--- | :--- |
| `[x]` | [[raw/llm-wiki]] | Architecture | `wiki/raw/llm-wiki.md` | 3-layer architecture, persistent compounding wiki, index/log navigation |
| `[x]` | [[raw/machine-studying]] | Research Paper | `wiki/raw/machine-studying.md` | Expertise metric, token efficiency, amortized context management |
| `[x]` | [[raw/recursive-language-models]] | Theory | `wiki/raw/recursive-language-models.md` | Recursive agent loops, compiler as sovereign pirate, grimoire synthesis |
| `[x]` | [[raw/the-great-collapse]] | Post-Mortem | `wiki/raw/the-great-collapse.md` | Historical catastrophic state loss, restoration laws |

---

## 1. Philosophy & Mental Models (`cat:philosophy`)
*Core design principles, creator philosophy, accidental complexity, Elm vs React/Haskell mental models.*

| Status | Title / Topic | Type | URL / Reference | Key Concepts |
| :--- | :--- | :--- | :--- | :--- |
| `[ ]` | The Life of a File | Talk / Essay | Evan Czaplicki | Premature modularization, flat codebases, single-file TEA |
| `[ ]` | Let's Be Mainstream | Talk | Evan Czaplicki | Usability vs purity, compiler friendliness, pragmatism |
| `[ ]` | Accidental Complexity | Talk | Evan Czaplicki | Elm language constraints, why Elm avoids certain features |

---

## 2. Modern Syntax & 0.19 Standards (`cat:syntax`)
*Elm 0.19.1 canonical syntax, pure FP primitives, breaking changes from 0.17/0.18.*

| Status | Title / Topic | Type | URL / Reference | Key Concepts |
| :--- | :--- | :--- | :--- | :--- |
| `[ ]` | Elm 0.19.1 Release & Migration Guide | Official Doc | https://elm-lang.org/news/0.19.1 | Deprecated syntax, String.fromInt, core library migrations |
| `[ ]` | Elm Syntax Reference & Let-In Rules | Guide | https://elm-lang.org/docs/syntax | Currying, pipeline operators `\|>`, record updates `{ model \| ... }` |

---

## 3. The Elm Architecture (TEA) & Lifecycles (`cat:tea`)
*Model, Msg, update, view, subscriptions, and Browser.* programs.*

| Status | Title / Topic | Type | URL / Reference | Key Concepts |
| :--- | :--- | :--- | :--- | :--- |
| `[ ]` | Guide: The Elm Architecture | Official Guide | https://guide.elm-lang.org/architecture/ | Model-Update-View cycle, `Cmd Msg`, `Sub Msg` |
| `[ ]` | Browser Program Variants | Guide | https://package.elm-lang.org/packages/elm/browser/latest/ | `sandbox` vs `element` vs `document` vs `application` |
| `[ ]` | URL Parsing & Routing | Guide | https://package.elm-lang.org/packages/elm/url/latest/ | `elm/url`, `Url.Parser`, SPA navigation lifecycle |

---

## 4. Type-Driven Design & State Modeling (`cat:types`)
*Custom types, pattern matching, making impossible states impossible, opaque types.*

| Status | Title / Topic | Type | URL / Reference | Key Concepts |
| :--- | :--- | :--- | :--- | :--- |
| `[ ]` | Making Impossible States Impossible | Talk | Richard Feldman | Custom types replacing booleans, domain modeling |
| `[ ]` | Slaying a UI Antipattern (RemoteData) | Article | Kris Jenkins | `NotAsked \| Loading \| Failure \| Success` pattern |
| `[ ]` | Opaque Types & API Design | Article / Guide | Elm Community | Module encapsulation, smart constructors |

---

## 5. JSON Decoders & Encoders (`cat:decoders`)
*Composable decoding pipelines, error handling, boundary parsing.*

| Status | Title / Topic | Type | URL / Reference | Key Concepts |
| :--- | :--- | :--- | :--- | :--- |
| `[ ]` | Guide: JSON Decoders & Encoders | Official Guide | https://guide.elm-lang.org/effects/json | `Json.Decode`, `map2`..`map8`, `andThen`, error payloads |
| `[ ]` | `elm/json` & Pipeline Decoders | Package Doc | https://package.elm-lang.org/packages/elm/json/latest/ | Composing complex nested structures, optional vs required |

---

## 6. JS Interop, Ports & Side-Effects (`cat:interop`)
*Flags, ports, web components, HTTP tasks, commands/subscriptions.*

| Status | Title / Topic | Type | URL / Reference | Key Concepts |
| :--- | :--- | :--- | :--- | :--- |
| `[ ]` | JavaScript Interop: Ports & Flags | Official Guide | https://guide.elm-lang.org/interop/ | Startup flags, asynchronous port message passing |
| `[ ]` | Custom Elements in Elm | Article / Guide | Luke Westby | Web components as the boundary escape hatch |
| `[ ]` | `elm/http` in Practice | Guide | https://package.elm-lang.org/packages/elm/http/latest/ | `Http.get`, `Http.post`, custom error handling |

---

## 7. Compiler Empathy & Error Anatomy (`cat:compiler`)
*Compiler-driven development, JSON reporter flags, error structure & resolution heuristics.*

| Status | Title / Topic | Type | URL / Reference | Key Concepts |
| :--- | :--- | :--- | :--- | :--- |
| `[ ]` | Compiler Errors as Assistants | Talk / Post | Evan Czaplicki | Error message anatomy, type mismatch hints |
| `[ ]` | Compiler-Driven Refactoring | Guide | Elm Community | "Follow the compiler errors" workflow |
| `[ ]` | `elm make --report=json` Spec | Tooling Doc | Compiler Spec | Structured compiler outputs for agents/tools |

---

## 8. Core Ecosystem & Packages (`cat:ecosystem`)
*Standard library modules, UI frameworks, testing, and tooling.*

| Status | Title / Topic | Type | URL / Reference | Key Concepts |
| :--- | :--- | :--- | :--- | :--- |
| `[ ]` | `elm/core` Standard Library Specs | Package Doc | https://package.elm-lang.org/packages/elm/core/latest/ | `Maybe`, `Result`, `List`, `Dict`, `Set`, `Task` |
| `[ ]` | `elm-ui` (Style Elements) Philosophy | Package / Guide | mdgriffith/elm-ui | Layout without CSS, UI modeling |
| `[ ]` | `elm-test` & Fuzz Testing | Guide | elm-explorations/test | Unit testing, property/fuzz testing patterns |

---

## 9. Anti-Patterns & False Friends (`cat:antipatterns`)
*Negative examples: unlearning JS/React component-itis and Haskell typeclass abstractions.*

| Status | Title / Topic | Type | URL / Reference | Key Concepts |
| :--- | :--- | :--- | :--- | :--- |
| `[ ]` | Why Elm Doesn't Have Components | Article / Talk | Elm Community | Avoiding sub-component state hierarchies |
| `[ ]` | Haskell/Pure FP False Friends in Elm | Guide | Elm Community | No Monads/Typeclasses, avoiding over-abstractions |
