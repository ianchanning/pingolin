---
issue_number: 195
title: "somewhat unhelpful error message for missing `else` branch"
state: CLOSED
author: "brainrake"
created_at: "2016-12-28T23:23:52Z"
url: "https://github.com/elm/error-message-catalog/issues/195"
labels: ['parser']
---

# Issue #195: somewhat unhelpful error message for missing `else` branch

**State:** `CLOSED` | **Author:** @brainrake | **Source:** [https://github.com/elm/error-message-catalog/issues/195](https://github.com/elm/error-message-catalog/issues/195)

## Description

```
a = if True then 1

b = 2
```

Error message:
```
Detected errors in 1 module.


-- SYNTAX PROBLEM --------------------------------------------------------------

I need whitespace, but got stuck on what looks like a new declaration. You are
either missing some stuff in the declaration above or just need to add some
spaces here:

5| b = 2
   ^
I am looking for one of the following things:

    whitespace

```
