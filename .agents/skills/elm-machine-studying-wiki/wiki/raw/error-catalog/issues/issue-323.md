---
issue_number: 323
title: "Confusing error when main documentation comment comes after import"
state: OPEN
author: "TSFoster"
created_at: "2019-11-08T11:12:15Z"
url: "https://github.com/elm/error-message-catalog/issues/323"
labels: []
---

# Issue #323: Confusing error when main documentation comment comes after import

**State:** `OPEN` | **Author:** @TSFoster | **Source:** [https://github.com/elm/error-message-catalog/issues/323](https://github.com/elm/error-message-catalog/issues/323)

## Description

I had accidentally put my main documentation comment *after* my `import`s, so it looked kinda like:

```elm
module Drink exposing (water)

import Dict

{-| This module does very important things.

@docs water

-}

{-| `water` is a drink
-}
water : String
water = "water"

```

compiling it gives this error:


```
-- UNEXPECTED SYMBOL --------------------------------------- src/Drink.elm

I am getting stuck because this line starts with the { symbol:

11| {-| `water` is a drink
    ^
When a line has no spaces at the beginning, I expect it to be a declaration like
one of these:

    greet : String -> String
    greet name =
      "Hello " ++ name ++ "!"

    type User = Anonymous | LoggedIn String

If this is not supposed to be a declaration, try adding some spaces before it?
```

It took me a while to work out what the problem was, and I've written several packages before!

This is with elm 0.19.1. With elm 0.19.0, the error is much better (although could be improved):

```
-- STRAY COMMENT ------------------------------------------------- src/Drink.elm

This documentation comment is not followed by anything.

 6|>{-| This module does very important things.
 7|>
 8|>@docs water
 9|>
10|>-}

All documentation comments need to be right above the declaration they describe.
Maybe some code got deleted or commented out by accident? Or maybe this comment
is here by accident?
```
