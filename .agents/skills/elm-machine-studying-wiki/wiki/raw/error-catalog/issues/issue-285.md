---
issue_number: 285
title: "Type mismatch with identical types displayed"
state: CLOSED
author: "nagdon"
created_at: "2018-11-25T20:49:29Z"
url: "https://github.com/elm/error-message-catalog/issues/285"
labels: ['types']
---

# Issue #285: Type mismatch with identical types displayed

**State:** `CLOSED` | **Author:** @nagdon | **Source:** [https://github.com/elm/error-message-catalog/issues/285](https://github.com/elm/error-message-catalog/issues/285)

## Description

The following two REPL commands produce an incorrect and confusing error message:
```
> sorter x = (String.toInt x, x)
<function> : String -> ( Maybe Int, String )
> List.sortBy sorter [ "9", "10", "a", "1a" ]
-- TYPE MISMATCH ----------------------------------------------------------- elm

The 1st argument to `sortBy` is not what I expect:

6|   List.sortBy sorter [ "9", "10", "a", "1a" ]
                 ^^^^^^
This `sorter` value is a:

    String -> ( Maybe Int, String )

But `sortBy` needs the 1st argument to be:

    String -> ( Maybe Int, String )
```
The real cause of the error is that Maybe is not a comparable type. I would guess that this is not the same problem as the one reported in #278, but I didn't try to find the cause in the complier sources.
