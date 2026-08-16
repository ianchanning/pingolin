---
issue_number: 68
title: "Polymorphic record accessors: expected = actual"
state: CLOSED
author: "mgold"
created_at: "2015-12-06T21:17:19Z"
url: "https://github.com/elm/error-message-catalog/issues/68"
labels: []
---

# Issue #68: Polymorphic record accessors: expected = actual

**State:** `CLOSED` | **Author:** @mgold | **Source:** [https://github.com/elm/error-message-catalog/issues/68](https://github.com/elm/error-message-catalog/issues/68)

## Description

If I define record with polymorphic fields, and then make a list of its `.accessors`, I cannot use those accessors on fields of differing types. Though annoying, this isn't new. However, while previous versions reported a conflict between the two types, 0.16 reports that they are the same type. SSCCE:

``` elm
type alias Point a =
  {x : a, y : a}

ints =
  Point 1 2

strings =
  Point "foo" "bar"

fields : List (Point a -> a)
fields =
  [.x, .y]

pairs =
  List.map
    (\f -> (f strings, f ints))
    fields
```

The 0.16 error message is:

```
The argument to function `f` is causing a mismatch.

16|     (\f -> (f strings, f ints))
Function `f` is expecting the argument to be:

    Point String

But it is:

    Point String
```

I've filed this in the error message catalog since, without adding language features, we can do a better job with this error message and maybe even report that the feature is not available. If others think the SSCCE should be valid, I can escalate to an issue on the compiler.

By the way, if the second-to-last line of the SSCCE is replaced with `(\f -> (f ints, f ints))`, it compiles.

