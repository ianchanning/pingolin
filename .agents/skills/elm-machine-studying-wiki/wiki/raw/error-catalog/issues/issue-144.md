---
issue_number: 144
title: "REPL doesn't say that filename and module name might not be the same"
state: OPEN
author: "app/"
created_at: "2016-07-27T20:09:08Z"
url: "https://github.com/elm/error-message-catalog/issues/144"
labels: ['naming']
---

# Issue #144: REPL doesn't say that filename and module name might not be the same

**State:** `OPEN` | **Author:** @app/ | **Source:** [https://github.com/elm/error-message-catalog/issues/144](https://github.com/elm/error-message-catalog/issues/144)

## Description

In elm-repl, in a directory with zi.elm (which has `module Zip exposing (..)`):

```
> import Zip exposing (..)
I cannot find module 'Zip'.

Module 'Repl' is trying to import it.

Potential problems could be:
  * Misspelled the module name
  * Need to add a source directory or new dependency to elm-package.json
```

change zi.elm to zip.elm:

```
> import Zip exposing (..)
> 
```

(it works)

Another `Potential problem` should be that the `filename and module name don't match`.

