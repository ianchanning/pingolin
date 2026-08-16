---
issue_number: 79
title: "Word 'find' doubled when compile with import a non-existent module"
state: CLOSED
author: "fobos"
created_at: "2016-01-20T18:42:43Z"
url: "https://github.com/elm/error-message-catalog/issues/79"
labels: []
---

# Issue #79: Word 'find' doubled when compile with import a non-existent module

**State:** `CLOSED` | **Author:** @fobos | **Source:** [https://github.com/elm/error-message-catalog/issues/79](https://github.com/elm/error-message-catalog/issues/79)

## Description

I tried to compile a program with importing a non-existent module

``` elm
import Graphics.Element exposing (..)
import Graphics.SomeModule -- <-- non-existent module

main = show "hello"
```

As a result I have error message with doubled word `find`

```
I cannot find find module 'Grapics.SomeModule'.
```

