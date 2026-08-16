# Elm Machine Studying: Sources & Curriculum

This manifest tracks raw source material for building the Elm LLM-Wiki Knowledge Base.
Ingest these sources into `wiki/raw/` as markdown files, talk transcripts, or repo snapshots.

## Status Legend
- `[ ]` Queued (not yet ingested)
- `[/]` Ingested to `wiki/raw/` / initial summary created
- `[x]` Fully compiled into `wiki/` (entities updated, sovereign laws forged, cross-referenced, logged)

---

## 0. Theoretical Foundations & Meta-Studying (`cat:meta`)
*Foundational theory of Machine Studying, Recursive Language Models, and LLM-Wiki architecture.*

| Status | Title / Topic | Type | Path / Reference | Key Concepts |
| :--- | :--- | :--- | :--- | :--- |
| `[x]` | [[raw/llm-wiki]] | Architecture | `wiki/raw/llm-wiki.md` | 3-layer architecture, persistent compounding wiki, index/log navigation |
| `[x]` | [[raw/machine-studying]] | Research Paper | `wiki/raw/machine-studying.md` | Expertise metric, token efficiency, amortized context management |
| `[x]` | [[raw/recursive-language-models]] | Theory | `wiki/raw/recursive-language-models.md` | Recursive agent loops, compiler as sovereign pirate, grimoire synthesis |
| `[x]` | [[raw/the-great-collapse]] | Post-Mortem | `wiki/raw/the-great-collapse.md` | Historical catastrophic state loss, recovery rituals |

---

## 1. Philosophy & Mental Models (`cat:philosophy`)
*Understanding Elm's radical simplicity, anti-accidental complexity, and file structuring.*

