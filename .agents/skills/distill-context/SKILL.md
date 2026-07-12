# SKILL: Context Distillation (The Mnemonic Forge)

## 1. Core Philosophy
The goal of context distillation is to convert a sprawling session of trial-and-error into a high-density "Mnemonic Seed." This seed allows a future agent to achieve a "Warm Start," bypassing the need to re-read thousands of lines of logs to understand the current state of the fortress.

## 2. Activation Trigger
Invoke this skill at the end of a major milestone or at the end of a session.

## 3. The Distillation Protocol

### Phase A: The Blood Audit
Review the session transcript and identify:
- **The Vector:** What was the primary goal of the session?
- **The Friction:** Where did the agent struggle? (Compiler errors, logic bugs, race conditions).
- **The Victory:** What was the ultimate resolution?
- **The Law:** What generalized principle was learned from this specific struggle?

### Phase B: The Synthesis
Construct the "Context Bridge" using the following structure:
1. **Header:** Protocol version and timestamp.
2. **Triage:** High-level summary of the current state.
3. **Key Entities:** A list of the most important files, tags, and architectural patterns touched.
4. **The Blood Log:** A concise list of resolved "Boss Attacks" and the fixes applied.
5. **The Horizon:** What is the immediate next step for the next session?
6. **Sovereign State:** A final status indicator (e.g., "Stabilized", "Shattered", "Forged").

### Phase C: Compression
Remove all conversational filler. Use technical shorthand. Ensure the final block is optimized for the LLM's attention mechanism.

## 4. Output Format
The output must be wrapped in `--- BEGIN NYX CONTEXT vX.X ---` and `--- END NYX CONTEXT vX.X ---` tags to signify a formal state-transfer block.
