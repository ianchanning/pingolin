---
issue_number: 107
title: "Importing module with no function"
state: OPEN
author: "jinjor"
created_at: "2016-04-06T10:15:06Z"
url: "https://github.com/elm/error-message-catalog/issues/107"
labels: ['parser']
---

# Issue #107: Importing module with no function

**State:** `OPEN` | **Author:** @jinjor | **Source:** [https://github.com/elm/error-message-catalog/issues/107](https://github.com/elm/error-message-catalog/issues/107)

## Description

I defined a module which have no function, and imported it from another module.

This cause an error.

```
-- SYNTAX PROBLEM --------------------------------------------- .\.\Position.elm

I ran into something unexpected when parsing your code!


I am looking for one of the following things:

    "{-|"
    a port declaration
    a type declaration
    a value definition
    an import
    an infix declaration
    whitespace

Detected errors in 1 module.
```

I think this case should turn into success.

