---
issue_number: 76
title: "Ports definition in function let block"
state: CLOSED
author: "s-marashi"
created_at: "2015-12-29T18:51:24Z"
url: "https://github.com/elm/error-message-catalog/issues/76"
labels: ['parser']
---

# Issue #76: Ports definition in function let block

**State:** `CLOSED` | **Author:** @s-marashi | **Source:** [https://github.com/elm/error-message-catalog/issues/76](https://github.com/elm/error-message-catalog/issues/76)

## Description

Compiler throws unclear error if we define a port in let block of a function.
Sample code:

``` elm
import Graphics.Element exposing (..)

main =
    let
        port test : Int
        port test = 2
    in
        show "Hello"
```

Throws:

```
I ran into something unexpected when parsing your code!

5|         port test : Int
I am looking for one of the following things:

    more letters in this name
    the definition of a value (x = ...)
```

Which is some how unclear.

