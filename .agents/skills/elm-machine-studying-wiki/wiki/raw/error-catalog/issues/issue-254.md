---
issue_number: 254
title: "Deconstructing tuple from record inside record."
state: OPEN
author: "robert-wallis"
created_at: "2018-03-04T07:17:30Z"
url: "https://github.com/elm/error-message-catalog/issues/254"
labels: ['types']
---

# Issue #254: Deconstructing tuple from record inside record.

**State:** `OPEN` | **Author:** @robert-wallis | **Source:** [https://github.com/elm/error-message-catalog/issues/254](https://github.com/elm/error-message-catalog/issues/254)

## Description

```elm
type alias Model =
    { record : Record }


type alias Record =
    { x : Int
    , y : Int
    }


f : Model -> Int
f model =
    let
        ( x, y ) =
            model.record
    in
    x
```
https://ellie-app.com/gxDXjtJY6a1/0

## Actual Error Message

When a record is nested in another record.  And a tuple is deconstructed from the inner record.
The following misleading error message is produced.

```
model does not have a field named record.

The type of model is:

    Main.Model

Which does not contain a field named record.

Hint: Problem in the record field. I always figure out field types in alphabetical order. If a field seems fine, I assume it is "correct" in subsequent checks. So the problem may actually be a weird interaction with previous fields.
```

It is misleading because the `Model` _does_ contain a field named `Record`, however `Record` is not a tuple.

## Expected Error Message

```
record is being used in an unexpected way.

Based on its definition, record has this type:

    Main.Model.Record

But you are trying to use it as a tuple:

    ( x, y )

```

This seems related to #250 except the actual error produced is different.
