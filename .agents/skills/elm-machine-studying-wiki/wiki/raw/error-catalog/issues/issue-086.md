---
issue_number: 86
title: "\"Cannot find variable\" -> \"Cannot find value\""
state: OPEN
author: "mgold"
created_at: "2016-02-21T22:28:40Z"
url: "https://github.com/elm/error-message-catalog/issues/86"
labels: ['naming']
---

# Issue #86: "Cannot find variable" -> "Cannot find value"

**State:** `OPEN` | **Author:** @mgold | **Source:** [https://github.com/elm/error-message-catalog/issues/86](https://github.com/elm/error-message-catalog/issues/86)

## Description

If you reference a value that hasn't been define, the compiler says "Cannot find variable 'nonexistant'". But Elm doesn't have variables, so it would be better if it said "Cannot find value" (or whatever noun you want to use for not-types).

Relevant code is [here](https://github.com/elm-lang/elm-compiler/blob/3d438128acfaaabb3de1b19f4b009d84fce82446/src/Reporting/Error/Canonicalize.hs#L135-L136).

