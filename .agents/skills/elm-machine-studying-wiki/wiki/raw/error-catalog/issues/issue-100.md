---
issue_number: 100
title: "Doc comment above `module` results in unhelpful error message"
state: OPEN
author: "msiemens"
created_at: "2016-03-19T06:59:56Z"
url: "https://github.com/elm/error-message-catalog/issues/100"
labels: ['parser']
---

# Issue #100: Doc comment above `module` results in unhelpful error message

**State:** `OPEN` | **Author:** @msiemens | **Source:** [https://github.com/elm/error-message-catalog/issues/100](https://github.com/elm/error-message-catalog/issues/100)

## Description

Let's say, I have a file `Main.elm` like this:

``` elm
import Html exposing (div, text)
import SomeModule exposing (foo)

main = div [] [ text foo ]
```

and a file called `SomeModule.elm` like this:

``` elm
{-| SomeModule -}

module SomeModule where

foo = "bar"
```

Compiling this with elm-make fails with the following error message:

```
The module name is messed up for .\.\SomeModule.elm

    According to the file's name it should be SomeModule
    According to the source code it should be Main

Which is it?
```

The error message is completely unrelated to the actual problem (the doc comment placed above the `module` statement).

Versions used: elm-make 0.16 (Elm Platform 0.16.0)

