---
issue_number: 178
title: "Redundant pattern caused by matching on bound value"
state: OPEN
author: "mgold"
created_at: "2016-10-30T02:29:55Z"
url: "https://github.com/elm/error-message-catalog/issues/178"
labels: ['patterns', 'x-erlang']
---

# Issue #178: Redundant pattern caused by matching on bound value

**State:** `OPEN` | **Author:** @mgold | **Source:** [https://github.com/elm/error-message-catalog/issues/178](https://github.com/elm/error-message-catalog/issues/178)

## Description

It's a common misconception that pattern matching on a bound identifier will equate with that value, instead of locally binding that variable to the match. This could be resolved by disallowing shadowing, but failing that, adding something to the redundant pattern error would help (perhaps checking that there's a "catch everything" pattern). Proposed draft in bold:

> -- REDUNDANT PATTERN -----------------------------------------------------------
> 
> The following pattern is redundant. Remove it.
> 
> code
> 
> Any value with this shape will be handled by a previous pattern.
> 
> **Sometimes this happens when you try to pattern match on a value that's already defined. It doesn't work that way! Use _if_ and == instead.**

This is based on elm-lang/elm-compiler#1515 as well as many other cases; pretty sure I'm done this myself. It's worth noting that `_` does not necessarily need to be involved, and unless the mistaken case is last, it will always cause a redundant pattern match.

``` elm
f str =
  case str of
    foo -> "bar"
    "baz" -> "qux"
```

