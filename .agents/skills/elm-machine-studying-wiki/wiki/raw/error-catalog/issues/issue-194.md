---
issue_number: 194
title: "Missing parentheses in type union lead to ugly message"
state: OPEN
author: "j-panasiuk"
created_at: "2016-12-26T14:44:16Z"
url: "https://github.com/elm/error-message-catalog/issues/194"
labels: ['types']
---

# Issue #194: Missing parentheses in type union lead to ugly message

**State:** `OPEN` | **Author:** @j-panasiuk | **Source:** [https://github.com/elm/error-message-catalog/issues/194](https://github.com/elm/error-message-catalog/issues/194)

## Description

I ran into this error while trying to model `Selection` type as a container for any kind of thing (using Elm **0.18**, not the "new" parser). Here is simplified version:

**SSCCE**
```elm
import Html exposing (text)


type Selection a
    = One Maybe a


selection : Maybe (Selection Int)
selection =
    Just (One Nothing)


main =
    text (toString selection)
```

**Message**
```
-- TYPE MISMATCH ------------------------------------------------------ Main.elm

The definition of `selection` does not match its type annotation.

10| selection : Maybe (Selection Int)
11| selection =
12|>    Just (One Nothing)

The type annotation for `selection` says it is a:

    elm-make: Type applications without concrete names should not get here.
```

## Problem

Actually the problem here seems to be lack of parentheses in type definition:
```elm
type Selection a
    = One Maybe a
```
should be
```elm
type Selection a
    = One (Maybe a)
```
but the compiler doesn't complain about this.

(Also when type signature is removed form place of usage, error message gets much closer)
```
-- TYPE MISMATCH ------------------------------------------------------ Main.elm

The argument to function `One` is causing a mismatch.

11|           One Nothing)
                  ^^^^^^^
Function `One` is expecting the argument to be:

    Maybe

But it is:

    Maybe a
```
