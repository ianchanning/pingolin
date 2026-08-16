---
issue_number: 329
title: "Be more specific about port type signature issue"
state: OPEN
author: "Janiczek"
created_at: "2020-01-22T15:34:11Z"
url: "https://github.com/elm/error-message-catalog/issues/329"
labels: []
---

# Issue #329: Be more specific about port type signature issue

**State:** `OPEN` | **Author:** @Janiczek | **Source:** [https://github.com/elm/error-message-catalog/issues/329](https://github.com/elm/error-message-catalog/issues/329)

## Description

Code:
```elm
port createAudience : (Maybe String -> Maybe String -> msg) -> Sub msg
```
Error is below. The problem with this code is that it takes two arguments instead of one. But the error says nothing about that. Or, one can deduce from "The only thing you can customize here is the `Int` type" that multiple arguments aren't allowed, but it would be better if it was more specific and explicit about the format.
```
-- BAD PORT -------------- client/audience-builder/AudienceBuilder/Audiences.elm

There is something off about this `createAudience` port declaration.

43| port createAudience : (Maybe String -> Maybe String -> msg) -> Sub msg
         ^^^^^^^^^^^^^^
To receive messages from JavaScript, you need to define a port like this:

    port createAudience : (Int -> msg) -> Sub msg

Now every time JS sends an `Int` to this port, it is converted to a `msg`. And
if you subscribe, those `msg` values will be piped into your `update` function.
The only thing you can customize here is the `Int` type.

Hint: Read <https://elm-lang.org/0.19.1/ports> for more advice. For example, do
not end up with one port per JS function!
```
