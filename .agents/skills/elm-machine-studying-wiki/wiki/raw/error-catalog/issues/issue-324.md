---
issue_number: 324
title: "Generic error message when type alias is missing 'alias'"
state: OPEN
author: "ianmackenzie"
created_at: "2019-11-25T23:17:04Z"
url: "https://github.com/elm/error-message-catalog/issues/324"
labels: []
---

# Issue #324: Generic error message when type alias is missing 'alias'

**State:** `OPEN` | **Author:** @ianmackenzie | **Source:** [https://github.com/elm/error-message-catalog/issues/324](https://github.com/elm/error-message-catalog/issues/324)

## Description

For example, something like

```elm
type MaybeInt =
   Maybe.Maybe Int
```

leads to a pretty generic error message

```
-- UNEXPECTED SYMBOL ------------------------------------------ ErrorMessage.elm

I ran into an unexpected symbol:

5|     = Maybe.Maybe Int
              ^
I was not expecting to see a . here. Try deleting it? Maybe I can give a better
hint from there?
```

This seems like it might be a bit of a regression in 0.19.1, since when I tried on Ellie I instead got

```
Line 22, Column 10
Something went wrong while parsing a union type.

21| type MaybeInt =
22|     Maybe.Maybe Int
             ^
I was expecting:

  - a type, like Int or (List String)
  - a vertical bar (|) followed by more union type constructors
  - more of that union type. Maybe you forgot some code? Or you need more
    indentation?
```

which is significantly better (at least it highlights that Elm is parsing the declaration as a custom type instead of a type alias).

