---
issue_number: 145
title: "Top-level named function is called \"anonymous\""
state: OPEN
author: "jvoigtlaender"
created_at: "2016-07-29T04:49:08Z"
url: "https://github.com/elm/error-message-catalog/issues/145"
labels: ['types', 'naming']
---

# Issue #145: Top-level named function is called "anonymous"

**State:** `OPEN` | **Author:** @jvoigtlaender | **Source:** [https://github.com/elm/error-message-catalog/issues/145](https://github.com/elm/error-message-catalog/issues/145)

## Description

In Elm 0.17.1, this program:

``` elm
type X = X

f X = namedFunction 1

namedFunction = f
```

leads to this error report:

```
This anonymous function is being used in an unexpected way.

3| f X = namedFunction 1
         ^^^^^^^^^^^^^^^
The anonymous function has type:

    X -> a

But you are trying to use it as:

    number -> a

Detected errors in 1 module.
```

I would have expected it to say that the function `namedFunction` is being used in an unexpected way.

