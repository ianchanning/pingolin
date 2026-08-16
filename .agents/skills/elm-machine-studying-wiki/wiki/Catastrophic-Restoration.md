# The Law of Catastrophic Restoration

## The Sovereign Law
When a module exhibits structural corruption (missing function bodies, missing variable declarations, or fragmented logic blocks), **cease all surgical editing immediately**. The cost of deducing missing logic exceeds the cost of total restoration.

## The Trigger
A "simple" syntax fix (e.g., fixing a parenthesis) reveals a cascade of `Undefined Variable` errors for variables that should logically exist within the function scope.

## The Pattern

### WRONG: The Surgical Struggle
1. Fix syntax error.
2. Find undefined variable `x`.
3. Hypothesis: `x` was defined in a `let` block.
4. Try to recreate the `let` block.
5. Find undefined variable `y`.
6. Repeat until madness.

### RIGHT: The Total Restoration
1. Identify the last known-good tag or commit.
2. Extract the authoritative file:
   `git show [tag]:[path/to/file] > [path/to/file]`
3. Re-compile and verify.
