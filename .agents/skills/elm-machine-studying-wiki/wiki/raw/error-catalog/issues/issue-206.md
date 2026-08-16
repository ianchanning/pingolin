---
issue_number: 206
title: "The compiler should warn when it hits invalid whitespace"
state: OPEN
author: "k15a"
created_at: "2017-03-01T12:05:27Z"
url: "https://github.com/elm/error-message-catalog/issues/206"
labels: ['parser']
---

# Issue #206: The compiler should warn when it hits invalid whitespace

**State:** `OPEN` | **Author:** @k15a | **Source:** [https://github.com/elm/error-message-catalog/issues/206](https://github.com/elm/error-message-catalog/issues/206)

## Description

Sometimes I accidentally hit `alt` when I press `space` which inserts a non breakable space. This breaks my code and the compiler error isn't really helpful.

```
I ran into something unexpected when parsing your code!

241|     { compatible | value : String
                     ^
I am looking for one of the following things:

    "'"
    more letters in this name
    the "has type" symbol ':'
    whitespace

Detected errors in 1 module.
```

The compiler could probably warn if he hits some invalid whitespace. That's probably not a problem with non breakable spaces alone.
