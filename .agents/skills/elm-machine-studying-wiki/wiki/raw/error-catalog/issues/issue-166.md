---
issue_number: 166
title: "Multiple parameters to port"
state: OPEN
author: "MeinAccount"
created_at: "2016-09-25T07:50:13Z"
url: "https://github.com/elm/error-message-catalog/issues/166"
labels: ['types']
---

# Issue #166: Multiple parameters to port

**State:** `OPEN` | **Author:** @MeinAccount | **Source:** [https://github.com/elm/error-message-catalog/issues/166](https://github.com/elm/error-message-catalog/issues/166)

## Description

A port with multiple parameters produces a weird error message. Either multiple parameters should be allowed or the compiler should state the contrary.

``` elm
port module Test exposing (..)

port test : Bool -> Int -> Cmd msg
```

The code above produces this very helpful error message:

``` elm
Port `test` has an invalid type.

3| port test : Bool -> Int -> Cmd msg
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
You are saying it should be:

    Bool -> Int -> Platform.Cmd.Cmd msg

But you need to use the particular format described here:
<http://guide.elm-lang.org/effect_managers/>
```

