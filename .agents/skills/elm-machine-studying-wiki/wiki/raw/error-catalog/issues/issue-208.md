---
issue_number: 208
title: "Expected argument = actual argument when inserting non-comparable tuples into Set"
state: CLOSED
author: "drathier"
created_at: "2017-03-16T20:17:25Z"
url: "https://github.com/elm/error-message-catalog/issues/208"
labels: ['types']
---

# Issue #208: Expected argument = actual argument when inserting non-comparable tuples into Set

**State:** `CLOSED` | **Author:** @drathier | **Source:** [https://github.com/elm/error-message-catalog/issues/208](https://github.com/elm/error-message-catalog/issues/208)

## Description

First mention of `List ( Int, { data : Int } )` should read `List comparable`

```
-- TYPE MISMATCH ------------------------------------------------- .\.\Main.elm
The right side of (<|) is causing a type mismatch.
(<|) is expecting the right side to be a:

List ( Int, { data : Int } )

But the right side is:

List ( Int, { data : Int } )

Hint: Only ints, floats, chars, strings, lists, and tuples are comparable.

Hint: With operators like (<|) I always check the left side first. If it seems
fine, I assume it is correct and check the right side. So the problem may be in
how the left and right arguments interact.
```
for this code
```
f : List Int -> Set ( Int, { data : Int } )
f keys =
    Set.fromList <| List.map (\key -> ( key, { data = key } )) keys
```
