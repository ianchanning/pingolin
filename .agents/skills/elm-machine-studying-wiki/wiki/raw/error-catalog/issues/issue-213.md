---
issue_number: 213
title: "Detect wrong function call syntax"
state: OPEN
author: "norpan"
created_at: "2017-04-08T16:36:21Z"
url: "https://github.com/elm/error-message-catalog/issues/213"
labels: ['types']
---

# Issue #213: Detect wrong function call syntax

**State:** `OPEN` | **Author:** @norpan | **Source:** [https://github.com/elm/error-message-catalog/issues/213](https://github.com/elm/error-message-catalog/issues/213)

## Description

Somebody asked about this error. Perhaps it could be improved by detecting the following:
Type mismatch.
Mismatching type is a tuple where the first argument would match.
Suggest user may have used function(arg1,arg2) syntax instead of function arg1 arg2

```
334|                     Dict.insert(id, updatedCharacter, state.characters)
                                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
Function `insert` is expecting the argument to be:

    ( String
    , { char : Instance.Char
    , currentLocation : Hash
    , usedDicePool : Character.UsedDicePool
    }
    , Dict String Character.State
    )

But it is:

    ( String
    , { char : Instance.Char
    , currentLocation : Hash
    , usedDicePool : Character.UsedDicePool
    }
    , Dict String Character.State
    )

Hint: Only ints, floats, chars, strings, lists, and tuples are comparable.
```
