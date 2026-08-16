---
issue_number: 238
title: "Misleading error message when trying to use tuple type alias as constructor"
state: OPEN
author: "adius"
created_at: "2017-09-07T07:14:51Z"
url: "https://github.com/elm/error-message-catalog/issues/238"
labels: []
---

# Issue #238: Misleading error message when trying to use tuple type alias as constructor

**State:** `OPEN` | **Author:** @adius | **Source:** [https://github.com/elm/error-message-catalog/issues/238](https://github.com/elm/error-message-catalog/issues/238)

## Description

If one tries to use tuple aliases as constructor functions the error message is not helpful.

```elm
module Main exposing (..)

type alias PersonRecord =
    { name : String
    , age : Int
    }

recordTest = PersonRecord "John" 32


type alias PersonTuple = ( String, Int )

tupleTest = PersonTuple "John" 32
```

The error message is `Cannot find variable PersonTuple`

The thinking then might go: "I just defined PersonTuple two lines above. How can it not be found?"
And one might try all kind of strange things to define it differently, importing it and so on.

A live version of this code can be found here: https://ellie-app.com/4dYpWwpgyLTa1/0

