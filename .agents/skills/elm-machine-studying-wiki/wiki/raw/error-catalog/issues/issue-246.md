---
issue_number: 246
title: "Pattern matching on literals only"
state: OPEN
author: "pdavidow"
created_at: "2017-11-27T00:59:30Z"
url: "https://github.com/elm/error-message-catalog/issues/246"
labels: ['patterns', 'x-erlang']
---

# Issue #246: Pattern matching on literals only

**State:** `OPEN` | **Author:** @pdavidow | **Source:** [https://github.com/elm/error-message-catalog/issues/246](https://github.com/elm/error-message-catalog/issues/246)

## Description

```
string_Random_TreeRandomInsertStyle = "Insert Random L/R"
string_Right_TreeRandomInsertStyle = "Insert Right"
string_Left_TreeRandomInsertStyle = "Insert Left"

treeRandomInsertStyleDecoder : String -> Decoder TreeRandomInsertStyle
treeRandomInsertStyleDecoder value =
    case value of
        string_Random_TreeRandomInsertStyle -> Decode.succeed TreeRandomInsertStyle.Random
        string_Right_TreeRandomInsertStyle -> Decode.succeed TreeRandomInsertStyle.Right
        string_Left_TreeRandomInsertStyle -> Decode.succeed TreeRandomInsertStyle.Left
        _ -> Decode.fail "Invalid TreeRandomInsertStyle
```
gives
```
The following pattern is redundant. Remove it.

90|         string_Right_TreeRandomInsertStyle -> Decode.succeed TreeRandomInsertStyle.Right
            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
Any value with this shape will be handled by a previous pattern.
```
but should rather state that Elm only matches against literals not values
