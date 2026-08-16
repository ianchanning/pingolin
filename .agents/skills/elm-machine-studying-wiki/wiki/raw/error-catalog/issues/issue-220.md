---
issue_number: 220
title: "Trying to create record key with double quotes"
state: CLOSED
author: "hsribei"
created_at: "2017-05-20T15:57:37Z"
url: "https://github.com/elm/error-message-catalog/issues/220"
labels: ['parser']
---

# Issue #220: Trying to create record key with double quotes

**State:** `CLOSED` | **Author:** @hsribei | **Source:** [https://github.com/elm/error-message-catalog/issues/220](https://github.com/elm/error-message-catalog/issues/220)

## Description

When following the "Core Language" section in the official guide, I thought to try if record keys could be any object. The error messages missed the point:

```
> bill = { "name" = "Gates", age = 57 }
-- SYNTAX PROBLEM -------------------------------------------- repl-temp-000.elm

The = operator is reserved for defining variables. Maybe you want == instead? Or
maybe you are defining a variable, but there is whitespace before it?

4|   bill = { "name" = "Gates", age = 57 }
          ^
Maybe <http://elm-lang.org/docs/syntax> can help you figure it out.


> bill = { name = "Gates", age = 57 }
{ name = "Gates", age = 57 } : { age : number, name : String }

```
The compiler hints could include "record key names don't accept quotes" or something to that effect.
