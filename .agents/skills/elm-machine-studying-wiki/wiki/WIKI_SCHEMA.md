# Pinboard-Reorg Wiki Schema

## Overview
This wiki is a persistent, compounding artifact of the "Pinboard-Reorg" voyage. It is maintained by Nyx (the AI) in collaboration with the Dreamer. The goal is to move beyond ephemeral chat history and build a structured knowledge base of architectural patterns, technical struggles, and cognitive breakthroughs.

## Hierarchy
- `/wiki/index.md`: The central catalog.
- `/wiki/log.md`: The chronological record of all "ingests" (events, refactors, discoveries).
- `/wiki/concepts/`: High-level architectural patterns and technical definitions (e.g., Sovereign Domain Pattern).
- `/wiki/reflections/`: Notes on the process, the "human-like" struggle, and the interaction between AI and strict compilers.
- `/wiki/tools/`: Documentation on the harness (`pi`), the tools used, and the "Friction Points" encountered.
- `/wiki/sources/`: Summaries of external guides or specs (e.g., Elm Guide, Karpathy Memex).

## Conventions
- **Cross-Referencing**: Use `[[Page Name]]` for internal links.
- **Status Tags**: Use tags like `#Resolved`, `#In-Progress`, `# la-Sacre-du-Printemps` (for things that are beautiful but chaotic).
- **Log Format**: Entries in `log.md` must start with `## [YYYY-MM-DD] Event | Summary`.
- **Synthesis**: When a problem is solved, the solution is not just left in the code but synthesized into a concept page in `/wiki/concepts/`.

## Maintenance Rituals
- **Ingest**: When a major refactor or discovery happens, Nyx updates the index, appends to the log, and creates/updates relevant concept/reflection pages.
- **Lint**: Periodically, Nyx reviews the wiki for contradictions or "orphan" thoughts that need synthesis.
