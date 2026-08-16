---
issue_number: 74
title: "Missing return type of tuple gives misleading error message"
state: CLOSED
author: "maxhoffmann"
created_at: "2015-12-19T09:32:25Z"
url: "https://github.com/elm/error-message-catalog/issues/74"
labels: ['no sscce']
---

# Issue #74: Missing return type of tuple gives misleading error message

**State:** `CLOSED` | **Author:** @maxhoffmann | **Source:** [https://github.com/elm/error-message-catalog/issues/74](https://github.com/elm/error-message-catalog/issues/74)

## Description

Adding type annotations to `StartApp.start` methods I got this error for the `init` function:

```
Detected errors in 1 module.
-- TOO MANY ARGUMENTS ------------------------------------------------- Main.elm

Type Main.Model has too many arguments.

15│ init : Model Effects.Effects Action
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
Expecting 0, but got 2.
```

The thing that confuses me is that it says **Expecting 0** although it should expect a tuple:
`init : (Model, Effects.Effects Action)`

