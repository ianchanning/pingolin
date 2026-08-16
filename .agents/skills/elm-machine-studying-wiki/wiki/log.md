# Machine Studying & Grimoire Evolution Log

This is an append-only chronological log of all major ingests, grimoire law syntheses, baseline checkpoints, and lint passes in the Elm Machine Studying Knowledge Base.

---

## [2026-08-09] baseline | Baseline Established
- Restored baseline grimoire, blueprints, and agent skills at tag `pingolin-pwa@3.0.22` (branch `study-v3.0.22-baseline`).

## [2026-08-16] consolidation | Sovereign Skill Node Unified
- Consolidated root wiki and local skill wiki into unified self-contained skill node at `.agents/skills/elm-machine-studying-wiki/`.
- Symlinked root `wiki/` to `.agents/skills/elm-machine-studying-wiki/wiki/` for zero duplication.
- Updated `SKILL.md` to target skill-local wiki and raw directories.

## [2026-08-16] curriculum | Established 9-Pillar Elm Curriculum Manifest
- Created `wiki/raw/sources.md` establishing the 9 canonical pillars of Elm mastery (`cat:philosophy`, `cat:syntax`, `cat:tea`, `cat:types`, `cat:decoders`, `cat:interop`, `cat:compiler`, `cat:ecosystem`, `cat:antipatterns`).
- Initialized `wiki/log.md` for timestamped audit tracing.

## [2026-08-16] curriculum-enrichment | Canonical Links & Error-Catalog Blueprint Ingested
- Populated `wiki/raw/sources.md` with direct canonical links, Evan Czaplicki & Richard Feldman talk IDs, package specs, and production SPA reference repo (`elm-spa-example`).
- Integrated `elm/error-message-catalog` repository & issue tracker dataset specifications into `cat:compiler`.
- Codified the 4-part Error Distillation Schema (Trigger Code, Compiler Output, Developer Intent vs. Elm Semantics, Canonical Idiomatic Fix).

## [2026-08-16] ingest | Batch Ingested 3 Raw Sources
- Ingested raw source: Doc: Elm Core Language Guide (elm-core-language-guide.md)
- Ingested raw source: Doc: Elm 0.19.0 Announcement & Upgrade (elm-0190-announcement-upgrade.md)
- Ingested raw source: Doc: Types as Sets (types-as-sets.md)

## [2026-08-16] ingest | Batch Ingested 2 Raw Sources
- Ingested raw source: Transcript: The Life of a File (Evan Czaplicki) (the-life-of-a-file-evan-czaplicki.md)
- Ingested raw source: Transcript: Let's Be Mainstream! (Evan Czaplicki) (lets-be-mainstream-evan-czaplicki.md)

