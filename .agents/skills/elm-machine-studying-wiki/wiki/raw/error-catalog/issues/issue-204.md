---
issue_number: 204
title: "constructor for union type more helpful error message"
state: CLOSED
author: "itsgreggreg"
created_at: "2017-02-21T21:26:47Z"
url: "https://github.com/elm/error-message-catalog/issues/204"
labels: ['parser']
---

# Issue #204: constructor for union type more helpful error message

**State:** `CLOSED` | **Author:** @itsgreggreg | **Source:** [https://github.com/elm/error-message-catalog/issues/204](https://github.com/elm/error-message-catalog/issues/204)

## Description

Currently if you specify a constructor for a union type that starts with a lower case letter a lá:
```elm
type Msg
    = nameInput
    | passwordInput
```
the compile error looks like:
```text
-- SYNTAX PROBLEM -------------------------------------------- ./src/Test.elm

I ran into something unexpected when parsing your code!

9|     = nameInput
         ^
I am looking for one of the following things:

    a constructor for a union type
    whitespace
```

This error message could be improved by adding something like:
```text
Union type constructors must start with a capital letter. Perhaps you meant NameInput.
```
