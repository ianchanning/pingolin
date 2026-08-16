---
issue_number: 366
title: "Hint on using types / type aliases"
state: OPEN
author: "EvansJahja"
created_at: "2025-10-06T16:28:54Z"
url: "https://github.com/elm/error-message-catalog/issues/366"
labels: []
---

# Issue #366: Hint on using types / type aliases

**State:** `OPEN` | **Author:** @EvansJahja | **Source:** [https://github.com/elm/error-message-catalog/issues/366](https://github.com/elm/error-message-catalog/issues/366)

## Description

Say we have the following import
`import Html`

and later

`view : Model -> Html Msg`

A beginner to elm like myself would be very confused seeing the following error message

```
I cannot find a `Html` type:

32| view : Model -> Html Msg
                    ^^^^
These names seem close though:

    Bool
    Cmd
    Char
    Int

Hint: Read <https://elm-lang.org/0.19.1/imports> to see how `import`
declarations work in Elm.
```

_What do you mean? Html is right there!_

---

What I would expect to happen:

A more helpful error message would say something like this:

```
I cannot find a `Html` type. I do see that you have already imported `Html` package, and that contains `Html` type. Perhaps you meant to say `import Html exposing Html`. You could also modify your usage:

32| view : Model -> #Html#.Html Msg
```



