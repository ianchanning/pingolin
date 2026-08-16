---
issue_number: 370
title: "I cannot find a `return` variable better error message"
state: OPEN
author: "aminnairi"
created_at: "2022-08-18T17:24:54Z"
url: "https://github.com/elm/error-message-catalog/issues/370"
labels: []
---

# Issue #370: I cannot find a `return` variable better error message

**State:** `OPEN` | **Author:** @aminnairi | **Source:** [https://github.com/elm/error-message-catalog/issues/370](https://github.com/elm/error-message-catalog/issues/370)

## Description

**Quick Summary:** 

New Elm developers comming from JavaScript and other languages that have a `return` keyword may be confused when the `return` keyword is not needed in functions, or may keep the habit of using it in Elm programs.

It would be great to have a better error message for cases when the `return` keyword is used in front of an expression that may be returned by a function.

Actually, the error message looks like this.

```
I cannot find a `return` variable:

7|     return ( after - before ) / before
       ^^^^^^
These names seem close though:

    turns
    after
    atan
    before

Hint: Read <https://elm-lang.org/0.19.1/imports> to see how `import`
declarations work in Elm.
```

This can be improved, especially with a hint message when the `return` keyword is detected, something like

```
I cannot find a `return` variable:

7|     return ( after - before ) / before
       ^^^^^^
These names seem close though:

    turns
    after
    atan
    before

Hint: There is no return keyword in Elm, this is because functions always have
a return value and the last expression is what the function sends the the
caller, so it is not necessary to use in your function. This makes the code
terse and more readable and you wont forget to return a value in your
functions! Read more here <https://some.link/to/doc>
```


## SSCCE

```elm
module Main exposing (main)

import Html


getEvolutionRate before after =
    return ( after - before ) / before


main =
    Html.text ( String.fromFloat ( getEvolutionRate 38000 45000 ) )
```

- **Elm:** 0.19.1
- **Browser:** Google Chrome
- **Operating System:** Arch Linux


## Additional Details

The error message is not what I want in the end but is an inspiration I got in the moment.
