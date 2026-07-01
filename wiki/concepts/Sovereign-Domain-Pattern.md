# Sovereign Domain Pattern

## Definition
The Sovereign Domain Pattern is an architectural approach for managing state in strict functional languages (specifically Elm), designed to prevent the "God Module" problem while avoiding the pitfalls of "Component-based" thinking.

## The Core Thesis
In React/JS, components are the unit of decomposition (UI fragment = Local State + Methods). In Elm, this is a "recipe for disaster" because it leads to fragmented state and ontological confusion.

Instead, the application is divided into **Sovereign Domains**. A domain is a module built around a **Central Type**.

## The Architecture
1. **The Bottom Layer (Types)**: Pure data definitions (`Bookmark`, `SyncPhase`). No imports from other domains.
2. **The Middle Layer (Domains)**: Specialized modules (`Auth`, `Archive`, `BookmarkForm`). Each owns its own `Model`, `Msg`, `update`, and `view`.
3. **The Top Layer (Orchestrator)**: `Main.elm`. It nests the domain models and delegates messages.

## The "Sovereign" Mechanism
- **Message Wrapping**: `Main.Msg` contains wrappers like `GotAuthMsg Auth.Msg`.
- **Delegated Update**: `Main.update` routes messages to the domain's update function using an `updateWith` helper.
- **View Mapping**: `Main.view` uses `Html.map` to project domain views into the global message space.
- **Service Decoupling**: Services (like `Sync.elm`) do not depend on the `Model`. They operate on a `SyncEnv` (a projection of the state) to avoid circular dependencies and maintain a pure functional interface.

## Why it Works
- **Breaks Circularity**: By moving the root `Model` to a separate state module or `Main`, domain modules can depend on `Types` without depending on each other.
- **Cognitive Scaling**: Developers only need to hold one domain's logic in their head at a time.
- **Type Safety**: Leverages Elm's compiler to ensure that a message meant for `Auth` can never accidentally mutate the `Archive` state.

#SovereignDomain #ElmArchitecture #SovereignDecomposition
