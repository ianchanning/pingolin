---
issue_number: 171
title: "Unhelpful error when missing a type constructor in an if branch"
state: CLOSED
author: "martinmodrak"
created_at: "2016-10-05T06:04:47Z"
url: "https://github.com/elm/error-message-catalog/issues/171"
labels: []
---

# Issue #171: Unhelpful error when missing a type constructor in an if branch

**State:** `CLOSED` | **Author:** @martinmodrak | **Source:** [https://github.com/elm/error-message-catalog/issues/171](https://github.com/elm/error-message-catalog/issues/171)

## Description

Compiling this snippet using elm-make

```
type LostCause = Activity | Nerves

type GameState = Running | Lost LostCause 

modifyState : GameState -> GameState
modifyState state =
                         --The error is below: "Lost" is missing an argument (should be "Lost Activity")
          if not (state == Lost) then Running
          else state
```

Gives this error:

```
-- TYPE MISMATCH ------------------------------------------------ 

The branches of this `if` produce different types of values.

8|>          if not (state == Lost) then Running
9|>          else state

The `then` branch has type:

    GameState

But the `else` branch is:

    LostCause -> GameState

Hint: These need to match so that no matter which branch we take, we always get
back the same type of value.
```

Which is confusing - 
a) the type of the `else` branch is obviously GameState 
b) the problem is not in the values of the if statement but actually in the condition `not (state == Lost)` which misses an argument and should read `not (state == Lost Activity)` - took me a while to figure this one out (I had a much larger if statement)...

