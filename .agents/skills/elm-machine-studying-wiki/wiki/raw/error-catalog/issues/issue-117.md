---
issue_number: 117
title: "type inference gives overconfident error message about what type a function should be"
state: OPEN
author: "avh4"
created_at: "2016-05-14T01:10:11Z"
url: "https://github.com/elm/error-message-catalog/issues/117"
labels: ['types']
---

# Issue #117: type inference gives overconfident error message about what type a function should be

**State:** `OPEN` | **Author:** @avh4 | **Source:** [https://github.com/elm/error-message-catalog/issues/117](https://github.com/elm/error-message-catalog/issues/117)

## Description

In this example, 

``` elm
bar : String -> Int -> Float -> Result x ()
bar x y z =
    Ok ()

foo =
    Ok ()
        |> flip Result.andThen (bar "")
```

the error message is

```
-- TYPE MISMATCH ---------------------------------------------------------------

The 2nd argument to function `flip` is causing a mismatch.

9|            flip Result.andThen (bar "")
                                   ^^^^^^
Function `flip` is expecting the 2nd argument to be:

    Int -> Result a b

But it is:

    Int -> Float -> Result a ()

Hint: I always figure out the type of arguments from left to right. If an
argument is acceptable when I check it, I assume it is "correct" in subsequent
checks. So the problem may actually be in how previous arguments interact with
the 2nd.
```

This is confusing because it says `flip` expects the 2nd arg to be `Int -> Result a b`, but the `Int` part of that is coming from the actual type and is not actually expected.

It would be better to say `flip` expects the 2nd arg to be `a -> Result b c`

It would be ideal to say `flip` expects the 2nd arg to be `() -> Result a b`, since that is what is actually required given the context that `flip` is in.

