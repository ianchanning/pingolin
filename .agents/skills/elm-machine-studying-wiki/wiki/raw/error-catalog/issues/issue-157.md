---
issue_number: 157
title: "Two different types with same name"
state: CLOSED
author: "Janiczek"
created_at: "2016-08-19T08:39:48Z"
url: "https://github.com/elm/error-message-catalog/issues/157"
labels: ['types', 'no sscce']
---

# Issue #157: Two different types with same name

**State:** `CLOSED` | **Author:** @Janiczek | **Source:** [https://github.com/elm/error-message-catalog/issues/157](https://github.com/elm/error-message-catalog/issues/157)

## Description

The situation:
- `Random.Extra.together` wants `Random.Generator`
- the type given to it is `Random.Pcg.Generator`
- (maybe the fact that I aliased `Random.Pcg` as `Random` affects this too?)

``` elm
import Fuzz exposing (Fuzzer)
import Random.Pcg as Random
import Random.Extra as Random
import Shrink


type alias Op op =
    { generator : Random.Generator op }


opsFuzzer : List (Op op) -> Fuzzer (List op)
opsFuzzer ops =
    Fuzz.custom
        (Random.together (List.map .generator ops))
        (Shrink.list Shrink.noShrink)
```

Gives an error:

```
-- TYPE MISMATCH ----------------------------------------------------- src/A.elm

The type annotation for `opsFuzzer` does not match its definition.

21| opsFuzzer : List (Op op) -> Fuzzer (List op)
                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
The type annotation is saying:

    List { generator : Random.Generator b } -> Fuzzer (List b)

But I am inferring that the definition has this type:

    List { generator : Random.Generator a } -> Fuzzer (List b)

-- TYPE MISMATCH ----------------------------------------------------- src/A.elm

The 1st argument to function `custom` is causing a mismatch.

23|     Fuzz.custom
24|>        (Random.together (List.map .generator ops))
25|         (Shrink.list Shrink.noShrink)

Function `custom` is expecting the 1st argument to be:

    Random.Generator a

But it is:

    Random.Generator (List a)

Detected errors in 1 module.
```

This is not clear at all. Error along these lines would be helpful:

```
The 1st argument to function `together` is causing a mismatch.

24|>        (Random.together (List.map .generator ops))
                              ^^^^^^^^^^^^^^^^^^^^^^^
Function `together` is expecting the 1st argument to be:

  List (Random.Generator a)

But it is:

  List (Random.Pcg.Generator a)
```

