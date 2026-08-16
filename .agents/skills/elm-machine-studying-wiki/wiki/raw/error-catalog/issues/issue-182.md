---
issue_number: 182
title: "number doesn't seem to be comparable"
state: OPEN
author: "gampleman"
created_at: "2016-11-15T16:40:30Z"
url: "https://github.com/elm/error-message-catalog/issues/182"
labels: ['types']
---

# Issue #182: number doesn't seem to be comparable

**State:** `OPEN` | **Author:** @gampleman | **Source:** [https://github.com/elm/error-message-catalog/issues/182](https://github.com/elm/error-message-catalog/issues/182)

## Description

This code:

```elm
range : number -> number -> number -> Bool
range start stop step =
   start + step > stop
```

causes this error on 0.18:

```
Detected errors in 1 module.


-- TYPE MISMATCH ---------------------------------------------------------------

The left argument of (>) is causing a type mismatch.

4|    start + step > stop
      ^^^^^^^^^^^^
(>) is expecting the left argument to be a:

    comparable

But the left argument is:

    number

Hint: Only ints, floats, chars, strings, lists, and tuples are comparable.
```

I would expect any number to be automatically comparable, so this error seems confusing.
