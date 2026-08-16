---
issue_number: 336
title: "lambda expression = something is really tripping me up"
state: OPEN
author: "dotnetCarpenter"
created_at: "2020-04-28T03:29:54Z"
url: "https://github.com/elm/error-message-catalog/issues/336"
labels: []
---

# Issue #336: lambda expression = something is really tripping me up

**State:** `OPEN` | **Author:** @dotnetCarpenter | **Source:** [https://github.com/elm/error-message-catalog/issues/336](https://github.com/elm/error-message-catalog/issues/336)

## Description

Lambda or anonymous function for `String.filter` or `String.map` always give me this weird error message.

**Whatever I am running into is confusing me a lot! Normally I can give fairly
specific hints, but something is really tripping me up this time.**

```
Detected problems in 1 module.
-- SYNTAX PROBLEM ------------------------------------------------- src/Main.elm

I got stuck here:

97|   || String.filter \c -> Char.isUpper c pw |> String.isEmpty
                       ^
Whatever I am running into is confusing me a lot! Normally I can give fairly
specific hints, but something is really tripping me up this time.
```

The surrounding code is the following:
```elm
-- False if pw is weak, True if it's strong
weakPassword : String -> Bool
weakPassword pw =
  test pw Char.isLower
  -- || test pw Char.isUpper
  || String.filter \c -> Char.isUpper c pw |> String.isEmpty
  || test pw Char.isDigit

-- True if predicate yields an empty string
test : String -> (Char -> Bool) -> Bool
test s predicate =
  String.filter predicate s |> String.isEmpty
```

It looks to me that 
```elm
String.filter \c -> Char.isUpper c pw |> String.isEmpty
```
is the exact same as the body of the `test` function, if `predicate` is replaced with ` \c -> Char.isUpper c` . I have tried to add parentheses around the lambda but that just give me other error messages.
```elm
String.filter predicate s |> String.isEmpty
```
I'm new, so it might not always be an error but I have only ever got an error message when I try.

Anyway, the reason for this issue is: **Whatever I am running into is confusing me a lot! Normally I can give fairly specific hints, but something is really tripping me up this time.**
