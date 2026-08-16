---
issue_number: 123
title: "Compiler hint suggests programWithFlags when maybe beginnerProgram would be more appropriate"
state: OPEN
author: "jvoigtlaender"
created_at: "2016-06-03T07:53:27Z"
url: "https://github.com/elm/error-message-catalog/issues/123"
labels: ['types']
---

# Issue #123: Compiler hint suggests programWithFlags when maybe beginnerProgram would be more appropriate

**State:** `OPEN` | **Author:** @jvoigtlaender | **Source:** [https://github.com/elm/error-message-catalog/issues/123](https://github.com/elm/error-message-catalog/issues/123)

## Description

If in a call to `Html.program` one omits the `subscriptions` field, the compiler suggests that one maybe wants `programWithFlags`. But actually, when learners do not write down `subscriptions`, it's more likely that they actually want `beginnerProgram`.

To reproduce, open the [clock example on elm-lang/try](http://elm-lang.org/examples/time), delete the line `subscriptions = subscriptions` from `main`, and get this error message:

```
Function `program` is expecting the argument to be: 

    { ..., subscriptions : ... } 

But it is: 

    { ... } 

Hint: Does your program have flags? Maybe you want `programWithFlags` instead.
```

I don't see how the absence of `subscriptions` suggests `programWithFlags`. After all, a program with flags would _also_ need a `subscriptions` field in `main`. (http://package.elm-lang.org/packages/elm-lang/html/1.0.0/Html-App#programWithFlags)

