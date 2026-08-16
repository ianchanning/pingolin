---
issue_number: 368
title: "Error message should be more informative when integer literal is being used as both integer and float"
state: OPEN
author: "coreygirard"
created_at: "2023-11-14T01:04:38Z"
url: "https://github.com/elm/error-message-catalog/issues/368"
labels: ['types']
---

# Issue #368: Error message should be more informative when integer literal is being used as both integer and float

**State:** `OPEN` | **Author:** @coreygirard | **Source:** [https://github.com/elm/error-message-catalog/issues/368](https://github.com/elm/error-message-catalog/issues/368)

## Description

**Quick Summary:** The error message when an integer literal is being used as both integer and float doesn't point out the root cause.


## SSCCE

### Source
```elm
bug : ( Float, Int )
bug =
    1
        |> (\x ->
                ( x * 1.5
                , modBy x 2
                )
           )
```


### Expected output

Error message explaining that the literal is being simultaneously used as both an `int` and a `float`.


### Received output

```
-- TYPE MISMATCH -------------------------------------------------- src/Main.elm

The 1st argument to `modBy` is not what I expect:

119|                 , modBy x 2
                             ^
This `x` value is a:

    Float

But `modBy` needs the 1st argument to be:

    Int

Note: Read <https://elm-lang.org/0.19.1/implicit-casts> to learn why Elm does
not implicitly convert Ints to Floats. Use toFloat and round to do explicit
conversions.
```

- **Elm:** 0.19.1
- **Browser:** N/A
- **Operating System:** MacOS 12.6


## Additional Details

- Behavior does not require tuple; the following more verbose version triggers the same behavior:

```elm
bug : Float
bug =
    1
        |> (\x ->
                x
                    * 1.5
                    + modBy x 2
           )
```
