---
issue_number: 253
title: "Functions inside case statements"
state: CLOSED
author: "joshhornby"
created_at: "2018-01-23T16:06:47Z"
url: "https://github.com/elm/error-message-catalog/issues/253"
labels: []
---

# Issue #253: Functions inside case statements

**State:** `CLOSED` | **Author:** @joshhornby | **Source:** [https://github.com/elm/error-message-catalog/issues/253](https://github.com/elm/error-message-catalog/issues/253)

## Description

If you try and use a function inside a case statement the results are potentially unexpected 

```
decoder : Decode.Decoder String
decoder =
    Decode.at [ "example", "foo" ] Decode.string
        |> Decode.andThen
            (\string ->
                case string of
                    "test" ->
                        Decode.succeed "Working"

                    wrappedInAFunc ->
                        Decode.succeed "Working"

                    _ ->
                        Decode.fail <| "Invalid " ++ string
            )

wrappedInAFunc : String
wrappedInAFunc =
    "test"
```
Will throw:

> The following pattern is redundant. Remove it.Any value with this shape will be handled by a previous pattern.

This is because you can't call a function as you need to use  a 'pattern'. 

Maybe the error message can check if a function is being used, and if so warn the user about what they are doing as well as telling them the pattern is redundant?

Example Ellie: 
https://ellie-app.com/jBM3qQDFMa1/0