## [2026-08-16] ingest | Batch Ingested 26 Raw Sources
- Ingested raw source: Transcript: What is Success? (Evan Czaplicki) (what-is-success-evan-czaplicki.md)
- Ingested raw source: Transcript: Code is the Easy Part (Evan Czaplicki) (code-is-the-easy-part-evan-czaplicki.md)
- Ingested raw source: Doc: The Elm Architecture Guide (the-elm-architecture-guide.md)
- Ingested raw source: Doc: elm/browser Specification (elmbrowser-specification.md)
- Ingested raw source: Doc: Navigation & URL Parsing (navigation-url-parsing.md)
- Ingested raw source: Doc: Elm SPA RealWorld Example App (elm-spa-realworld-example-app.md)
- Ingested raw source: Transcript: Making Impossible States Impossible (Richard Feldman) (making-impossible-states-impossible-richard-feldman.md)
- Ingested raw source: Doc: How Elm Slays a UI Antipattern (Kris Jenkins) (how-elm-slays-a-ui-antipattern-kris-jenkins.md)
- Ingested raw source: Doc: Parse, Don't Validate (Elm Radio #20) (parse-dont-validate-elm-radio-20.md)
- Ingested raw source: Doc: Guide: JSON Decoding & Encoding (guide-json-decoding-encoding.md)
- Ingested raw source: Doc: elm/json Package Documentation (elmjson-package-documentation.md)
- Ingested raw source: Doc: elm-json-decode-pipeline (elm-json-decode-pipeline.md)
- Ingested raw source: Doc: JavaScript Interop Guide (javascript-interop-guide.md)
- Ingested raw source: Doc: elm/http Specification (elmhttp-specification.md)
- Ingested raw source: Doc: elm/time & elm/random (elmtime-elmrandom.md)
- Ingested raw source: Doc: Compiler Errors for Humans (Evan Czaplicki) (compiler-errors-for-humans-evan-czaplicki.md)
- Ingested raw source: Doc: Compilers as Assistants (Evan Czaplicki) (compilers-as-assistants-evan-czaplicki.md)
- Ingested raw source: Doc: Elm JSON Error Output Specification (elm-json-error-output-specification.md)
- Ingested raw source: Doc: Elm Error Message Catalog (Repo) (elm-error-message-catalog-repo.md)
- Ingested raw source: Doc: Elm Error Message Catalog (Issues & Discussions) (elm-error-message-catalog-issues-discussions.md)
- Ingested raw source: Doc: elm/core Module Specs (elmcore-module-specs.md)
- Ingested raw source: Doc: mdgriffith/elm-ui Guide & Specs (mdgriffithelm-ui-guide-specs.md)
- Ingested raw source: Doc: elm-explorations/test (elm-explorationstest.md)
- Ingested raw source: Doc: jfmengels/elm-review (jfmengelselm-review.md)
- Ingested raw source: Doc: Structuring Web Apps & Component Pitfalls (structuring-web-apps-component-pitfalls.md)
- Ingested raw source: Doc: Extensible Record Pitfalls (extensible-record-pitfalls.md)

## [2026-08-16] ingest | Batch Ingested 2 Raw Sources
- Ingested raw source: Repo: elm/error-message-catalog
- Ingested raw source: Issues: elm/error-message-catalog issues archive

## [2026-08-16] synthesis | Batch 1: Philosophy & Mental Models (4 Grimoires)
- Synthesized `wiki/The-Life-of-a-File.md` from `wiki/raw/transcripts/the-life-of-a-file-evan-czaplicki.md` (organic file growth, data-centric module boundaries, eliminating micro-TEA anti-patterns).
- Synthesized `wiki/Elm-Pragmatism-Over-Purity.md` from `wiki/raw/transcripts/lets-be-mainstream-evan-czaplicki.md` (accessible semantics, compiler empathy, zero runtime exceptions over academic typeclasses/monads).
- Synthesized `wiki/Elm-Language-Evolution-Principles.md` from `wiki/raw/transcripts/what-is-success-evan-czaplicki.md` (ecosystem sustainability, deliberate API design, preventing maintenance fatigue).
- Synthesized `wiki/Cognitive-Load-in-Elm.md` from `wiki/raw/transcripts/code-is-the-easy-part-evan-czaplicki.md` (minimizing cognitive load through explicit architectures and transparent data flow).
- Updated `wiki/index.md` and compiled `wiki/raw/sources.md` status.

