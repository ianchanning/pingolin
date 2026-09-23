# Anonymous Record Updates (The Named Type Fallacy)

## The Sovereign Law
The compiler error `PROBLEM IN RECORD` with `expecting to see an equals sign next` is **never** caused by a record being anonymous. Record update syntax `{ record | field = value }` requires `record` to be a **simple variable identifier**. It strictly forbids field accessor paths (`model.user`) or qualified names. Anonymous records bound to local variables CAN be updated freely.

## The Trigger & Compiler Output
```text
-- PROBLEM IN RECORD -------------------------------------- src/SomeModule.elm

I am partway through parsing a record, but I got stuck here:

50|     { model | user = { model.user | name = newName } }
                                     ^
I just saw a field name, so I was expecting to see an equals sign next. So try
putting an = sign here?
```

## Developer Intent vs. Elm Semantics
- **Developer Fallacy:** The developer assumes Elm requires a `type alias` to permit record updates on nested records, diagnosing the failure as "anonymous records cannot be updated."
- **Elm Semantics:** Elm's parser only recognizes record update syntax when `{` is immediately followed by a single unqualified variable identifier and the pipe symbol `|` (`{ ident |`). When it encounters `{ model.user |`, it parses `model` as the field name of a brand new record definition literal `{ field = value }`. Seeing the dot `.`, it halts because field definitions require an equals sign `=`.

## The Pattern

### ❌ THE WRONG WAY (The Dotted Target)
```elm
-- Both named and anonymous records will fail if targeted via dot access:
update msg model =
    case msg of
        UpdateName newName ->
            ( { model | user = { model.user | name = newName } }, Cmd.none )
```

### ✅ THE RIGHT WAY (Bind to a Simple Variable)
```elm
-- Works identically for both named and anonymous records:
update msg model =
    case msg of
        UpdateName newName ->
            let
                currentUser =
                    model.user

                nextUser =
                    { currentUser | name = newName }
            in
            ( { model | user = nextUser }, Cmd.none )
```

See also: [[Elm-Record-Updates]] and [[Nested-Record-Updates]].
