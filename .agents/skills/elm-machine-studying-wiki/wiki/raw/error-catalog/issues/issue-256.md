---
issue_number: 256
title: "importing an empty module"
state: OPEN
author: "tinybeachthor"
created_at: "2018-03-24T13:50:08Z"
url: "https://github.com/elm/error-message-catalog/issues/256"
labels: []
---

# Issue #256: importing an empty module

**State:** `OPEN` | **Author:** @tinybeachthor | **Source:** [https://github.com/elm/error-message-catalog/issues/256](https://github.com/elm/error-message-catalog/issues/256)

## Description

If an empty module is imported, the following error is displayed (from elm-make)

```elm
-- ./Model/Square.elm
module Square exposing (..)


```

```bash
-- SYNTAX PROBLEM ------------------------------------------- ./Model/Square.elm

I ran into something unexpected when parsing your code!


I am looking for one of the following things:

    "{-|"
    a definition or type annotation
    a port declaration
    a type declaration
    an import
    an infix declaration
    whitespace

Detected errors in 1 module.
```

This is a bit unexpected, especially when refactoring code into multiple files, this can lead to some confusion.

It probably should not be an error, a warning would be enough (importing an empty module). Or, at least a better explanation of the error (detected an empty module, add definitions to resolve).

I am proposing to change this to something like this:

```bash
-- SYNTAX WARNING ------------------------------------------- ./Model/Square.elm

I have found an empty module when parsing your code!


Check if you have remembered to save all files.
Check if you are including all the needed definitions.
Possibly remove the module, if not needed.

Detected warnings in 1 module.
```

elm --version 
0.18.0