| Status | Title / Topic | Type | Link / Source | Key Concepts |
| :--- | :--- | :--- | :--- | :--- |
| `[/]` | **The Life of a File** (Evan Czaplicki) | Talk / Video | [YouTube: XpDsk374LDE](https://www.youtube.com/watch?v=XpDsk374LDE) | Why single-file TEA beats micro-components, when to split modules, data structures over abstractions |
| `[/]` | **Let's Be Mainstream!** (Evan Czaplicki) | Talk / Video | [YouTube: oYk8CKH7OhE](https://www.youtube.com/watch?v=oYk8CKH7OhE) | Pragmatism over type-theory purity, user-focused design, why Elm omits typeclasses/monads |
| `[/]` | **What is Success?** (Evan Czaplicki) | Talk / Video | [YouTube: uGlzRt-FYto](https://www.youtube.com/watch?v=uGlzRt-FYto) | The long-term philosophy of Elm, community dynamics, API stability |
| `[/]` | **Code is the Easy Part** (Evan Czaplicki) | Talk / Video | [YouTube: DSjbTC-hvqQ](https://www.youtube.com/watch?v=DSjbTC-hvqQ) | Communication, cognitive load in software maintenance, design over feature sprawl |

---

## 2. Modern Syntax & 0.19 Standards (`cat:syntax`)
*Establishing the ground truth for Elm 0.19.1 and eliminating stale 0.16–0.18 hallucinations.*

| Status | Title / Topic | Type | Link / Source | Key Concepts |
| :--- | :--- | :--- | :--- | :--- |
| `[/]` | **Elm Core Language Guide** | Official Guide | [guide.elm-lang.org/core_language.html](https://guide.elm-lang.org/core_language.html) | Primitive types, functions, let-in expressions, record syntax, pipelines (`\|>`, `<\|`) |
| `[/]` | **Elm 0.19.0 Announcement & Upgrade** | Release Post | [elm-lang.org/news/0.19.0](https://elm-lang.org/news/small-assets-without-the-headache) | Breaking changes: removal of `toString`, package reorganization (`elm/*`), dead code elimination |
| `[ ]` | **Elm 0.19.1 Release Notes** | Release Post | [elm-lang.org/news/0.19.1](https://elm-lang.org/news/0.19.1) | Error message refinements, parser performance, modern compiler behavior |
| `[/]` | **Types as Sets** | Official Appendix | [guide.elm-lang.org/appendix/types_as_sets.html](https://guide.elm-lang.org/appendix/types_as_sets.html) | Type union cardinality, algebraic data representation, Venn-diagram mental model |

---

## 3. The Elm Architecture (TEA) & Lifecycles (`cat:tea`)
*The standard state-management loop and application runtime variants.*

| Status | Title / Topic | Type | Link / Source | Key Concepts |
| :--- | :--- | :--- | :--- | :--- |
| `[/]` | **The Elm Architecture Guide** | Official Guide | [guide.elm-lang.org/architecture/](https://guide.elm-lang.org/architecture/) | `Model`, `Msg`, `update`, `view`, `Cmd Msg`, `Sub Msg` |
| `[/]` | **`elm/browser` Specification** | Package Doc | [package.elm-lang.org/packages/elm/browser/latest/Browser](https://package.elm-lang.org/packages/elm/browser/latest/Browser) | `sandbox`, `element`, `document`, and `application` program entrypoints |
| `[/]` | **Navigation & URL Parsing** | Official Guide | [guide.elm-lang.org/webapps/navigation.html](https://guide.elm-lang.org/webapps/navigation.html) | SPA routing, `Browser.Navigation.Key`, `Url.Parser` pattern |
| `[/]` | **Elm SPA RealWorld Example App** | Codebase (Snapshots) | [GitHub: rtfeldman/elm-spa-example](https://github.com/rtfeldman/elm-spa-example) | Canonical production SPA layout: page modules, shared session state, global `Viewer` |

---

## 4. Type-Driven Design & State Modeling (`cat:types`)
*Using the type system to restrict invalid states and eliminate runtime bugs.*

| Status | Title / Topic | Type | Link / Source | Key Concepts |
| :--- | :--- | :--- | :--- | :--- |
| `[/]` | **Making Impossible States Impossible** (Richard Feldman) | Talk / Video | [YouTube: IcgmSRJHu_8](https://www.youtube.com/watch?v=IcgmSRJHu_8) | Custom Types replacing booleans/flags, domain modeling, structural validation |
| `[/]` | **How Elm Slays a UI Antipattern** (Kris Jenkins) | Article | [blog.jenkster.com/2016/06/how-elm-slays-a-ui-antipattern.html](http://blog.jenkster.com/2016/06/how-elm-slays-a-ui-antipattern.html) | `RemoteData` pattern (`NotAsked \| Loading \| Failure \| Success`), clean asynchronous UI state |
| `[ ]` | **Scaling Elm Apps** (Richard Feldman) | Talk / Video | [YouTube: DoA4Txgo4Mo](https://www.youtube.com/watch?v=DoA4Txgo4Mo) | Opaque types, extensible records vs concrete types, module API boundaries |
| `[/]` | **Parse, Don't Validate** (Elm Radio #20) | Podcast / Transcript | [elm-radio.com/episode/parse-dont-validate](https://elm-radio.com/episode/parse-dont-validate/) | Preserving type structure at input boundaries, avoiding shotgun parsing |

---

## 5. JSON Decoders & Boundary Parsing (`cat:decoders`)
*Mastering composable data decoding—the primary hurdle for language models in Elm.*

| Status | Title / Topic | Type | Link / Source | Key Concepts |
| :--- | :--- | :--- | :--- | :--- |
| `[/]` | **Guide: JSON Decoding & Encoding** | Official Guide | [guide.elm-lang.org/effects/json.html](https://guide.elm-lang.org/effects/json.html) | `Json.Decode.string`, `map2`..`map8`, handling nullable/optional fields |
| `[/]` | **`elm/json` Package Documentation** | Package Doc | [package.elm-lang.org/packages/elm/json/latest/](https://package.elm-lang.org/packages/elm/json/latest/) | Primitive decoders, `andThen` for dependent decoding, custom error messages |
| `[/]` | **`elm-json-decode-pipeline`** | Package Doc | [package.elm-lang.org/packages/NoRedInk/elm-json-decode-pipeline/latest/](https://package.elm-lang.org/packages/NoRedInk/elm-json-decode-pipeline/latest/) | Pipeline syntax (`decode Type \|> required "field" int \|> optional "opt" string ""`) |

---

## 6. JS Interop, Ports & Side-Effects (`cat:interop`)
*Safe boundaries, commands/subscriptions, and web components.*

| Status | Title / Topic | Type | Link / Source | Key Concepts |
| :--- | :--- | :--- | :--- | :--- |
| `[/]` | **JavaScript Interop Guide** | Official Guide | [guide.elm-lang.org/interop/](https://guide.elm-lang.org/interop/) | Flags for startup state, Ports for async messaging, Custom Elements (Web Components) |
| `[/]` | **`elm/http` Specification** | Package Doc | [package.elm-lang.org/packages/elm/http/latest/](https://package.elm-lang.org/packages/elm/http/latest/) | `Http.get`, `Http.post`, `Http.expectJson`, `Http.Error` handling, progress tracking |
| `[/]` | **`elm/time` & `elm/random`** | Package Docs | [elm/time](https://package.elm-lang.org/packages/elm/time/latest/) · [elm/random](https://package.elm-lang.org/packages/elm/random/latest/) | Pure random generators via `Random.generate`, POSIX time, `Time.every` subscriptions |

---

## 7. Compiler Empathy & Error Anatomy (`cat:compiler`)
*The compiler feedback loop, structured diagnostics, and real developer failure modes.*

| Status | Title / Topic | Type | Link / Source | Key Concepts |
| :--- | :--- | :--- | :--- | :--- |
| `[/]` | **Compiler Errors for Humans** (Evan Czaplicki) | Article | [elm-lang.org/news/compiler-errors-for-humans](https://elm-lang.org/news/compiler-errors-for-humans) | Design principles behind Elm's error messages, empathy, formatting, naming suggestions |
| `[/]` | **Compilers as Assistants** (Evan Czaplicki) | Article | [elm-lang.org/news/compilers-as-assistants](https://elm-lang.org/news/compilers-as-assistants) | Type diffing heuristics, record field diffs, compiler as a refactoring partner |
| `[/]` | **Elm JSON Error Output Specification** | Tooling Ref | [elm make --report=json schema](https://github.com/elm/compiler/blob/master/compiler/src/Reporting/Doc.hs) | Parsing structured compiler errors for automated agent evaluation loops |
| `[/]` | **Elm Error Message Catalog (Repo)** | Markdown / Code | [github.com/elm/error-message-catalog](https://github.com/elm/error-message-catalog) | Minimal reproducible examples of all major Elm compiler errors, categorized by failure mode |
| `[/]` | **Elm Error Message Catalog (Issues & Discussions)** | Issue Archive (Markdown) | [github.com/elm/error-message-catalog/issues](https://github.com/elm/error-message-catalog/issues) | Real developer confusion patterns, tricky edge cases, record update traps, type inference blockers |

---

## 8. Core Ecosystem & Modern Tooling (`cat:ecosystem`)
*The standard library and essential community tooling.*

| Status | Title / Topic | Type | Link / Source | Key Concepts |
| :--- | :--- | :--- | :--- | :--- |
| `[/]` | **`elm/core` Module Specs** | Package Doc | [package.elm-lang.org/packages/elm/core/latest/](https://package.elm-lang.org/packages/elm/core/latest/) | `Maybe`, `Result`, `List`, `Dict`, `Set`, `String`, `Basics`, `Task` |
| `[/]` | **`mdgriffith/elm-ui` Guide & Specs** | Package / Guide | [package.elm-lang.org/packages/mdgriffith/elm-ui/latest/](https://package.elm-lang.org/packages/mdgriffith/elm-ui/latest/) | Layout without CSS: `row`, `column`, `el`, spacing, alignment, responsive design |
| `[/]` | **`elm-explorations/test`** | Package Doc | [package.elm-lang.org/packages/elm-explorations/test/latest/](https://package.elm-lang.org/packages/elm-explorations/test/latest/) | Unit testing, fuzz / property testing, `Expect` module patterns |
| `[/]` | **`jfmengels/elm-review`** | Tooling Doc | [package.elm-lang.org/packages/jfmengels/elm-review/latest/](https://package.elm-lang.org/packages/jfmengels/elm-review/latest/) | Static analysis for Elm, preventing anti-patterns at compile time |

---

## 9. Anti-Patterns & False Friends (`cat:antipatterns`)
*Negative examples: what NOT to write when coming from JS, React, or Haskell.*

| Status | Title / Topic | Type | Link / Source | Key Concepts |
| :--- | :--- | :--- | :--- | :--- |
| `[/]` | **Structuring Web Apps & Component Pitfalls** | Official Guide | [guide.elm-lang.org/webapps/structure.html](https://guide.elm-lang.org/webapps/structure.html) | Why Elm does not have React-style stateful components, avoiding premature modules |
| `[ ]` | **The Phantom Builder Pattern** (Elm Radio #40) | Podcast / Transcript | [elm-radio.com/episode/phantom-builder-pattern](https://elm-radio.com/episode/phantom-builder-pattern/) | Safe API design using phantom types vs runtime check antipatterns |
| `[/]` | **Extensible Record Pitfalls** | Article / Discourse | [Elm Discourse: Extensible Records Guide](https://discourse.elm-lang.org/t/how-to-use-extensible-records-and-when-not-to/2478) | Why `{ a \| foo : String }` hurts compiler errors and type inference when overused |

---

## Ingestion Pipelines & Protocols

1. **Talk Transcripts:** For YouTube talks (e.g., *The Life of a File*, *Making Impossible States Impossible*), extract transcripts via `yt-dlp --write-auto-sub --skip-download` into `wiki/raw/transcripts/`.
2. **Package Documentation:** Scrape official package modules (`elm/json`, `elm/browser`, `elm/core`) into markdown preserving explicit type signatures (`Type -> Type`).
3. **Canonical Code Repositories:** Keep reference snapshots (such as `rtfeldman/elm-spa-example`) under `wiki/raw/repos/` to ground SPA routing and session patterns.
4. **Compiler Error Catalog Ingestion:** Clone `elm/error-message-catalog` and archive its issues into `wiki/raw/error-catalog/` to extract error recovery laws.

### Error Distillation Schema (4-Part Mental Model):
When reading an error issue or catalog entry, synthesize it into the following 4-part structure:
- **Trigger Code:** Minimal reproducible Elm code snippet.
- **Compiler Output:** Exact error message and hint text from `elm make`.
- **Developer Intent vs. Elm Semantics:** What the developer thought they were expressing vs. why the compiler halted.
- **Canonical Idiomatic Fix:** Modern Elm 0.19.1 idiomatic resolution.
