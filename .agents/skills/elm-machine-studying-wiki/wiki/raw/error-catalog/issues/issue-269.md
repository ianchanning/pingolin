---
issue_number: 269
title: "Color coded compile msgs doesn't work when IDE does not support colored console"
state: CLOSED
author: "mordrax"
created_at: "2018-09-03T02:34:55Z"
url: "https://github.com/elm/error-message-catalog/issues/269"
labels: []
---

# Issue #269: Color coded compile msgs doesn't work when IDE does not support colored console

**State:** `CLOSED` | **Author:** @mordrax | **Source:** [https://github.com/elm/error-message-catalog/issues/269](https://github.com/elm/error-message-catalog/issues/269)

## Description

When getting the following type mismatch with Webstorm ( which does not highlight console outputs )

```
This function cannot handle the argument sent through the (|>) pipe:

59|             model
60|                 |> List.filter (\n -> n.privacyFlag /= Types.Api.Enums.FlagYes && n.priority /= Types.Api.Enums.FlagYes)
                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
The argument is:

    List Note

But (|>) is piping it a function that expects:

    List { fields : String
        , fields : Int
        , fields : Enums.MainRefType
        , fields : String
        , fields : String
        , fields : String
        , fields : String
        , fields : Enums.BitFlag
        , fields : Maybe Date
        , fields : Maybe Date
        , fields : String
        , fields : String
        , privacyFlag : Enums.Flag                  -- this one is yellow in the terminal but not in the editor
        , fields : String
        , fields : String
        , fields : Maybe DateTime
        , fields : Enums.Flag
        , fields : String
        , fields : DateTime
        , fields : String
        , fields : Maybe DateTime
        , fields : Float
    }
```

0.18 was better in pointing out the fields which the compiler had problems with using text. 0.19 only works if the console being used supports color.
