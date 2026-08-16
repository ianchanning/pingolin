---
issue_number: 92
title: "Keyword for pattern matching variable, error is confusing"
state: OPEN
author: "jessitron"
created_at: "2016-02-28T03:19:52Z"
url: "https://github.com/elm/error-message-catalog/issues/92"
labels: ['naming']
---

# Issue #92: Keyword for pattern matching variable, error is confusing

**State:** `OPEN` | **Author:** @jessitron | **Source:** [https://github.com/elm/error-message-catalog/issues/92](https://github.com/elm/error-message-catalog/issues/92)

## Description

I accidentally used a keyword "where" in deconstruction, like this minimal example:

```
module Sad where

type Pet = Pig String

someFunction : Pet -> String
someFunction pet =
  case pet of
    Pig where -> where
```

The error message is:

```
-- SYNTAX PROBLEM ------------------------------------------------------ Sad.elm

I ran into something unexpected when parsing your code!

8│     Pig where -> where
           ^
I am looking for one of the following things:

    an arrow '->'
    whitespace
```

This is pretty confusing, because an identifier is legitimate there, it doesn't say that.
What it wasn't expecting was a keyword.

