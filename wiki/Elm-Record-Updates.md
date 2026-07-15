# Elm Record Updates: The Law of the Simple Base

## The Sovereign Law
The base of a record update `{ record | field = value }` must be a **simple variable**. It cannot be a qualified name (e.g., `Module.value`) or another record update expression. Nested updates are strictly forbidden.

## The Trigger
The compiler throws a "PROBLEM IN RECORD" error:
`"I just saw a field name, so I was expecting to see an equals sign next."`
or
`"I was expecting to see a record field defined next."`
...when you are attempting to use the `|` update syntax with a complex base.

## The Pattern

### ❌ THE WRONG WAY (Qualified Base)
```elm
-- This fails because AppState.init is a qualified expression
{ AppState.init | status = "Updating..." }
```

### ❌ THE WRONG WAY (Nested Update)
```elm
-- This fails because you cannot nest the | syntax
{ model | archive = { model.archive | query = "chaos" } }
```

### ✅ THE RIGHT WAY (Intermediate Bindings)
```elm
let
    base = AppState.init
    next = { base | status = "Updating..." }
in
next
```

### ✅ THE RIGHT WAY (Nested Updates)
```elm
let
    currentArchive = model.archive
    updatedArchive = { currentArchive | query = "chaos" }
in
{ model | archive = updatedArchive }
```
