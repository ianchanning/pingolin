---
issue_number: 132
title: "Suggest names that are not imported at all"
state: CLOSED
author: "app/"
created_at: "2016-06-24T14:33:35Z"
url: "https://github.com/elm/error-message-catalog/issues/132"
labels: ['naming']
---

# Issue #132: Suggest names that are not imported at all

**State:** `CLOSED` | **Author:** @app/ | **Source:** [https://github.com/elm/error-message-catalog/issues/132](https://github.com/elm/error-message-catalog/issues/132)

## Description

**Edited by @evancz**

If someone wants `String.reverse` but has not imported `String`, they will get an error message like this:

![suggest string reverse given its argument model is a string](https://cloud.githubusercontent.com/assets/8081877/16340606/002d86b8-3a21-11e6-9677-630ac3f80c0d.png)

It would be nice if name suggestions could come from _all_ packages.

