---
issue_number: 169
title: "Missing \"lambda\" character"
state: CLOSED
author: "j-panasiuk"
created_at: "2016-10-01T19:17:14Z"
url: "https://github.com/elm/error-message-catalog/issues/169"
labels: ['parser']
---

# Issue #169: Missing "lambda" character

**State:** `CLOSED` | **Author:** @j-panasiuk | **Source:** [https://github.com/elm/error-message-catalog/issues/169](https://github.com/elm/error-message-catalog/issues/169)

## Description

I forgot to put **\** sign at the beginning of anonymous function

``` elm
import Html exposing (text)

double = a -> 2 * a

main = text (toString (double 5))
```

This results in

```
-- SYNTAX PROBLEM --------------------------------------------------------------

I ran into something unexpected when parsing your code!

4| double = a -> 2 * a
              ^
I am looking for one of the following things:

    end of input
    whitespace
```

This is exactly how I would use ES6 arrow function (except using fat arrow), so it tripped me up a couple of times

