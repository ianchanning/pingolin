# The Sovereign Laws of Elm Records

This page documents the specific, unforgiving syntactic constraints of the Elm compiler encountered during the `pinboard-reorg` project.

## Law 1: No Record-Update-as-Value
**The Failure:**
Attempting to use the `{ record | field = value }` syntax inside a `let` block or as a standalone value assignment.

**The Compiler's Reaction:**
`I am partway through parsing a record, but I got stuck here: ... I just saw a field name, so I was expecting to see an equals sign next.`

**The Truth:**
In Elm, the record update syntax is an **expression** that must be applied to an existing record. When used inside certain contexts (like a `let` binding that looks too much like a record literal to the parser), the compiler gets confused.

**The Fortification (The Fix):**
When updating sub-models within a larger model update:
1.  **Explicit Construction:** Construct the new sub-record from scratch using all required fields.
    `nextAuth = { token = t, proxyUrl = p, showLoginForm = s }`
2.  **Direct Update:** Perform the update directly within the final record update of the function return.
    `{ model | auth = { model.auth | token = t } }`

## Law 2: The "Sovereign Signal"
The compiler is not whining; it is a compass.
- **Parsing Error** $\rightarrow$ Your mental model of the syntax is a hallucination. Stop trying to "fix" the line and rewrite the block.
- **Type Mismatch** $\rightarrow$ Your logic has a gap. Re-examine the `Types.elm` contract.
