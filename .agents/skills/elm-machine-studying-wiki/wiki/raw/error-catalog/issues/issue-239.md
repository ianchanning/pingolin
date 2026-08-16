---
issue_number: 239
title: "Kebab case "
state: OPEN
author: "ShalokShalom"
created_at: "2017-09-08T04:33:20Z"
url: "https://github.com/elm/error-message-catalog/issues/239"
labels: ['parser', 'x-lisp']
---

# Issue #239: Kebab case 

**State:** `OPEN` | **Author:** @ShalokShalom | **Source:** [https://github.com/elm/error-message-catalog/issues/239](https://github.com/elm/error-message-catalog/issues/239)

## Description

```elm
is-negative n = n < 0
```

gives me: 

```
-- SYNTAX PROBLEM -------------------------------------------- repl-temp-000.elm

The = operator is reserved for defining variables. Maybe you want == instead?
Or maybe you are defining a variable, but there is whitespace before it?

3|   is-negative n = n < 0

```

![screenshot_20170908_063138](https://user-images.githubusercontent.com/6344099/30196251-75315950-945f-11e7-8ca1-0543f72f2015.png)

