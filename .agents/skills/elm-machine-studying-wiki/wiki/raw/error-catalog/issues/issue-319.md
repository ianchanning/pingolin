---
issue_number: 319
title: "elm install breaks with multiple package names"
state: OPEN
author: "jjant"
created_at: "2019-08-04T03:31:58Z"
url: "https://github.com/elm/error-message-catalog/issues/319"
labels: []
---

# Issue #319: elm install breaks with multiple package names

**State:** `OPEN` | **Author:** @jjant | **Source:** [https://github.com/elm/error-message-catalog/issues/319](https://github.com/elm/error-message-catalog/issues/319)

## Description

**Quick Summary:**

Trying to install many packages with one command throws a runtime error on the console.


## SSCCE

```bash
elm install elm/json elm-community/webgl
```

- **Elm:**  0.19
- **Operating System:** OS X

## Additional Details
Exact error is
```elm: TODO show possible arg configurations
CallStack (from HasCallStack):
  error, called at ui/terminal/src/Terminal/Args/Error.hs:281:13 in main:Terminal.Args.Error
```
