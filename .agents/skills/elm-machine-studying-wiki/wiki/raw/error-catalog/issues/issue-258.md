---
issue_number: 258
title: "Typos, \"did you mean\" errors - filter the candidates using type information"
state: OPEN
author: "Janiczek"
created_at: "2018-06-06T11:12:43Z"
url: "https://github.com/elm/error-message-catalog/issues/258"
labels: []
---

# Issue #258: Typos, "did you mean" errors - filter the candidates using type information

**State:** `OPEN` | **Author:** @Janiczek | **Source:** [https://github.com/elm/error-message-catalog/issues/258](https://github.com/elm/error-message-catalog/issues/258)

## Description

So, we have this:
![naming](https://user-images.githubusercontent.com/149425/41034686-ac35e7a8-698a-11e8-9a7a-6b01d493bdb8.png)

It could be nice to only show candidates from the list whose types agree with the usage in source code.

For example, the unknown `List.nap` is being used as
```
({a | name : String} -> Html msg) -> List {a | name : String} -> List (Html msg)
```
which only agrees with `List.map` (`(a -> b) -> List a -> List b`).

(Variation: not only filter but also add candidates with compatible types from all currently visible definitions.)
