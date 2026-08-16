---
issue_number: 244
title: "Incorrect message on missed `)` in tuple declaration"
state: CLOSED
author: "kipanshi"
created_at: "2017-10-28T21:41:15Z"
url: "https://github.com/elm/error-message-catalog/issues/244"
labels: ['parser']
---

# Issue #244: Incorrect message on missed `)` in tuple declaration

**State:** `CLOSED` | **Author:** @kipanshi | **Source:** [https://github.com/elm/error-message-catalog/issues/244](https://github.com/elm/error-message-catalog/issues/244)

## Description

Ubuntu 16.04 64bit, Core i7

1)
```
> tf a = (a, 1
-- SYNTAX PROBLEM -------------------------------------------- repl-temp-000.elm

The = operator is reserved for defining variables. Maybe you want == instead? Or
maybe you are defining a variable, but there is whitespace before it?

3|   tf a = (a, 1
          ^
Maybe <http://elm-lang.org/docs/syntax> can help you figure it out.
```
2)
```
> n = (1
-- SYNTAX PROBLEM -------------------------------------------- repl-temp-000.elm

The = operator is reserved for defining variables. Maybe you want == instead? Or
maybe you are defining a variable, but there is whitespace before it?

3|   n = (1
       ^
Maybe <http://elm-lang.org/docs/syntax> can help you figure it out.
```
