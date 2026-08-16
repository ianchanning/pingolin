---
issue_number: 130
title: "Weird error about about infinite instead of annotation/definition one"
state: CLOSED
author: "gyzerok"
created_at: "2016-06-23T19:42:01Z"
url: "https://github.com/elm/error-message-catalog/issues/130"
labels: ['types', 'patterns']
---

# Issue #130: Weird error about about infinite instead of annotation/definition one

**State:** `CLOSED` | **Author:** @gyzerok | **Source:** [https://github.com/elm/error-message-catalog/issues/130](https://github.com/elm/error-message-catalog/issues/130)

## Description

For the following code I expect compiler to say that type annotation doesn't reflect definition rather then tricky error message about self-referenced type. Sorry that is the most minimal example I can come up with. Any tries to remove something results in correct error.

``` elm
pack : List a -> List (List a)
pack list =
    let
        takeWhile p xs =
            case xs of
                [] ->
                    []

                y :: ys ->
                    if p y then
                        y :: takeWhile p ys
                    else
                        []

        dropWhile p xs =
            case xs of
                [] ->
                    []

                y :: ys ->
                    if p y then
                        dropWhile p ys
                    else
                        y :: ys
    in
        case list of
            [] ->
                []

            x :: xs ->
                (x :: takeWhile ((==) x) xs) ++ pack (dropWhile ((==) x) xs)
```

Rough example of expected error:

```
Type annotation saying
    List a -> List (List a )
but I infer
    List -> List a
```

