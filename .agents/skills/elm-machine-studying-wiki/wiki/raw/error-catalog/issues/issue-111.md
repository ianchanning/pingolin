---
issue_number: 111
title: "type applications should start with a type atom"
state: CLOSED
author: "athanclark"
created_at: "2016-04-17T22:43:32Z"
url: "https://github.com/elm/error-message-catalog/issues/111"
labels: []
---

# Issue #111: type applications should start with a type atom

**State:** `CLOSED` | **Author:** @athanclark | **Source:** [https://github.com/elm/error-message-catalog/issues/111](https://github.com/elm/error-message-catalog/issues/111)

## Description

I'm not exactly sure what this means, but it happened during type inference for this function:

``` elm
chunks : Int -> List a -> List (List a)
chunks n xs =
  let go : (List a, List (List a)) -> a -> (List a, List (List a))
      go (acc, ys) x =
        let size = List.length acc
        in  if size < n
            then (List.append acc (x::[]), ys)
            else ([]                     , List.append ys (acc::[]))
      (zs, zss) = List.foldl go ([],[]) xs
  in  List.append zss (zs :: [])
```

I've tried a number of tricks to adjust the terms, but for some reason it's not getting the system to work properly. Any ideas what I'm doing wrong here?

