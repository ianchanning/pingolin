---
issue_number: 78
title: "Hinting \"did you forget to pass arguments\" ?"
state: CLOSED
author: "stoft"
created_at: "2016-01-05T14:52:20Z"
url: "https://github.com/elm/error-message-catalog/issues/78"
labels: ['types', 'naming']
---

# Issue #78: Hinting "did you forget to pass arguments" ?

**State:** `CLOSED` | **Author:** @stoft | **Source:** [https://github.com/elm/error-message-catalog/issues/78](https://github.com/elm/error-message-catalog/issues/78)

## Description

As sent to elm-discuss:

As a new user the below error message stumped me for a few minutes before I realized I'd forgotten to pass in the arguments to my function. I really like the compiler and it's "humane" error messages but in this case an additional hint such as "did you forget to pass arguments" or similar may have helped. Unsure whether that's possible. One of the things that threw me off was the fact that it says Virtualdom.Node whereas the docs say Html.

Code to reproduce:

``` elm
import Html exposing (..)

view : Html
view =
  div [] [ foo ]

foo : String -> Html
foo content = text content

main = view
```

Error message:

```
TYPE MISMATCHjump to error
The 2nd argument to function `div` is causing a mismatch.

5|   div [] [ foo ]
Function `div` is expecting the 2nd argument to be:

    List VirtualDom.Node

But it is:

    List (String -> Html)

Hint: I always figure out the type of arguments from left to right. If an
argument is acceptable when I check it, I assume it is "correct" in subsequent
checks. So the problem may actually be in how previous arguments interact with
the 2nd.
```

