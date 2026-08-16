# Elm Machine Studying: Synthesis Roadmap & Execution Queue

This `TODO.md` guides future agents and subagents in systematically distilling the ingested raw materials in `wiki/raw/` into permanent, compounding **Sovereign Laws** and **Concept Pages** in `wiki/` according to the 4-part Machine Studying mental model in `SKILL.md`.

---

## 🛠️ The Subagent Synthesis Contract

When assigning a subagent to synthesize a raw source from `wiki/raw/`:
1. **Input:** The subagent reads ONLY its assigned file in `wiki/raw/docs/`, `wiki/raw/transcripts/`, or `wiki/raw/error-catalog/`.
2. **Output:** The subagent creates a standalone grimoire page: `wiki/[Concept-Name].md`.
3. **Structure of Each Page:**
   - **The Sovereign Law:** A 1–2 sentence hard rule or mental model invariant.
   - **The Trigger & Context:** What specific problem, misconception, or compiler error string indicates this law is being broken.
   - **Developer Intent vs. Elm Semantics:** What developers (especially coming from JS/React/Haskell) think they are doing vs. why Elm operates this way.
   - **The Pattern:** Generalized code examples showing the **WRONG** anti-pattern and the **RIGHT** idiomatic solution.
4. **Coordination Step:**
   - Add a 10-word summary link to `wiki/index.md`.
   - Update `wiki/raw/sources.md` status for that source from `[/]` to `[x]`.
   - Append an entry to `wiki/log.md`.

---

## 📋 Category Synthesis Queues

### Batch 1: Philosophy & Mental Models (`cat:philosophy`)
*Overwriting JS/React component-itis and establishing Elm's radical simplicity.*

- [ ] **The Life of a File** (`wiki/raw/transcripts/the-life-of-a-file-evan-czaplicki.md`)
  - Target: `wiki/The-Life-of-a-File.md`
  - Focus: Why single-file TEA beats premature modularization; when to split modules based on data structures, not visual components.
- [ ] **Let's Be Mainstream!** (`wiki/raw/transcripts/lets-be-mainstream-evan-czaplicki.md`)
  - Target: `wiki/Elm-Pragmatism-Over-Purity.md`
  - Focus: Why Elm omits typeclasses and monads; compiler friendliness; designing for humans.
- [ ] **What is Success?** (`wiki/raw/transcripts/what-is-success-evan-czaplicki.md`)
  - Target: `wiki/Elm-Language-Evolution-Principles.md`
  - Focus: Long-term API stability, avoiding churn, community design principles.
- [ ] **Code is the Easy Part** (`wiki/raw/transcripts/code-is-the-easy-part-evan-czaplicki.md`)
  - Target: `wiki/Cognitive-Load-in-Elm.md`
  - Focus: Communication in codebase architecture; managing maintenance fatigue.

---

### Batch 2: Modern Syntax & 0.19 Standards (`cat:syntax`)
*Ground truth for Elm 0.19.1; eliminating 0.16–0.18 hallucinations.*

- [ ] **Elm Core Language Guide** (`wiki/raw/docs/elm-core-language-guide.md`)
  - Target: `wiki/Elm-019-Syntax-Ground-Truth.md`
  - Focus: Let-in scoping, record syntax, currying, pipeline operators (`|>`, `<|`).
- [ ] **Types as Sets** (`wiki/raw/docs/types-as-sets.md`)
  - Target: `wiki/Types-as-Sets.md`
  - Focus: Algebraic data type union cardinality; Venn diagram mental model for custom types.
- [ ] **Elm 0.19 Upgrade Nuances** (`wiki/raw/docs/elm-0190-announcement-upgrade.md`)
  - Target: `wiki/Elm-019-Breaking-Changes.md`
  - Focus: Removal of `toString`, dead code elimination invariants, package naming (`elm/*`).

---

### Batch 3: The Elm Architecture (TEA) & Lifecycles (`cat:tea`)
*Application structure, program variants, and SPA routing.*

- [ ] **The Elm Architecture Guide** (`wiki/raw/docs/the-elm-architecture-guide.md`)
  - Target: `wiki/The-Elm-Architecture-Core.md`
  - Focus: Model-Update-View cycle, pure message dispatch, `Cmd Msg` and `Sub Msg`.
- [ ] **`elm/browser` Specification** (`wiki/raw/docs/elmbrowser-specification.md`)
  - Target: `wiki/Browser-Program-Variants.md`
  - Focus: Differences between `sandbox`, `element`, `document`, and `application`.
- [ ] **Navigation & URL Parsing** (`wiki/raw/docs/navigation-url-parsing.md`)
  - Target: `wiki/SPA-Navigation-and-Url-Parsing.md`
  - Focus: `Browser.Navigation.Key`, `Url.Parser` combinators, SPA lifecycle.
- [ ] **Elm SPA RealWorld Reference** (`wiki/raw/docs/elm-spa-realworld-example-app.md`)
  - Target: `wiki/Canonical-SPA-Architecture.md`
  - Focus: Shared session state (`Viewer`), page module delegation without component nesting.

---

