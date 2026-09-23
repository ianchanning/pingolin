# Nested Record Updates

## The Sovereign Law
Avoid complex nested record updates within a single record update expression. Decouple nested updates into local bindings to ensure parser clarity and avoid ambiguous syntax errors.

## The Trigger & Compiler Output
**Error:** `PROBLEM IN RECORD`
**Diagnostic:** `I just saw a field name, so I was expecting to see an equals sign next.`
**Pointer:** Usually points to the comma following a nested record update within a parent update.

## Developer Intent vs. Elm Semantics
**Intent:** The developer attempts to update a parent record and a child record in a single atomic operation for brevity.
**Semantics:** The Elm compiler's parser can struggle with the transition from a nested update block `{ ... | ... }` back to the parent update's field list, leading it to misinterpret the subsequent field name as a definition rather than an update.

## The Pattern

### ❌ THE WRONG WAY
```elm
update msg model =
    case msg of
        SomeMsg val ->
            ( { model | child = { model.child | field = val }, parentField = "updated" }, Cmd.none )
```

### ✅ THE RIGHT WAY
```elm
update msg model =
    case msg of
        SomeMsg val ->
            let
                nextChild = { model.child | field = val }
            in
            ( { model | child = nextChild, parentField = "updated" }, Cmd.none )
```
