---
issue_number: 287
title: "Dict.fromList has confusing error message when given List Bool as key"
state: CLOSED
author: "Janiczek"
created_at: "2018-12-12T08:44:20Z"
url: "https://github.com/elm/error-message-catalog/issues/287"
labels: ['types']
---

# Issue #287: Dict.fromList has confusing error message when given List Bool as key

**State:** `CLOSED` | **Author:** @Janiczek | **Source:** [https://github.com/elm/error-message-catalog/issues/287](https://github.com/elm/error-message-catalog/issues/287)

## Description

https://ellie-app.com/48nbR8SGTZ8a1

```elm
module Main exposing (main)

import Dict exposing (Dict)
import Html

list : List (List Bool, Bool)
list =
    []

main =
    list
    |> Dict.fromList
    |> Debug.toString
    |> Html.text
```
:arrow_down:
``` 
Type Mismatch
Line 12, Column 8
This function cannot handle the argument sent through the (|>) pipe:

11|     list
12|     |> Dict.fromList
           ^^^^^^^^^^^^^
The argument is:

    List ( List Bool, Bool )

But (|>) is piping it a function that expects:

    List ( List Bool, v )
```
When I change the `List Bool` to something else (eg. `String`), the error goes away. This makes me think it doesn't like `List Bool` as a key type for the `Dict` - possibly something about `comparable`?
The error message is confusing and seems unrelated though.
