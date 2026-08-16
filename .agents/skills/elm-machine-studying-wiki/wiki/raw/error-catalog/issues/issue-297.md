---
issue_number: 297
title: "Non-Optimal error message for GLSL on extrenous space"
state: OPEN
author: "uwaces"
created_at: "2019-07-20T13:16:56Z"
url: "https://github.com/elm/error-message-catalog/issues/297"
labels: ['parser']
---

# Issue #297: Non-Optimal error message for GLSL on extrenous space

**State:** `OPEN` | **Author:** @uwaces | **Source:** [https://github.com/elm/error-message-catalog/issues/297](https://github.com/elm/error-message-catalog/issues/297)

## Description

Using `cube` example online at `https://elm-lang.org/examples/cube` you get a less than optimal error message when adding a space before or after the `glsl` string.
## SSCCE

```elm
[glsl |
```
or 
```elm
[ glsl|
```


```
-- UNEXPECTED SYMBOL ------------------------------------------------------ /try

I was not expecting this vertical bar:

163|   [glsl |

             ^
Vertical bars should only appear in custom type declarations. Maybe you want ||
instead?
```

- **Elm:** 0.19.(1?)
- **Browser:** n/a
- **Operating System:** n/a


## Additional Details
This is on the live example on the website. Based on the console log when you hit the compile button I think that it is Elm 0.19.1 (not sure might be just Elm 0.19?).
