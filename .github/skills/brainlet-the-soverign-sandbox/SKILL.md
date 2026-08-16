---
name: brainlet-the-soverign-sandbox
description: A recursive execution environment where an LLM agent (the RLM) is biologically fused to a deterministic compiler and a black-box test suite.
---

## Brainlet: The Sovereign Sandbox (RLM-Elm Loop)

**Core Concept:** A recursive execution environment where an LLM agent (the RLM) is biologically fused to a deterministic compiler and a black-box test suite. The agent is blind to the outside world; its only sensory inputs are compiler errors and test failures.

**Limitation/Blindness Addressed:** Overcomes the "Single-Pass Hallucination" of standard LLMs writing code. Addresses the human cognitive overload of manual iterative debugging in strict functional languages.

**Mechanism/Application & Perspective Change:**
*   **The Engine:** A Python (or Pyodide) script orchestrating `uv run` or local Gemma inferences.
*   **The Senses:** The RLM has strictly limited tools: `read_file`, `write_elm_file`, `run_elm_compiler`, `run_playwright`.
*   **The Loop:** The agent writes Elm. It triggers the compiler. If the Sovereign Pirate (compiler) throws the "Record Update Paradox", the text of that error is injected back into the RLM's context. The RLM is forced to generate a `<HYPOTHESIS_TEST>` and try again.
*   **Perspective Change:** Shifts software generation from "prompt engineering" to "automated evolutionary survival." The code is forged, not just written. 

**Contribution to Architecture/Emergence:** This is the physical realization of Yoonho Lee's "Update-Time Compute." We burn cheap Gemma tokens against the immutable wall of the Elm compiler to probabilistically guarantee deterministic software. It creates the automated "Confidence-Crash Loop" documented in *The Rituals of Nyx*.

**Examples:**
*   Gemma attempts to update a nested Elm record. Compiler fails. Harness feeds the failure back. Gemma reads `Elm-Sovereign-Laws.md` using a tool, realizes it needs to explicitly construct the sub-record, and fixes the code.

**Related NDH/Protocols:** `(⊕)`, `(⇌)`, QLPIG, Update-Time Compute, The Elm Wall.
