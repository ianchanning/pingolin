# Nested Record Updates

## The Sovereign Law
Record update syntax `{ record | field = value }` requires `record` to be a **simple variable identifier**. Nested records cannot be updated in-place via dotted access (`model.child`) or within a nested update expression. To update nested records, decouple the target into an intermediate local variable binding.

## The Trigger & Compiler Output
```text
-- PROBLEM IN RECORD -------------------------------------- src/BookmarkForm.elm

I am partway through parsing a record, but I got stuck here:

50|     ( { model | newBookmark = { model.newBookmark | href = href } }, Cmd.none )
                                             ^
I just saw a field name, so I was expecting to see an equals sign next. So try
putting an = sign here?
```

## Developer Intent vs. Elm Semantics
- **Developer Intent:** The developer attempts to update a nested record field directly using dot notation (`{ model.child | field = val }`) or within a parent record update.
- **Elm Semantics:** The Elm grammar defines record updates as `{ <variable_identifier> | <field> = <expression>, ... }`. The base target must be an unqualified variable name. An accessor like `model.child` triggers the parser to expect a record literal definition (`{ field = value }`), flagging the dot as an error where an `=` was expected.

## The Pattern

### ❌ THE WRONG WAY
```elm
update msg model =
    case msg of
        SomeMsg val ->
            -- Fails: model.child is not a simple variable identifier
            ( { model | child = { model.child | field = val }, parentField = "updated" }, Cmd.none )
```

### ✅ THE RIGHT WAY
```elm
update msg model =
    case msg of
        SomeMsg val ->
            let
                currentChild =
                    model.child

                nextChild =
                    { currentChild | field = val }
            in
            ( { model | child = nextChild, parentField = "updated" }, Cmd.none )
```

See also: [[Elm-Record-Updates]] and [[Anonymous-Record-Updates]].
