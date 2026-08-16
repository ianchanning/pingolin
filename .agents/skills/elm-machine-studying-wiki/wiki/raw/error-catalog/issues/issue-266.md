---
issue_number: 266
title: "Compiler hint for toString"
state: OPEN
author: "ckoster22"
created_at: "2018-08-26T02:58:31Z"
url: "https://github.com/elm/error-message-catalog/issues/266"
labels: ['naming']
---

# Issue #266: Compiler hint for toString

**State:** `OPEN` | **Author:** @ckoster22 | **Source:** [https://github.com/elm/error-message-catalog/issues/266](https://github.com/elm/error-message-catalog/issues/266)

## Description

The error message for trying to use `toString` to convert an `Int` to a `String` currently reads like this:

![image](https://user-images.githubusercontent.com/8353821/44624357-ad998f80-a8b1-11e8-9519-6219fe02aab2.png)

[SSCCE](https://ellie-app.com/39bxvXJbBBfa1)

This seems like it could be a common enough mistake to give a more helpful error message indicating `Basics.toString` is no longer available, and maybe they meant `Debug.toString`, `String.fromInt`, or `String.fromFloat`.
