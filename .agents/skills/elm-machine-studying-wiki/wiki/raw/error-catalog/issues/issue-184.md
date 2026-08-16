---
issue_number: 184
title: "Missing function parameter leaves confusing error"
state: CLOSED
author: "kormie"
created_at: "2016-11-30T16:45:09Z"
url: "https://github.com/elm/error-message-catalog/issues/184"
labels: ['types']
---

# Issue #184: Missing function parameter leaves confusing error

**State:** `CLOSED` | **Author:** @kormie | **Source:** [https://github.com/elm/error-message-catalog/issues/184](https://github.com/elm/error-message-catalog/issues/184)

## Description

Error message:
```
Unable to generalize a type variable. It is not unranked.
```

The causing code is as follows:
```elm
jobCompleteText : a -> (a -> Bool) -> Html Msg 
jobCompleteText job =
    let 
        completed =
            jobComplete job 

        style_ : List ( String, String )
        style_ =
            case completed of
                True ->
                    []  
                        |> (::) ( "color", "green" )

                False ->
                    []  
                        |> (::) ( "visiblity", "none" )

        text_ : String
        text_ =
            case completed of
                True ->
                    "Done"

                False ->
                    ""  
    in  
        div []
            [ Html.span [ style style_ ] [ text text_ ] ]
```

The error goes away when a second function parameter is added
