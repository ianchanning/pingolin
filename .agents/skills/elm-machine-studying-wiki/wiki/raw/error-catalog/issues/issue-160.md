---
issue_number: 160
title: "Case error wrong way round"
state: CLOSED
author: "opsb"
created_at: "2016-08-22T09:34:44Z"
url: "https://github.com/elm/error-message-catalog/issues/160"
labels: ['types']
---

# Issue #160: Case error wrong way round

**State:** `CLOSED` | **Author:** @opsb | **Source:** [https://github.com/elm/error-message-catalog/issues/160](https://github.com/elm/error-message-catalog/issues/160)

## Description

To my reading the error shown below reads the wrong way around.
#### Example 1

``` haskell
x = 
  case {a = 1} of
    (a, b) -> 
      ""
    _ -> 
      ""
```
#### Actual error

```
-- TYPE MISMATCH ---------------------------------------------------------------

Tag `_Tuple2` is causing problems in this pattern match.

7|     (a, b) -> 
       ^^^^^^
This pattern matches things of type:

    { a : number }

But the values it will actually be trying to match are:

    ( a, b )
```
#### Expected error

```
-- TYPE MISMATCH ---------------------------------------------------------------

Tag `_Tuple2` is causing problems in this pattern match.

7|     (a, b) -> 
       ^^^^^^
This pattern matches things of type:

    (a, b) 

But the values it will actually be trying to match are:

    { a : number }
```
#### Example 2

``` haskell
y = 
  case {a = 1} of
    [a, b] -> 
      ""
    _ -> 
      "" 
```

yields a similar error, with the messages inverted (relative to my expectations at least).

