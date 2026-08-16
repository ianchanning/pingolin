---
issue_number: 179
title: "Suggest parameters out of order"
state: OPEN
author: "chancyk"
created_at: "2016-11-01T23:25:58Z"
url: "https://github.com/elm/error-message-catalog/issues/179"
labels: []
---

# Issue #179: Suggest parameters out of order

**State:** `OPEN` | **Author:** @chancyk | **Source:** [https://github.com/elm/error-message-catalog/issues/179](https://github.com/elm/error-message-catalog/issues/179)

## Description

I thought it might be possible to check for out-of-order parameters by looking to see if changing the parameter permutation for all failed type checks creates a valid call.

In may case I was adding new parameters to my onClick:

```elm
-- previous
onFilterClick "State" .state True config.filterMsg
-- new
onFilterClick "State" .state True config.filterMsg model.mousePosition
```

But my function type declaration was expecting `config.filterMsg` and `model.mousePosition` to be swapped, with `mousePosition` before `filterMsg`:

```elm
onFilterClick 
  : String 
  -> ToStringColumn Person 
  -> Bool
  -> Position
  -> (FilterState -> msg)
  -> Html.Attribute msg
```

In my case, this actually propagates deep into one of my view functions and results in the following not-so-obvious type error, complaining that a parameter is not of the expected type:

```elm
534|                viewRowsByIndices config model rowData indices)
                                      ^^^^^^
Function `viewRowsByIndices` is expecting the 1st argument to be:

    { ...
    , filterMsg : FilterState -> Msg
    , rowHeight : Int
    , sortMsg : SortState -> Msg
    }

But it is:

    { ...
    , filterMsg : { x : Int, y : Int }
    , rowHeight : a
    , sortMsg : SortState -> b
    }
```
