---
issue_number: 202
title: "Ambiguous variable due to `as`"
state: OPEN
author: "rtfeldman"
created_at: "2017-01-29T06:50:45Z"
url: "https://github.com/elm/error-message-catalog/issues/202"
labels: ['naming']
---

# Issue #202: Ambiguous variable due to `as`

**State:** `OPEN` | **Author:** @rtfeldman | **Source:** [https://github.com/elm/error-message-catalog/issues/202](https://github.com/elm/error-message-catalog/issues/202)

## Description

Ran into this one recently:

```
-- NAMING ERROR ------------------------------------ ./src/Nri/Outline/Utils.elm

This usage of variable `Css.class` is ambiguous.

71|         [ div [ Css.class [ Css.RowPanelTitle ] ] [ Html.text config.title ]
                    ^^^^^^^^^
Maybe you want one of the following?

    Nri.Outline.Css.class
    Css.class
```

Turned out it was ambiguous because we were doing this at the top:

```
import Css exposing (..)
import Nri.Outline.Css as Css
```

Silly us, but the message was confusing because it didn't mention the `as` 😄
