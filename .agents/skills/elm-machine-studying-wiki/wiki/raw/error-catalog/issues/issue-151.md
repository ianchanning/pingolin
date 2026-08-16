---
issue_number: 151
title: "`Json.Value` mentioned, but only `Json.(En/De)code.Value` really exist"
state: OPEN
author: "jvoigtlaender"
created_at: "2016-08-05T15:10:35Z"
url: "https://github.com/elm/error-message-catalog/issues/151"
labels: []
---

# Issue #151: `Json.Value` mentioned, but only `Json.(En/De)code.Value` really exist

**State:** `OPEN` | **Author:** @jvoigtlaender | **Source:** [https://github.com/elm/error-message-catalog/issues/151](https://github.com/elm/error-message-catalog/issues/151)

## Description

This program:

``` elm
import Html
import Html.App

main = Html.App.programWithFlags { init = init, view = view, update = update, subscriptions = subscriptions}

init f = (f 0, Cmd.none)

view _ = Html.div [] []

update _ _ = (0, Cmd.none)

subscriptions _ = Sub.none
```

leads to an error ending like this:

```
...

The types of values that can flow through in and out of Elm include:
     Ints, Floats, Bools, Strings, Maybes, Lists, Arrays, Tuples, Json.Values,
     and concrete records.
```

This mentions `Json.Value` as if that were a thing. But actually the `core` package has no `Json.Value`. It has `Json.Encode.Value` and `Json.Decode.Value`.

The place in the compiler repo where this message is coming from is this:
- https://github.com/elm-lang/elm-compiler/blob/505bafcb6a73d7ba26ef5ab84e67b0ef7ff92a58/src/Reporting/Error/Type.hs#L131

Also, there is another similar instance, in an error message for another situation, here:
- https://github.com/elm-lang/elm-compiler/blob/49eed34f81095dbe24cdfb9ac4bbbdd5af39c78f/src/Reporting/Error/Canonicalize.hs#L241

