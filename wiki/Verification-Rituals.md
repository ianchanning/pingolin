# The Ritual of the Single Test

## The Sovereign Law
To prevent "Context Bloat" and "Log Noise," E2E verification must be performed as a series of isolated rituals, not as a monolithic blast.

## The Trigger
Running `npm test` or `playwright test` on the whole suite produces logs so voluminous that specific error signals (e.g., a single `RPC_ERROR` in one scenario) are lost in the noise of others.

## The Pattern

### WRONG: The Monolithic Blast
`npx playwright test tests/fortress.spec.ts`
Result: 28 scenarios run. 10,000 lines of logs. Signal-to-noise ratio: 0.01.

### RIGHT: The Ritual of One
`npx playwright test tests/fortress.spec.ts -g "Scenario X"`
Result: One scenario runs. Precise logs for one path. Signal-to-noise ratio: 1.0.
