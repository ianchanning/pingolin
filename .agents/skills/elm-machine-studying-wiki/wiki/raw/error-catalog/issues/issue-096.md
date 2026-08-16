---
issue_number: 96
title: "Messed up indentation on let, error could be better,"
state: CLOSED
author: "jessitron"
created_at: "2016-03-14T03:28:01Z"
url: "https://github.com/elm/error-message-catalog/issues/96"
labels: ['parser']
---

# Issue #96: Messed up indentation on let, error could be better,

**State:** `CLOSED` | **Author:** @jessitron | **Source:** [https://github.com/elm/error-message-catalog/issues/96](https://github.com/elm/error-message-catalog/issues/96)

## Description

This is probably not high priority, but could be more helpful, so here it is.

In this code, I have accidentally put the first declaration on the same line as the let.

```
module Bitty (..) where

something a =
  let s =
    f
      a
      "foo"
  in
    s

f a b = a + b
```

The error message says:

```
-- SYNTAX PROBLEM ---------------------------------------------------- Bitty.elm

I ran into something unexpected when parsing your code!

8│       "foo"
         ^
I am looking for one of the following things:

    an equals sign '='
    whitespace
```

Really, there is an indentation problem. It took me about 15 minutes to identify it, because the error did not help me.

