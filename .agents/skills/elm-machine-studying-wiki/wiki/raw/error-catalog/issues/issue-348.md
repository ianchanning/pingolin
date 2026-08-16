---
issue_number: 348
title: "Subtraction without whitespace gives non-intuitive error"
state: OPEN
author: "Strepto"
created_at: "2021-05-11T17:49:16Z"
url: "https://github.com/elm/error-message-catalog/issues/348"
labels: []
---

# Issue #348: Subtraction without whitespace gives non-intuitive error

**State:** `OPEN` | **Author:** @Strepto | **Source:** [https://github.com/elm/error-message-catalog/issues/348](https://github.com/elm/error-message-catalog/issues/348)

## Description

Subtraction is the only operator creating error messages when there is no whitespace in the example below. 

```elm
maths : Int -> Int
maths a = 
    let
        b = a+a
        c = a-a -- This line will not compile
        d = a//a
        e = a*a
        f = a^a
    in
        1
```
Will give this error message, confusing me for a few moments. 

![image](https://user-images.githubusercontent.com/3185998/117861507-cb8dc500-b291-11eb-953f-0cc77320e2e4.png)

Consider if this should be handled with a specific error message?



