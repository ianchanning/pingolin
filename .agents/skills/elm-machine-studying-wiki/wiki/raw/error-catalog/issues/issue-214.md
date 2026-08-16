---
issue_number: 214
title: "Record mismatch could give more specification error"
state: OPEN
author: "nbardy"
created_at: "2017-04-12T03:33:27Z"
url: "https://github.com/elm/error-message-catalog/issues/214"
labels: ['types', 'x-record']
---

# Issue #214: Record mismatch could give more specification error

**State:** `OPEN` | **Author:** @nbardy | **Source:** [https://github.com/elm/error-message-catalog/issues/214](https://github.com/elm/error-message-catalog/issues/214)

## Description

```
==================================== ERRORS ====================================

-- TYPE MISMATCH -------------- /home/nicholas/Dropbox/act/namesake/src/Main.elm

The argument to function `style` is causing a mismatch.

176|                Text.style
177|>                { default
178|>                    | height = Just 72
179|>                    , bold = 12
180|>                    , color = (Color.rgb 255 255 255)
181|>                }

Function `style` is expecting the argument to be:

    Text.Style

But it is:

    { italic : Bool
    , line : Maybe Text.Line
    , typeface : List String
    , bold : number
    , color : Color
    , height : Maybe Float
    }

Hint: Problem in the `bold` field. I always figure out field types in
alphabetical order. If a field seems fine, I assume it is "correct" in
subsequent checks. So the problem may actually be a weird interaction with
previous fields.
```

This could say the Type of the field expected. This would save the extra time spent looking up what the Text.Style .bool type is. For example: 
```
Hint: Problem in the `bool` field. bool expected Type `Bool` but it is `number`.
