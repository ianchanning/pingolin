---
issue_number: 226
title: "Expecting T but it is T"
state: OPEN
author: "drathier"
created_at: "2017-07-10T19:04:47Z"
url: "https://github.com/elm/error-message-catalog/issues/226"
labels: ['types']
---

# Issue #226: Expecting T but it is T

**State:** `OPEN` | **Author:** @drathier | **Source:** [https://github.com/elm/error-message-catalog/issues/226](https://github.com/elm/error-message-catalog/issues/226)

## Description

I was missing an `uncurry` and got this error message:

```
The 3rd argument to function foldl is causing a mismatch.
Function foldl is expecting the 3rd argument to be:

List ( number, Box )

But it is:

List ( number, Box )

Hint: Only ints, floats, chars, strings, lists, and tuples are comparable.

Hint: I always figure out the type of arguments from left to right. If an
argument is acceptable when I check it, I assume it is "correct" in subsequent
checks. So the problem may actually be in how previous arguments interact with
the 3rd.
```

from this code

```
module Main exposing (..)

type alias Box =
  { position : T }
  
type T = T

insertNodeData : comparable -> data -> List data -> List data
insertNodeData key data lst =
    data :: lst

ok = List.foldl (uncurry insertNodeData) [] [ ( 1, Box <| T ), ( 2, Box <| T ) ]
error = List.foldl insertNodeData [] [ ( 1, Box <| T ), ( 2, Box <| T ) ]
```
https://ellie-app.com/3J7KXRG8QZja1/0
