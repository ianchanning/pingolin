---
issue_number: 186
title: "Confusing description of missing cases when matching values"
state: OPEN
author: "avh4"
created_at: "2016-12-02T23:15:20Z"
url: "https://github.com/elm/error-message-catalog/issues/186"
labels: ['patterns']
---

# Issue #186: Confusing description of missing cases when matching values

**State:** `OPEN` | **Author:** @avh4 | **Source:** [https://github.com/elm/error-message-catalog/issues/186](https://github.com/elm/error-message-catalog/issues/186)

## Description

With this code:

```elm
f = 
  case ("", "") of
    ("a", "b") -> ()
    ("c", "d") -> ()
    (_, "b") -> ()
    ("a", _) -> ()
    ("e", "z") -> ()
```

The error is
```
-- MISSING PATTERNS ------------------------------------------------------------

This `case` does not have branches for all possibilities.

 5|>  case ("", "") of
 6|>    ("a", "b") -> ()
 7|>    ("c", "d") -> ()
 8|>    (_, "b") -> ()
 9|>    ("a", _) -> ()
10|>    ("e", "z") -> ()

You need to account for the following values:

    (<values besides "a", "c", and "e">, <values besides "b">)
    (<values besides "a" and "c">, <values besides "b" and "z">)
    (<values besides "a" and "e">, <values besides "b" and "d">)
    (<values besides "a">, <values besides "b", "d", and "z">)
    ...

Add branches to cover each of these patterns!

If you are seeing this error for the first time, check out these hints:
<https://github.com/elm-lang/elm-compiler/blob/0.18.0/hints/missing-patterns.md>
The recommendations about wildcard patterns and `Debug.crash` are important!
```

The list of missing values is confusing, and is entirely phrased as negatives, which makes it hard to figure out which cases need to be added.  A better message would list the missing values as:

```
You need to account for the following values:

    ( "c", <values besides "b" and "d"> )
    ( "e", <values besides "b" and "z"> )
    ( <values besides "a", "c", "e">, <values besides "b"> )
```
