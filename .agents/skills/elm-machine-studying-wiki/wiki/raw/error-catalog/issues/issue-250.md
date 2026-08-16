---
issue_number: 250
title: "Misleading error message when deconstructing value taken out of a record"
state: OPEN
author: "joonazan"
created_at: "2018-01-17T10:17:50Z"
url: "https://github.com/elm/error-message-catalog/issues/250"
labels: ['types', 'x-record']
---

# Issue #250: Misleading error message when deconstructing value taken out of a record

**State:** `OPEN` | **Author:** @joonazan | **Source:** [https://github.com/elm/error-message-catalog/issues/250](https://github.com/elm/error-message-catalog/issues/250)

## Description

In Elm 0.18

```Elm
module Main exposing (..)


type alias Record a =
    { content : a
    }


draw : Record Int -> Int
draw y =
    let
        ( x, _ ) =
            y.content
    in
        x
```

produces 

```
`y` does not have a field named `content`.
The type of `y` is:
    Record Int
Which does not contain a field named `content`.
```

Instead, it should complain about `y.content` not being a tuple.
