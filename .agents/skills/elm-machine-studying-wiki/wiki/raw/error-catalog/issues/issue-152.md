---
issue_number: 152
title: "potentially confusing error for `List List Int`"
state: CLOSED
author: "pdamoc"
created_at: "2016-08-07T08:10:41Z"
url: "https://github.com/elm/error-message-catalog/issues/152"
labels: []
---

# Issue #152: potentially confusing error for `List List Int`

**State:** `CLOSED` | **Author:** @pdamoc | **Source:** [https://github.com/elm/error-message-catalog/issues/152](https://github.com/elm/error-message-catalog/issues/152)

## Description

This SSCCE: 

``` elm
import Html exposing (..)

type alias ListOfLists = List List Int

listOfLists : ListOfLists
listOfLists = [[1]]

main =
   text <| toString listOfLists
```

gives this error:

``` console
The type annotation for `listOfLists` does not match its definition.

6| listOfLists : ListOfLists
                 ^^^^^^^^^^^
The type annotation is saying:

    List List Int

But I am inferring that the definition has this type:

    List (List number)
```

is `List List Int` even valid?
If it is, maybe the error could explain what it means when contrasted with the  `List (List a)` 

