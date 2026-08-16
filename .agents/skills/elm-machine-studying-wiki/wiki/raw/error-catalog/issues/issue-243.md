---
issue_number: 243
title: "Minor improvement to case type errors"
state: OPEN
author: "boxed"
created_at: "2017-10-20T19:17:50Z"
url: "https://github.com/elm/error-message-catalog/issues/243"
labels: ['types']
---

# Issue #243: Minor improvement to case type errors

**State:** `OPEN` | **Author:** @boxed | **Source:** [https://github.com/elm/error-message-catalog/issues/243](https://github.com/elm/error-message-catalog/issues/243)

## Description

Whe compiling this:

```elm
foo x = 
    case x of
        "a" -> "asd"
        "b" -> 2
        "c" -> 3
        "d" -> 4
```

The error is:

```
-- TYPE MISMATCH ------------------------------------------------------ test.elm

The 1st and 2nd branches of this `case` produce different types of values.

 7|     case x of
 8|         "a" -> "asd"
 9|>        "b" -> 2
10|         "c" -> 3
11|         "d" -> 4

The 1st branch has this type:

    String

But the 2nd is:

    number

Hint: All branches in a `case` must have the same type. So no matter which one
we take, we always get back the same type of value.
```

The compiler should point to the likely culprit as line 8, not line 9. The rule for this would be to check the most common types produced in a case. I bet that in 99% of cases if the compiler just checks 3 cases instead of 2 it could accurately figure out which of the cases was in error.

This is obviously a trivial example, but in more complex code I find that I trigger this type of error by accidentally supplying too few parameters to a function and if I had changed some of the other lines in the case..of it's not directly obvious where the problem is.
