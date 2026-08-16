---
issue_number: 306
title: "Importing two types with the same name doesn't error out on ambiguous names"
state: OPEN
author: "Janiczek"
created_at: "2019-10-16T20:22:52Z"
url: "https://github.com/elm/error-message-catalog/issues/306"
labels: []
---

# Issue #306: Importing two types with the same name doesn't error out on ambiguous names

**State:** `OPEN` | **Author:** @Janiczek | **Source:** [https://github.com/elm/error-message-catalog/issues/306](https://github.com/elm/error-message-catalog/issues/306)

## Description

env: 0.19.1-rc

This is conceptually similar to the "ambiguous name" error when importing values. Types don't have the same protection, which I think is an error.

Here is a SSCCE:
```elm
module Foo exposing (MyType(..))
type MyType = FooMyType
```
```elm
module Bar exposing (MyType(..))
type MyType = BarMyType
```
```elm
module Main exposing (main)

import Foo exposing (MyType(..))
import Bar exposing (MyType(..))
import Html

main = Html.text ""

useMyType : MyType -> Int
useMyType BarMyType = -- error: is Bar.MyType but should have been Foo.MyType
--useMyType FooMyType = -- succeeds
    123
```
**EXPECTED:**
Throws an "ambiguous name" error, saying I've imported both `Foo.MyType` and `Bar.MyType` and my function has an ambiguous type annotation.
**ACTUAL:**
If I use `BarMyType`, it errors out saying it should be `FooMyType`.
If I use `FooMyType`, the compilation succeeds (this is not right IMHO).

For reference, here's the AMBIGUOUS NAME error for values:
```
-- AMBIGUOUS NAME ------------------------------------------------- src/Main.elm

This usage of `x` is ambiguous:

10|     Html.text <| Debug.toString x
                                    ^
This name is exposed by 2 of your imports, so I am not sure which one to use:

    Bar.x
    Foo.x

I recommend using qualified names for imported values. I also recommend having
at most one `exposing (..)` per file to make name clashes like this less common
in the long run.

Note: Check out <https://elm-lang.org/0.19.1/imports> for more info on the
import syntax.
```
