---
issue_number: 227
title: "Check for import errors before cyclic imports"
state: CLOSED
author: "drathier"
created_at: "2017-07-12T22:42:15Z"
url: "https://github.com/elm/error-message-catalog/issues/227"
labels: []
---

# Issue #227: Check for import errors before cyclic imports

**State:** `CLOSED` | **Author:** @drathier | **Source:** [https://github.com/elm/error-message-catalog/issues/227](https://github.com/elm/error-message-catalog/issues/227)

## Description

If A imports a nonexisting function from B, and B imports whatever from A, you get an error about a cyclic dependency. Since the only thing A imports from B is nowhere to be found, it's a false alarm, and the real problem is that A is importing something that is exported from B, but not defined in B.
