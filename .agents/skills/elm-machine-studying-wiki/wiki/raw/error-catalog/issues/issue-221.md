---
issue_number: 221
title: "Inconsistent slashes in paths"
state: OPEN
author: "drathier"
created_at: "2017-06-05T19:44:52Z"
url: "https://github.com/elm/error-message-catalog/issues/221"
labels: ['x-misc']
---

# Issue #221: Inconsistent slashes in paths

**State:** `OPEN` | **Author:** @drathier | **Source:** [https://github.com/elm/error-message-catalog/issues/221](https://github.com/elm/error-message-catalog/issues/221)

## Description

On Windows, Elm 0.18.0, I just got this path in an error message: 

``` -- TYPE MISMATCH ------------------------------------- .\../src\Things\Parser.elm``` 

`"../src"` is in my `elm-package.json`, so that part probably comes from there. I'd expect either `/` or `\`, but not both. This is from running elm-test, which is why there's a `../` in the source-directories.
