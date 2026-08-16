---
issue_number: 272
title: "Confusing error message when using Set.fromList in a context expecting Dict"
state: CLOSED
author: "nonpop"
created_at: "2018-09-17T11:53:12Z"
url: "https://github.com/elm/error-message-catalog/issues/272"
labels: ['types']
---

# Issue #272: Confusing error message when using Set.fromList in a context expecting Dict

**State:** `CLOSED` | **Author:** @nonpop | **Source:** [https://github.com/elm/error-message-catalog/issues/272](https://github.com/elm/error-message-catalog/issues/272)

## Description

Trying to compile this
```elm
module SSCCE exposing (sscce)

import Dict
import Set


sscce : Dict.Dict Int {}
sscce =
    Set.fromList [ ( 0, {} ) ]
```
causes the following error message:
```
-- TYPE MISMATCH ------------------------------------------------- src/SSCCE.elm

The 1st argument to `fromList` is not what I expect:

9|     Set.fromList [ ( 0, {} ) ]
                    ^^^^^^^^^^^^^
This argument is a list of type:

    List ( number, {} )

But `fromList` needs the 1st argument to be:

    List ( number, {} )
```
Replacing the `{}` type with `String` and giving a string argument gives the helpful error:

```
-- TYPE MISMATCH ------------------------------------------------- src/SSCCE.elm

Something is off with the body of the `sscce` definition:

9|     Set.fromList [ ( 0, "zero" ) ]
       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
This `fromList` call produces:

    Set.Set ( number, String )

But the type annotation on `sscce` says it should be:

    Dict.Dict Int String
```

**EDIT**: I just noticed that in the first case Elm actually produces two error messages, including the helpful one.
