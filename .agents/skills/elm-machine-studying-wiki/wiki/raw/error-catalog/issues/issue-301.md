---
issue_number: 301
title: "Error message doesn't say that issue is due to conflict between same-named functions from different modules"
state: OPEN
author: "app/"
created_at: "2019-08-28T11:45:41Z"
url: "https://github.com/elm/error-message-catalog/issues/301"
labels: []
---

# Issue #301: Error message doesn't say that issue is due to conflict between same-named functions from different modules

**State:** `OPEN` | **Author:** @app/ | **Source:** [https://github.com/elm/error-message-catalog/issues/301](https://github.com/elm/error-message-catalog/issues/301)

## Description

```elm
import Element.Input exposing (button)
import Html exposing (button)

...

view model =
    button []
            { onPress = ...
            , label = ...
            }
```

```
-- TYPE MISMATCH -------------------------------------------------- src/Main.elm

The 2nd argument to `button` is not what I expect:

217|         , button []
218|>            { onPress = ...
219|>            , label = ...
220|>            }

This argument is a record of type:

    { label : Element.Element msg, onPress : Maybe Msg }

But `button` needs the 2nd argument to be:

    List (Html msg)

Hint: I always figure out the argument types from left to right. If an argument
is acceptable, I assume it is “correct” and move on. So the problem may actually
be in one of the previous arguments!
```

I think the error message should point out that button could be Html.button or Element.Input.button.
