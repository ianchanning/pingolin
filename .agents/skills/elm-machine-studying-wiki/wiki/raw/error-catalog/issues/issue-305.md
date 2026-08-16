---
issue_number: 305
title: "No suggestion that value may be in another module in same package"
state: OPEN
author: "app/"
created_at: "2019-10-14T17:57:27Z"
url: "https://github.com/elm/error-message-catalog/issues/305"
labels: []
---

# Issue #305: No suggestion that value may be in another module in same package

**State:** `OPEN` | **Author:** @app/ | **Source:** [https://github.com/elm/error-message-catalog/issues/305](https://github.com/elm/error-message-catalog/issues/305)

## Description

```
-- BAD IMPORT ------------------------------------------------

The `Html.Extra` module does not expose `onEnter`:

import Html.Extra exposing (onEnter)
                            ^^^^^^^
These names seem close though:

    static
    viewIf
    nothing
    viewIfLazy
```

I got this error because I'd imported Html.Extra, not Html.Events.Extra. I imported Html.Extra because it was the word in my head after just installing "html-extra". I'd forgotten that the package is made up of several modules. It'd be helpful if the error message also said "Or perhaps onEnter is in one of the other modules, e.g. Html.Events.Extra?"
