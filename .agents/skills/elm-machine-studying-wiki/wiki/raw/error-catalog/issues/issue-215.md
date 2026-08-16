---
issue_number: 215
title: "\"Cannot find variable `X.T`. No module called X has been imported.\" when X has been imported but not exposing type correctly"
state: OPEN
author: "stoft"
created_at: "2017-04-23T13:25:43Z"
url: "https://github.com/elm/error-message-catalog/issues/215"
labels: ['naming']
---

# Issue #215: "Cannot find variable `X.T`. No module called X has been imported." when X has been imported but not exposing type correctly

**State:** `OPEN` | **Author:** @stoft | **Source:** [https://github.com/elm/error-message-catalog/issues/215](https://github.com/elm/error-message-catalog/issues/215)

## Description

I get the following error even though I have imported `SubTypes`:
```
Detected errors in 1 module.
-- NAMING ERROR ------------------------------------------------------- Main.elm

Cannot find variable `SubTypes.MyType`.

15|             SubType SubTypes.MyType
                        ^^^^^^^^^^^^^^^
No module called `SubTypes` has been imported. 
```
The actual error is that the SubTypes module is not exposing its type correctly:
`module SubTypes exposing (Type)` when it should be `module SubTypes exposing (Type(..))`.
A more correct error message would be that SubTypes does not expose `MyType`.

SSCCE:

```elm
module SubTypes exposing (Type)

type Type
    = MyType
```
```elm
module Main exposing (main)

import Html
import SubTypes

type SuperType
    = NoOp
    | SubType SubTypes.Type

main =
    let
        t =
            SubType SubTypes.MyType
    in
        Html.text "MyType found!"
```
