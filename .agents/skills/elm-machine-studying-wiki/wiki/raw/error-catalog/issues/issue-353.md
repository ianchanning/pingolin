---
issue_number: 353
title: "better guidance for stack overflows"
state: OPEN
author: "dandrake"
created_at: "2021-12-27T16:46:54Z"
url: "https://github.com/elm/error-message-catalog/issues/353"
labels: []
---

# Issue #353: better guidance for stack overflows

**State:** `OPEN` | **Author:** @dandrake | **Source:** [https://github.com/elm/error-message-catalog/issues/353](https://github.com/elm/error-message-catalog/issues/353)

## Description

This is from <https://discourse.elm-lang.org/t/avoiding-rangeerror-maximum-call-stack-size-exceeded/8023>: I wrote a program with a recursive function that seemed like it ought to be tail-recursive, but it wasn't, and when running it, I would get `RangeError: Maximum call stack size exceeded` -- or, sometimes in the browser, simply nothing would happen (this was in Firefox, compiled with elm 0.19).

See the above discussion for details. As a newbie Elm user, it would be nice to get an error message that mentioned excessive recursion, tail recursion, and so on. I do understand the connection between the call stack and recursive functions, but being a little more explicit about the connection would have led me to a solution/workaround faster.


