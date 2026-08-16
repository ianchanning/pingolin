---
issue_number: 88
title: "Importing a type alias as a union type"
state: OPEN
author: "mgold"
created_at: "2016-02-22T23:58:23Z"
url: "https://github.com/elm/error-message-catalog/issues/88"
labels: ['naming']
---

# Issue #88: Importing a type alias as a union type

**State:** `OPEN` | **Author:** @mgold | **Source:** [https://github.com/elm/error-message-catalog/issues/88](https://github.com/elm/error-message-catalog/issues/88)

## Description

Given a module

``` elm
module Definitions (Model) where

type alias Model = Int
```

and another file

``` elm
import Definitions exposing (Model(..))

x = "dummy definition"
```

compiling the second file results in the following error:

```
-- NAMING ERROR --------------------------------------------------- Importer.elm

Module `Definitions` does not expose `Model`

1│ import Definitions exposing (Model(..))
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^


Detected errors in 1 module.  
```

This is confusing, Definitions clearly does expose (export, really) Model. The problem is that it's not a union type, and therefore the `(..)` is meaningless. A better message: `Module 'Definitions' exposes 'Model', which it defines as a type alias, but it's being imported here as a union type.`

Probably worth fixing together with #87.

