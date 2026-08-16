---
issue_number: 271
title: "Union types haven't been renamed to Custom types in error messages "
state: CLOSED
author: "rl-king"
created_at: "2018-09-13T21:07:16Z"
url: "https://github.com/elm/error-message-catalog/issues/271"
labels: ['presentation']
---

# Issue #271: Union types haven't been renamed to Custom types in error messages 

**State:** `CLOSED` | **Author:** @rl-king | **Source:** [https://github.com/elm/error-message-catalog/issues/271](https://github.com/elm/error-message-catalog/issues/271)

## Description

A quick grep gives the following files in which there are error messages that refer to `union types`.
```
compiler/src/Reporting/Error/Type.hs
compiler/src/Reporting/Error/Cononicalize.hs
compiler/src/Reporting/Error/Syntax.hs
compiler/src/Optimize/Port.hs
```

I could PR this but as they're still called `Union Types` internally, I'll submit this first, since there might be an idea/plan for this.
