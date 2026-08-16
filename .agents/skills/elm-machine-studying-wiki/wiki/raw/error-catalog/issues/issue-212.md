---
issue_number: 212
title: "Different names but same types"
state: OPEN
author: "jinjor"
created_at: "2017-04-05T02:33:59Z"
url: "https://github.com/elm/error-message-catalog/issues/212"
labels: ['types', 'x-record']
---

# Issue #212: Different names but same types

**State:** `OPEN` | **Author:** @jinjor | **Source:** [https://github.com/elm/error-message-catalog/issues/212](https://github.com/elm/error-message-catalog/issues/212)

## Description

For example, `Time` is an alias for `Float`, but the compiler reports these as different types.

SSCCE:
```elm
import Time exposing (Time)


type alias Model =
  { a : Int
  , b : Time
  , c : Int
  }


update : Model -> Model
update model =
  if True then
     { model | b = 1.0 }
  else
     { model | a = "Hey" }
```
```
-- TYPE MISMATCH ---------------------------------------------------------------

The branches of this `if` produce different types of values.

17|>  if True then
18|>     { model | b = 1.0 }
19|>  else
20|>     { model | a = "Hey" }

The `then` branch has type:

    { ..., a : Int, b : Float }

But the `else` branch is:

    { ..., a : String, b : Time }

Hint: Problem in the `a` field. I always figure out field types in alphabetical
order. If a field seems fine, I assume it is "correct" in subsequent checks. So
the problem may actually be a weird interaction with previous fields.

Hint: These need to match so that no matter which branch we take, we always get
back the same type of value.
```
In this case, `a` is the cause of this error but the compiler also show `b` as a difference. `b` is colored on console. The image below is another example that happened in my project. `Float` <-> `Time` and `Msg` <-> `msg` is unnecessary information.

![2017-04-05 11 15 53](https://cloud.githubusercontent.com/assets/2568148/24687153/0f86552e-19f3-11e7-89b8-c1aedc831460.png)

----
Elm: 0.18

