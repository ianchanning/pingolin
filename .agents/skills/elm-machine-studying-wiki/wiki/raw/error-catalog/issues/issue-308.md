---
issue_number: 308
title: "Dict should require comparable and Dict.get error messages can be more specific"
state: OPEN
author: "showell"
created_at: "2019-10-18T20:58:43Z"
url: "https://github.com/elm/error-message-catalog/issues/308"
labels: []
---

# Issue #308: Dict should require comparable and Dict.get error messages can be more specific

**State:** `OPEN` | **Author:** @showell | **Source:** [https://github.com/elm/error-message-catalog/issues/308](https://github.com/elm/error-message-catalog/issues/308)

## Description

Here is the code that doesn't compile:

```
import Dict exposing (Dict)

type Fruit
    = Apple
    | Banana

type alias SimpleTuple =
    (Fruit, Int, Bool)

type alias SimpleDict =
    Dict SimpleTuple String

f : Fruit -> SimpleDict -> Maybe String
f fruit dct =
    Dict.get (fruit, 42, False) dct
```

Here is the error:

```
The 1st argument to `get` is not what I expect:

15|     Dict.get (fruit, 42, False) dct

                 ^^^^^^^^^^^^^^^^^^
This argument is a tuple of type:

    ( Fruit, number, Bool )

But `get` needs the 1st argument to be:

    comparable

Hint: I only know how to compare ints, floats, chars, strings, lists of
comparable values, and tuples of comparable values.
```

The deeper problem here is that this is legal in Elm:

```
type alias SimpleDict =
    Dict SimpleTuple String
```

If the above were illegal (i.e. `Dict` was `Dict comparable v` instead of `Dict k v`), I probably would have gotten a useful error as soon as I tried to compile the type.

The more immediate problem is that the error message is too vague.  It tells me ` ( Fruit, number, Bool )` is not a `comparable`.  It could more specifically tell me that `Fruit` is not a `comparable`.

Thanks!
