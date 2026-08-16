---
issue_number: 77
title: "char is not defined"
state: CLOSED
author: "ggb"
created_at: "2016-01-05T13:54:37Z"
url: "https://github.com/elm/error-message-catalog/issues/77"
labels: []
---

# Issue #77: char is not defined

**State:** `CLOSED` | **Author:** @ggb | **Source:** [https://github.com/elm/error-message-catalog/issues/77](https://github.com/elm/error-message-catalog/issues/77)

## Description

Hello,

I came across a weird error message and I hope this is the right place to report it. I am not sure if it is 'just' a weird message or some kind of bug. 

The following code 

``` elm
import Graphics.Element exposing (show)
import String

detect char chars lim idx acc =
  if lim == 0
    then Nothing
    else 
      case chars of
        (x::xs) ->
          if char == x
            then
              Just (idx, List.reverse acc ++ xs)
            else
              detect char xs (lim - 1) (idx + 1) (x::xs)
        [] ->
          Nothing

main = show <| detect "h" ["e","h","l"] 1 0 []
```

leads to a runtime error which says:

```
char is not defined

Open the developer console for more details.
```

The console shows:

```
Uncaught ReferenceError: char is not defined
```

The Problem is solved by replacing 'char' with something else, for example 'c'. I use the name 'char' in other places without problems. The problem seems to be related to (JavaScript) reserved words: If I replace 'char' with 'byte' the same error message appears. 

