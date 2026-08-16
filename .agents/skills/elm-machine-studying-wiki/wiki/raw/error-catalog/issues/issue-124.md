---
issue_number: 124
title: "Unhelpful message from REPLs ran outside projects"
state: CLOSED
author: "szabba"
created_at: "2016-06-08T09:23:01Z"
url: "https://github.com/elm/error-message-catalog/issues/124"
labels: ['parser']
---

# Issue #124: Unhelpful message from REPLs ran outside projects

**State:** `CLOSED` | **Author:** @szabba | **Source:** [https://github.com/elm/error-message-catalog/issues/124](https://github.com/elm/error-message-catalog/issues/124)

## Description

If you run the REPL from a directory that's not part of an Elm project I get a rather unhelpful error message:

``` elm
 λ elm repl                       
---- elm repl 0.17.0 -----------------------------------------------------------
 :help for help, :exit to exit, more at <https://github.com/elm-lang/elm-repl>
--------------------------------------------------------------------------------
> 1 + 3
-- SYNTAX PROBLEM --------- elm-stuff/packages/elm-lang/core/3.0.0/src/Array.elm

I ran into something unexpected when parsing your code!

2|     ( Array
       ^
I am looking for one of the following things:

    something like `exposing (..)` which replaced `where` in 0.17
    whitespace


> 
```

I think this doesn't work because dependencies only get installed on a per-project basis. If I'm right, then this should probably be checked for somehow and the user should be informed to create a project before using the REPL.

