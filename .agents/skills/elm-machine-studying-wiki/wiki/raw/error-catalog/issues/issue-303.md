---
issue_number: 303
title: "Get constructor argument error when bigger problem is duplicate constructor cases"
state: OPEN
author: "app/"
created_at: "2019-10-07T15:03:24Z"
url: "https://github.com/elm/error-message-catalog/issues/303"
labels: []
---

# Issue #303: Get constructor argument error when bigger problem is duplicate constructor cases

**State:** `OPEN` | **Author:** @app/ | **Source:** [https://github.com/elm/error-message-catalog/issues/303](https://github.com/elm/error-message-catalog/issues/303)

## Description

```elm
type Msg
    = A String
    | B

update msg model =
    case msg of
        B str -> ...
        B -> ...
```
With the above code, I got this error:
```
-- TOO MANY ARGS ------------------------------------------------------ Main.elm

The `B` constructor needs 0 arguments, but I see 1 instead:

         B str ->
         ^^^^^
Which is the extra one? Maybe some parentheses are missing?
```
The bigger problem is that I've got two B cases in the case expression.