### Batch 4: Type-Driven Design & State Modeling (`cat:types`)
*Domain modeling, eliminating invalid states, and boundary safety.*

- [ ] **Making Impossible States Impossible** (`wiki/raw/transcripts/making-impossible-states-impossible-richard-feldman.md`)
  - Target: `wiki/Making-Impossible-States-Impossible.md`
  - Focus: Replacing multiple booleans/flags with custom types; structural validation.
- [ ] **How Elm Slays a UI Antipattern** (`wiki/raw/docs/how-elm-slays-a-ui-antipattern-kris-jenkins.md`)
  - Target: `wiki/RemoteData-Pattern.md`
  - Focus: `NotAsked | Loading | Failure e | Success a` modeling for async UI.
- [ ] **Parse, Don't Validate** (`wiki/raw/docs/parse-dont-validate-elm-radio-20.md`)
  - Target: `wiki/Parse-Dont-Validate-in-Elm.md`
  - Focus: Preserving type structure at boundaries; preventing shotgun parsing.

---

### Batch 5: JSON Decoders & Boundary Parsing (`cat:decoders`)
*Mastering composable data decoding and error boundary handling.*

- [ ] **Guide: JSON Decoding & Encoding** (`wiki/raw/docs/guide-json-decoding-encoding.md`)
  - Target: `wiki/JSON-Decoding-Primitives.md`
  - Focus: Primitive decoders, `map2`..`map8`, handling nullable/optional fields.
- [ ] **`elm/json` & Pipeline Decoders** (`wiki/raw/docs/elm-json-decode-pipeline.md`, `elmjson-package-documentation.md`)
  - Target: `wiki/JSON-Pipeline-Decoding.md`
  - Focus: Composing complex nested structures, `andThen` dependent decoding, custom error messages.

---

### Batch 6: JS Interop, Ports & Side-Effects (`cat:interop`)
*Safe boundaries, asynchronous port messaging, and web components.*

- [ ] **JavaScript Interop Guide** (`wiki/raw/docs/javascript-interop-guide.md`)
  - Target: `wiki/JS-Interop-Ports-and-Flags.md`
  - Focus: Flags for initialization, port commands/subscriptions, custom elements as escape hatches.
- [ ] **`elm/http` in Practice** (`wiki/raw/docs/elmhttp-specification.md`)
  - Target: `wiki/HTTP-Tasks-and-Commands.md`
  - Focus: `Http.get`, `Http.post`, `Http.expectJson`, error mapping.

---

### Batch 7: Compiler Empathy & Error Anatomy (`cat:compiler`)
*Distilling compiler diagnostics, error recovery, and 300 catalog issues.*

- [ ] **Compiler Errors for Humans & Compilers as Assistants** (`wiki/raw/docs/compiler-errors-for-humans-evan-czaplicki.md`, `compilers-as-assistants-evan-czaplicki.md`)
  - Target: `wiki/Compiler-Empathy-and-Refactoring.md`
  - Focus: Error message anatomy, type diffing heuristics, compiler-guided refactoring.
- [ ] **Elm JSON Error Output Specification** (`wiki/raw/docs/elm-json-error-output-specification.md`)
  - Target: `wiki/Structured-Compiler-Error-Parsing.md`
  - Focus: Parsing `elm make --report=json` for automated agent validation loops.
- [ ] **Elm Error Catalog Issues Distillation** (`wiki/raw/error-catalog/issues/`)
  - Target: `wiki/concepts/Compiler-Error-Taxonomy.md` & specific error recovery laws in `wiki/errors/`.
  - Focus: Extracting 4-part mental models for top recurring error patterns (record updates, missing cases, infinite types).

---

### Batch 8: Core Ecosystem & Tooling (`cat:ecosystem`)
*Standard library primitives and static analysis.*

- [ ] **`elm/core` Standard Library Specs** (`wiki/raw/docs/elmcore-module-specs.md`)
  - Target: `wiki/Elm-Core-Standard-Library.md`
  - Focus: `Maybe`, `Result`, `List`, `Dict`, `Set`, `Task` conventions.
- [ ] **`elm-explorations/test` & `elm-review`** (`wiki/raw/docs/elm-explorationstest.md`, `jfmengelselm-review.md`)
  - Target: `wiki/Elm-Testing-and-Review-Discipline.md`
  - Focus: Property-based testing, fuzzing, static rule enforcement.

---

### Batch 9: Anti-Patterns & False Friends (`cat:antipatterns`)
*Negative examples: what NOT to write when coming from JS, React, or Haskell.*

- [ ] **Structuring Web Apps & Component Pitfalls** (`wiki/raw/docs/structuring-web-apps-component-pitfalls.md`)
  - Target: `wiki/Antipattern-Component-Hierarchies.md`
  - Focus: Why Elm avoids React-style component encapsulation; flat state modeling.
- [ ] **Extensible Record Pitfalls** (`wiki/raw/docs/extensible-record-pitfalls.md`)
  - Target: `wiki/Antipattern-Extensible-Records.md`
  - Focus: Why `{ a | field : Type }` hurts compiler inference and error readability when overused.
