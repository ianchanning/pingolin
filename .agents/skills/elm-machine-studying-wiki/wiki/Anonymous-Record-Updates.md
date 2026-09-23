# Anonymous Record Updates

## The Sovereign Law
Record update syntax (`{ record | field = value }`) is only available for named record types. If a record is defined anonymously (e.g., inside another record's type alias), it cannot be updated using the `|` operator. To enable updates, the record must be defined as a separate `type alias`.

## The Trigger & Compiler Output
**Error:** `PROBLEM IN RECORD`
**Diagnostic:** `I just saw a field name, so I was expecting to see an equals sign next.`
**Pointer:** Usually points to the `|` symbol or the record variable within a record update expression.

## Developer Intent vs. Elm Semantics
**Intent:** The developer attempts to update a field of a record that is nested within another record's definition, assuming the update syntax is universal for all record-like structures.
**Semantics:** Elm's parser distinguishes between record *definitions* and record *updates*. Record update syntax relies on the type's name to validate the fields being updated. Since anonymous records have no name, the compiler cannot verify the update and instead misinterprets the syntax as a record definition, leading to the "expecting an equals sign" error.

## The Pattern

### ❌ THE WRONG WAY
```elm
type alias Model =
    { user : { name : String, age : Int }
    , active : Bool
    }

update msg model =
    case msg of
        UpdateName newName ->
            -- This will fail because the user record is anonymous
            ( { model | user = { model.user | name = newName } }, Cmd.none )
```

### ✅ THE RIGHT WAY
```elm
type alias User =
    { name : String
    , age : Int
    }

type alias Model =
    { user : User
    , active : Bool
    }

update msg model =
    case msg =
        UpdateName newName ->
            -- This works because User is a named type
            ( { model | user = { model.user | name = newName } }, Cmd.none )
```
