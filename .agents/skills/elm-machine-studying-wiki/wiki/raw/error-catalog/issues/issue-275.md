---
issue_number: 275
title: "Missing argument reported as problem with different function"
state: OPEN
author: "rtfeldman"
created_at: "2018-10-11T13:09:47Z"
url: "https://github.com/elm/error-message-catalog/issues/275"
labels: ['types']
---

# Issue #275: Missing argument reported as problem with different function

**State:** `OPEN` | **Author:** @rtfeldman | **Source:** [https://github.com/elm/error-message-catalog/issues/275](https://github.com/elm/error-message-catalog/issues/275)

## Description

I forgot to pass a `[]` as the second argument to an `input` element. Here's the error:

```
-- TYPE MISMATCH -------------------------------------------- src/Page/Login.elm

The 2nd argument to `fieldset` is not what I expect:

123|         [ fieldset [ class "form-group" ]
124|>            [ input
125|>                [ class "form-control form-control-lg"
126|>                , placeholder "Email"
127|>                , onInput EnteredEmail
128|>                , value form.email
129|>                ]
130|>            ]

This argument is a list of type:

    List (List (Html Msg) -> Html Msg)

But `fieldset` needs the 2nd argument to be:

    List (Html msg)

Hint: I always figure out the argument types from left to right. If an argument
is acceptable, I assume it is “correct” and move on. So the problem may actually
be in one of the previous arguments!
```

The root problem is that the `input` function is missing an argument, but `input` is not mentioned in the error message.

Personally I've seen variations of this error enough times to mentally translate "got A -> B but needed something more like B" into "check if you forgot an argument somewhere" so this was enough for me to spot the problem.

I wanted to report this because I often see beginners trip over errors like this when I'm teaching Intro to Elm workshops. For the most part they praise how helpful Elm's compiler errors are, but whenever they call me over to ask what a particular `TYPE MISMATCH` is trying to tell them, the most common answer is "you're missing an argument somewhere."

I have a suspicion that this could be one of those "beginners don't complain about it so much as conclude they're not smart enough and give up" errors.
