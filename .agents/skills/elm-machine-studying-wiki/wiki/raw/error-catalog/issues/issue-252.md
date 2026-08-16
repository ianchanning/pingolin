---
issue_number: 252
title: "Typo in module definition"
state: OPEN
author: "danfishgold"
created_at: "2018-01-20T10:24:34Z"
url: "https://github.com/elm/error-message-catalog/issues/252"
labels: ['parser']
---

# Issue #252: Typo in module definition

**State:** `OPEN` | **Author:** @danfishgold | **Source:** [https://github.com/elm/error-message-catalog/issues/252](https://github.com/elm/error-message-catalog/issues/252)

## Description

```elm
moudle A exposing (a)

a = 3
```

notice `moudle` instead of `module`

This yields the following error:

```
-- SYNTAX PROBLEM -------------------------------------------------------- A.elm

It looks like the keyword `exposing` is being used as a variable.

1| moudle A exposing (a)
                    ^
Rename it to something else.
```