## [2026-08-16] synthesis | Batch 2: Modern Syntax & 0.19 Standards (3 Grimoires)
- Synthesized `wiki/Elm-019-Syntax-Ground-Truth.md` from `wiki/raw/docs/elm-core-language-guide.md` (let-in scoping, simple variable record update bases, currying, pipeline operators).
- Synthesized `wiki/Types-as-Sets.md` from `wiki/raw/docs/types-as-sets.md` (algebraic data cardinality, product multiplication vs sum addition, eliminating boolean blindness).
- Synthesized `wiki/Elm-019-Breaking-Changes.md` from `wiki/raw/docs/elm-0190-announcement-upgrade.md` (abolition of polymorphic toString, elm/* package namespace migration, compiler DCE and --optimize rules).
- Updated `wiki/index.md` and compiled `wiki/raw/sources.md` status.

## [2026-08-16] synthesis | Batch 3: The Elm Architecture (TEA) & Lifecycles (4 Grimoires)
- Synthesized `wiki/The-Elm-Architecture-Core.md` from `wiki/raw/docs/the-elm-architecture-guide.md` (pure message dispatch, model reducer invariants, managed command descriptions).
- Synthesized `wiki/Browser-Program-Variants.md` from `wiki/raw/docs/elmbrowser-specification.md` (topologies, signatures, and capabilities of sandbox, element, document, and application).
- Synthesized `wiki/SPA-Navigation-and-Url-Parsing.md` from `wiki/raw/docs/navigation-url-parsing.md` (Browser.UrlRequest state machine, Nav.Key security invariant, Url.Parser combinators).
- Synthesized `wiki/Canonical-SPA-Architecture.md` from `wiki/raw/docs/elm-spa-realworld-example-app.md` (RealWorld reference architecture, page module delegation, shared Viewer/Session state).
- Updated `wiki/index.md` and compiled `wiki/raw/sources.md` status.

## [2026-08-16] synthesis | Batch 4: Type-Driven Design & State Modeling (3 Grimoires)
- Synthesized `wiki/Making-Impossible-States-Impossible.md` from `wiki/raw/transcripts/making-impossible-states-impossible-richard-feldman.md` (structural validation, phase custom types, Zipper collections).
- Synthesized `wiki/RemoteData-Pattern.md` from `wiki/raw/docs/how-elm-slays-a-ui-antipattern-kris-jenkins.md` (4-state disjoint union lifecycle, eliminating empty list and 0-count UI flashes).
- Synthesized `wiki/Parse-Dont-Validate-in-Elm.md` from `wiki/raw/docs/parse-dont-validate-elm-radio-20.md` (boundary parsing, opaque domain types, preventing shotgun parsing).
- Updated `wiki/index.md` and compiled `wiki/raw/sources.md` status.

## [2026-08-16] synthesis | Batch 5: JSON Decoders & Boundary Parsing (2 Grimoires)
- Synthesized `wiki/JSON-Decoding-Primitives.md` from `wiki/raw/docs/guide-json-decoding-encoding.md` (primitive decoders, path selectors, map2..map8, explicit encoding).
- Synthesized `wiki/JSON-Pipeline-Decoding.md` from `wiki/raw/docs/elm-json-decode-pipeline.md` & `wiki/raw/docs/elmjson-package-documentation.md` (pipeline decoders, overcoming map8 limit, andThen dependent decoding, custom error validation).
- Updated `wiki/index.md` and compiled `wiki/raw/sources.md` status.

## [2026-08-16] synthesis | Batch 6: JS Interop, Ports & Side-Effects (2 Grimoires)
- Synthesized `wiki/JS-Interop-Ports-and-Flags.md` from `wiki/raw/docs/javascript-interop-guide.md` (resilient Value flags, asynchronous typed ports, Custom Element DOM escapes).
- Synthesized `wiki/HTTP-Tasks-and-Commands.md` from `wiki/raw/docs/elmhttp-specification.md` (declarative Http.expectJson, exhaustive Http.Error recovery, atomic Task.andThen pipelines).
- Updated `wiki/index.md` and compiled `wiki/raw/sources.md` status.

## [2026-08-16] synthesis | Batch 7: Compiler Empathy & Error Anatomy (3 Grimoires)
- Synthesized `wiki/Compiler-Empathy-and-Refactoring.md` from `wiki/raw/docs/compiler-errors-for-humans-evan-czaplicki.md` & `compilers-as-assistants-evan-czaplicki.md` (empathetic diagnostic formatting, compiler-driven refactoring workflows).
- Synthesized `wiki/Structured-Compiler-Error-Parsing.md` from `wiki/raw/docs/elm-json-error-output-specification.md` (elm make --report=json parsing, automated agent AST evaluation loops).
- Synthesized `wiki/concepts/Compiler-Error-Taxonomy.md` from 300 issues in `wiki/raw/error-catalog/issues/` (5 diagnostic families: parsing, scope, type inference, exhaustiveness, optimization).
- Updated `wiki/index.md` and compiled `wiki/raw/sources.md` status.

## [2026-08-16] synthesis | Batch 8: Core Ecosystem & Tooling (2 Grimoires)
- Synthesized `wiki/Elm-Core-Standard-Library.md` from `wiki/raw/docs/elmcore-module-specs.md` (total collection operations, Dict comparable restrictions, O(1) list prepend disciplines).
- Synthesized `wiki/Elm-Testing-and-Review-Discipline.md` from `wiki/raw/docs/elm-explorationstest.md` & `wiki/raw/docs/jfmengelselm-review.md` (fuzz property testing with Fuzz/Expect, static architectural rules with elm-review).
- Updated `wiki/index.md` and compiled `wiki/raw/sources.md` status.

## [2026-08-16] synthesis | Batch 9: Anti-Patterns & False Friends (2 Grimoires)
- Synthesized `wiki/Antipattern-Component-Hierarchies.md` from `wiki/raw/docs/structuring-web-apps-component-pitfalls.md` (banishing React-style stateful components, flat page models, pure stateless view functions).
- Synthesized `wiki/Antipattern-Extensible-Records.md` from `wiki/raw/docs/extensible-record-pitfalls.md` (banning extensible records as domain models, preventing compiler error explosions).
- Updated `wiki/index.md` and compiled `wiki/raw/sources.md` status.

## [2026-08-16] reflection | Machine Studying & LLM Wiki Synthesis Retrospective
- Synthesized `wiki/reflections/Machine-Studying-Synthesis-Retrospective.md` analyzing the theoretical collapse of inference token costs via pre-computed cognitive compilation.
- Codified the 4 strategic future horizons: Automated Wiki-Lint (`wiki-lint`), Self-Healing Error Ingestion, StudyBench Empirical Benchmarking, and Pinboard Codebase Application.
- Updated `wiki/index.md` and enhanced `.agents/skills/elm-machine-studying-wiki/SKILL.md`.

## [2026-08-16] synthesis | Batch 10: Pingolin Architectural Specs & Migration Blueprints (4 Grimoires)
- Synthesized `wiki/Pingolin-RPC-Spinal-Cord.md` from `roadmap-v3-the-lobotomy.md` & `roadmap-v4-refactor.md` (dumb muscle worker, correlated request IDs, Elm Sovereign General).
- Synthesized `wiki/Pingolin-Sync-Engine-V2.md` from `003-sync-v2.md` (fast bootstrap, cursor crawl background hydration, dates sentinel reconciliation).
- Synthesized `wiki/Pingolin-Federated-Domain-Architecture.md` from `roadmap-v5-domain-migration.md` (federated state ownership: Auth, Archive, BookmarkForm, Sync via updateWith delegation).
- Synthesized `wiki/Pingolin-Universal-Testing-Fortress.md` from `004-testing-scenarios.md` (black-box E2E Playwright architecture, Page Object Models, proxy simulator routing).
- Updated `wiki/index.md` and compiled `wiki/raw/sources.md` status.

## [2026-08-16] revision | The Compiler as Sovereign Pirate Grimoire Upgrade
- Upgraded `wiki/concepts/The-Compiler-as-Sovereign-Pirate.md` into a full 4-part mental model grimoire integrating Evan Czaplicki's Compiler Empathy thesis, 300-issue error taxonomy, and fearless refactoring workflows.
- Linked in `wiki/index.md`.
