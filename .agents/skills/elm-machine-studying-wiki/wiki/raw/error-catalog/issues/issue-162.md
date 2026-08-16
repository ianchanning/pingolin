---
issue_number: 162
title: "When the wrong function signature is infered, a note saying why it was infered would be useful"
state: CLOSED
author: "TheZoq2"
created_at: "2016-08-29T20:05:45Z"
url: "https://github.com/elm/error-message-catalog/issues/162"
labels: []
---

# Issue #162: When the wrong function signature is infered, a note saying why it was infered would be useful

**State:** `CLOSED` | **Author:** @TheZoq2 | **Source:** [https://github.com/elm/error-message-catalog/issues/162](https://github.com/elm/error-message-catalog/issues/162)

## Description

``` elm
someFunction : Int -> Bool
someFunction a =
    let 
        b = "test"
    in
        if a == b then True else False
```

This is the current error:

```
-- TYPE MISMATCH ------------------------------------------------------ Main.elm

The type annotation for `someFunction` does not match its definition.

7| someFunction : Int -> Bool
                  ^^^^^^^^^^^
The type annotation is saying:

    Int -> Bool

But I am inferring that the definition has this type:

    String -> Bool

Detected errors in 1 module.
```

But to me, the error isn't that the function signature is wrong, but that im trying to compare a `String` with an `Int` and it would be a lot easier to find the cause of the issue if it said some thing like

```
Note:
if a == b then True else False
   ^^^^^^ You are trying to compare a which is an Int to b which is a  String 
```

As a beginner to elm, this is by far the kind of issue that has taken the most time to track down. In longer functions, all info you get is that the function signature is off when the actual problem is that you are treating a variable as a type that it's not

