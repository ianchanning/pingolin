---
issue_number: 241
title: "Error for wrong lambda syntax should talk about the missing backslash"
state: CLOSED
author: "Janiczek"
created_at: "2017-09-25T17:15:43Z"
url: "https://github.com/elm/error-message-catalog/issues/241"
labels: ['parser']
---

# Issue #241: Error for wrong lambda syntax should talk about the missing backslash

**State:** `CLOSED` | **Author:** @Janiczek | **Source:** [https://github.com/elm/error-message-catalog/issues/241](https://github.com/elm/error-message-catalog/issues/241)

## Description

If somebody forgets to put the backslash before the arguments of an anonymous function, they get an error about arrows. They should(?) get an error about the missing backslash.
```elm
module Main exposing (..)

id = a -> a
-- meant: id = \a -> a
```
```
-- SYNTAX PROBLEM ----------------------------------------------------- Main.elm

Arrows are reserved for cases and anonymous functions. Maybe you want > or >=
instead?

3| id = a -> a
          ^
Maybe <http://elm-lang.org/docs/syntax> can help you figure it out.

Detected errors in 1 module.                
```
