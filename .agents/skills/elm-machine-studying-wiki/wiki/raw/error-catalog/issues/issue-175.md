---
issue_number: 175
title: "`comparable` gets unified out of type error"
state: OPEN
author: "kkruups"
created_at: "2016-10-17T14:05:19Z"
url: "https://github.com/elm/error-message-catalog/issues/175"
labels: ['types']
---

# Issue #175: `comparable` gets unified out of type error

**State:** `OPEN` | **Author:** @kkruups | **Source:** [https://github.com/elm/error-message-catalog/issues/175](https://github.com/elm/error-message-catalog/issues/175)

## Description

**Heavily edited by @evancz, quoting @mgold in https://github.com/elm-lang/core/issues/733**

Here's an SSCCE of the real problem:

```
import Dict

x = Dict.insert ("C", Nothing) Dict.empty
```

This produces (0.17, 0.18)

```
-- TYPE MISMATCH ---------------------------------------------

The 1st argument to function `insert` is causing a mismatch.

4|   Dict.insert ("C", Nothing) Dict.empty
                 ^^^^^^^^^^^^^^
Function `insert` is expecting the 1st argument to be:

    ( String, Maybe a )

But it is:

    ( String, Maybe a )

Hint: Only ints, floats, chars, strings, lists, and tuples are comparable.
```

The "expected first argument" is shown to be the same as the "but it is", which is a pretty bad error message. The problem with this code is that `Nothing` is not comparable, and therefore the tuple is not an acceptable key. I'd guess the root cause has something to do with how `comparable` types are handled. The error is reasonable if you try `Dict.insert Nothing Dict.empty`.

