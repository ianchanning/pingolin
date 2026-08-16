---
issue_number: 347
title: "Record typo suggested fix could be better"
state: OPEN
author: "kreibaum"
created_at: "2021-05-05T18:20:36Z"
url: "https://github.com/elm/error-message-catalog/issues/347"
labels: []
---

# Issue #347: Record typo suggested fix could be better

**State:** `OPEN` | **Author:** @kreibaum | **Source:** [https://github.com/elm/error-message-catalog/issues/347](https://github.com/elm/error-message-catalog/issues/347)

## Description

When upgrading from elm-spa@5 to elm-spa@6 I had to switch many records of type `{ title : String, body : List (Element msg) }` to `{ title : String, element : Element msg }`. Elm correctly detects that `body` is not a field of the record and suggests I use `title` instead. But I am already defining `title` and not defining `element` so `element` would be a better suggestion. (And it seems feasible to detect this.)

It is also asking me if more type annotations can be added, but in this case Elm already pinpoints the problem pretty exactly.

```
-- TYPE MISMATCH --------------- /home/rolf/dev/pacosako/frontend/src/Pages/Tournament/Id_.elm


Something is off with the body of the `notFound` definition:

42|>    { title = "Tournament not found - pacoplay.com"
43|>    , body = [ Components.header1 "Tournament not found." ]
44|>    }

The body is a record of type:

    { body : List (Element msg), title : String }

But the type annotation on `notFound` says it should be:

    View msg

Hint: Seems like a record field typo. Maybe body should be title?

Hint: Can more type annotations be added? Type annotations always help me give
more specific messages, and I think they could help a lot in this case!
```

where 

```elm
type alias View msg =
    { title : String
    , element : Element msg
    }
```
