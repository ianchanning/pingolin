---
issue_number: 185
title: "Type Checker Failure - Unable to generalize a type variable. It is not unranked."
state: CLOSED
author: "gilbertkennen"
created_at: "2016-12-02T22:37:40Z"
url: "https://github.com/elm/error-message-catalog/issues/185"
labels: ['types']
---

# Issue #185: Type Checker Failure - Unable to generalize a type variable. It is not unranked.

**State:** `CLOSED` | **Author:** @gilbertkennen | **Source:** [https://github.com/elm/error-message-catalog/issues/185](https://github.com/elm/error-message-catalog/issues/185)

## Description

I wasn't sure if this was best for the compiler issues or here. I figured that since it seems to only fail when it should fail that this was the better place to drop it.

The code is obviously incorrect. The interaction seems to be between the `a` in `foo` and the `List Float` in `bar`. If `List` is removed or `Float` or `Bool` is changed to a type variable or the `x` parameter omitted, then everything starts working again. I used different definite types to illustrate that they don't seem to matter, but it still fails in the same way even if they are more correct.

```Elm
foo : a -> Int
foo x =
    bar x


bar : List Float -> Bool
bar x =
    "baz"
```

```
elm-make: It looks like something went wrong with the type inference algorithm.
Unable to generalize a type variable. It is not unranked.
Please create a minimal example that triggers this problem and report it to
<https://github.com/elm-lang/elm-compiler/issues>
CallStack (from HasCallStack): error, called at src/Type/Solve.hs:255:3 in elm-compiler-0.18-6b7ElUUnEdQ18JS9q9eLxH:Type.Solve elm-make: thread blocked indefinitely in an MVar operation
```

