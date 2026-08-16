---
issue_number: 122
title: "Inferred type annotation doesn't detect a missing field"
state: CLOSED
author: "domenkozar"
created_at: "2016-05-27T10:45:27Z"
url: "https://github.com/elm/error-message-catalog/issues/122"
labels: ['types', 'no sscce']
---

# Issue #122: Inferred type annotation doesn't detect a missing field

**State:** `CLOSED` | **Author:** @domenkozar | **Source:** [https://github.com/elm/error-message-catalog/issues/122](https://github.com/elm/error-message-catalog/issues/122)

## Description

### Compiler error

``` elm
-- TYPE MISMATCH ------------------------------------------------ ./src/View.elm

The type annotation for `pageToView` does not match its definition.

52| pageToView : AppModel -> List (Html Msg)
                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^
The type annotation is saying:

    { ...
    , alert : ...
    , hydraConfig : ...
    , queueStats : ...
    , searchString : ...
    , user : ...
    }
    -> List (Html Msg)

But I am inferring that the definition has this type:

    { a | ..., page : ... } -> List (Html Msg)
```
### My interpretation

D'oh, compiler wants a more specific type like always so I'll do `{ a | page: Page }`.
### What compiler wanted to say

`page` is missing in `AppModel` record.

