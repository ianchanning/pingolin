---
issue_number: 211
title: "Escaped characters produce weird compiler behavior"
state: CLOSED
author: "teodorlu"
created_at: "2017-04-01T13:49:38Z"
url: "https://github.com/elm/error-message-catalog/issues/211"
labels: ['parser']
---

# Issue #211: Escaped characters produce weird compiler behavior

**State:** `CLOSED` | **Author:** @teodorlu | **Source:** [https://github.com/elm/error-message-catalog/issues/211](https://github.com/elm/error-message-catalog/issues/211)

## Description

Running this in Try Elm

```elm
import Html exposing (text)

s = "\5166904"

main =
  text s
```

Gives this compiler message:
```
elm-make: Prelude.chr: bad argument: 5166904
elm-make: thread blocked indefinitely in an MVar operation
```
