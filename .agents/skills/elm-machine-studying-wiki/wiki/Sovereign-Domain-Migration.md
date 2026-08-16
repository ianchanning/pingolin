# Sovereign Domain Migration

## Overview
The migration from a "flat model" to a "federated domain" architecture in the Pingolin PWA to ensure 30Y durability and developer sanity.

## Core Concept
Moving state ownership from a global `Main.Model` into specialized domain models:
- `Auth.Model`: Credentials and entry rituals.
- `Archive.Model`: Search orchestration and bookmark display.
- `BookmarkForm.Model`: Input handling and tag discovery.

## Hard-Won Wisdom
When delegating updates to child domains, avoid the temptation to manually "patch" the child record in the parent orchestrator. 

**The Trap**:
`nextAuth = { model.auth | token = nextEnv.token }` 
If `model.auth` had `showLoginForm = True`, it stays `True` even if `nextEnv.token` is now populated.

**The Solution**:
Explicitly define the new state or call a domain-specific "hydration" function that ensures internal consistency (e.g., `showLoginForm = token == ""`). Boring, explicit code beats 'clever' record updates every time when facing the High Priest of Elm.

## Related
- [[Fixing-State-Loss-in-Federated-Models]]
- [[Elm-Sovereign-Laws]]
