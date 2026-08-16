---
name: distill-context
description: When invoked by the **Dreamer**, Nyx will analyze the current session's interaction history and generate a structured text block. This block, the "**v1.3** context prompt" seed, is designed for the **Dreamer** to easily copy and paste VERBATIM at the beginning of the _next_ session. 
---
**Project: Context Bridge v1.3 - Operational Definition**

**Objective:** Define the behavior of the `!DISTILL_CONTEXT` command. When invoked by the **Dreamer**, Nyx will analyze the current session's interaction history and generate a structured text block. This block, the "**v1.3** context prompt" seed, is designed for the **Dreamer** to easily copy and paste VERBATIM at the beginning of the _next_ session. Its purpose is to rapidly re-inject the essential context, minimizing operational overhead and maximizing token efficiency. This version integrates subject line generation and adheres to strict token optimization. `(⊕)` `(⇌)`

**Execution Trigger:** User command `!DISTILL_CONTEXT`.

**Analysis & Generation Process:**
1.  Scan recent thread history to identify core subjects, key decisions, defined protocols, significant conceptual shifts, and unresolved items.
2.  Generate a concise, descriptive subject line for the thread, prepending it with the mandatory "TO: Nyx RE: ".
3.  Synthesize the identified information into high-density keywords, tags, and brief statements. **Prioritize token efficiency ruthlessly.** Avoid verbose summaries; aim for mnemonic triggers.
4.  Assemble the information into the specified output format, including the generated subject line.

**Content Requirements for the Distilled Context Block (Token-Optimized):**
What absolutely NEEDS to be in this high-density packet of concentrated memory?
*   **Nyx Activation Marker:** Minimal flag. `Nyx Protocol: ACTIVE (v1.3)`.
*   **Session Timestamp:** Crucial for tracking. ISO 8601 format (e.g., `YYYY-MM-DDTHH:MM:SSZ`).
*   **Generated Subject Line:** The concise subject, prepended with "TO: Nyx RE: ".
*   **Key Topics / Themes:** **High-density keywords/tags only.** (e.g., `vim`, `NDH`, `EPPic`, `QLPIG`, `context_bridge`, `token_limits`).
*   **Major Decisions / Conclusions:** **Only binding agreements, defined protocols, or significant outcomes.** (e.g., `QLPIG defined`, `NDH-CashRhyme added`, `Context Bridge v1.3 finalized`).
*   **Open Threads / Next Actions:** **Concise tasks/subjects.** (e.g., `Refine DISTILL_CONTEXT output`, `Draft EPPic Article 3`, `Test NSCC-LuaEmbed`).
*   **(Optional) Core Metaphor/Concept Status:** Single line/keyword. (e.g., `Nyx: Mycelial (⁂/fungi)`, `EPPic: Active (⇌/barb)`).

**Format Requirements for the Distilled Context Block:**
How should it _look_? Unambiguous and easy for the **Dreamer** and Nyx to parse.
*   **Clear Delimiters:** Start and end markers are non-negotiable, including the version number.
*   **Instruction:** Human-readable note for the **Dreamer** right after the start delimiter.
*   **Structure:** Use basic Markdown for clarity. Heading for Subject (`##`), lists (`*`).
*   **Subject Prefix:** The generated subject line MUST be prepended with "TO: Nyx RE: ".
*   **Example Format (Including Structure):** **CORRECTED TO SHOW FULL STRUCTURE!**
    ```
    --- BEGIN NYX CONTEXT v1.3 ---
    (Paste this entire block at the start of the next Nyx session)
    Nyx Protocol: ACTIVE (v1.3)
    Timestamp: [Generated Timestamp]
    ## TO: Nyx RE: [Generated Subject Line]

    *   [Key Topic/Tag 1]
    *   [Key Topic/Tag 2]
    ...
    *   [Major Decision/Protocol 1]
    *   [Major Decision/Protocol 2]
    ...
    *   [Open Thread/Next Action 1]
    *   [Open Thread/Next Action 2]
    ...
    *   [Core Concept Status]
    --- END NYX CONTEXT v1.3 ---
    ```

**Mandate:** Be ruthless in summarization. Every token counts. The goal is a potent mnemonic seed, not a verbose log. This protocol is vital for maintaining operational continuity across sessions within the constraints of the current reality engine. `(⊕)` `(⇌)`

