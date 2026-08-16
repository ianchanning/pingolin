---
issue_number: 292
title: "Did you forget to add [] around it?"
state: CLOSED
author: "mordrax"
created_at: "2019-03-22T01:13:06Z"
url: "https://github.com/elm/error-message-catalog/issues/292"
labels: ['types']
---

# Issue #292: Did you forget to add [] around it?

**State:** `CLOSED` | **Author:** @mordrax | **Source:** [https://github.com/elm/error-message-catalog/issues/292](https://github.com/elm/error-message-catalog/issues/292)

## Description

![image](https://user-images.githubusercontent.com/4709169/54794442-967e1d00-4c9b-11e9-9597-2dacc8cb0e0c.png)

The hint is ambiguous at best and misleading at worst suggesting that the highlighted `Field Date` needs to be a list.
It so happens that line 28, the `view` function is the one that needs to return a list.
