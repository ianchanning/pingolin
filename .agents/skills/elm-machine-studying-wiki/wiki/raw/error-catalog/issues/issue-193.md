---
issue_number: 193
title: "Hint that exponentiation is ^ when wrongly using undefined **"
state: CLOSED
author: "drathier"
created_at: "2016-12-16T21:40:43Z"
url: "https://github.com/elm/error-message-catalog/issues/193"
labels: ['naming', 'x-python']
---

# Issue #193: Hint that exponentiation is ^ when wrongly using undefined **

**State:** `CLOSED` | **Author:** @drathier | **Source:** [https://github.com/elm/error-message-catalog/issues/193](https://github.com/elm/error-message-catalog/issues/193)

## Description

When trying to use `**` for exponentiation (`10**24`, as used in Python) the error message says that the variable `**` is not defined. In this case, it would be helpful if the compiler asked `Did you mean exponentiation? (10^24)`

If you did define `**` yourself, this hint wouldn't show, since it's no longer an undefined variable error. 
