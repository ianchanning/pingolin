---
issue_number: 109
title: "Nested Record Diffs"
state: CLOSED
author: "rtfeldman"
created_at: "2016-04-15T23:13:31Z"
url: "https://github.com/elm/error-message-catalog/issues/109"
labels: ['types', 'no sscce']
---

# Issue #109: Nested Record Diffs

**State:** `CLOSED` | **Author:** @rtfeldman | **Source:** [https://github.com/elm/error-message-catalog/issues/109](https://github.com/elm/error-message-catalog/issues/109)

## Description

Record diffs are great when the record is the thing wrong, but when you have `view : Int -> List Record -> Html` and something is wrong, that `Record` nested inside the `List` yields a troublesome result:

```
The type annotation for `foo` does not match its definition.
The type annotation is saying:
    Address a
    -> Bool
    -> Int
    -> List Thing
    -> Int
    -> Float
    -> List
           { things : Maybe (List ?)
           , something : Bool
           , nums : List Int
           , foo : Bool
           , bar : Maybe Int
           , disabled : Bool
           , optionalThing : Maybe Int
           , fungible : Bool
           , thingable : Bool
           , hidden : Bool
           , hover : Bool
           , isAwesome : Bool
           , splines : Int
           , id : Int
           , otherId : Int
           , stuff : Bool
           , yetAnotherId : Int
           , showThing : Bool
           , useThing : Bool
           }
    -> Html
But I am inferring that the definition has this type:
    Address a
    -> Bool
    -> Int
    -> List Thing
    -> Int
    -> ?
    -> List
           { things : Maybe (List ?)
           , something : Bool
           , nums : List Int
           , foo : Bool
           , bar : Maybe Int
           , disabled : Bool
           , optionalThing : Maybe Int
           , fungible : Bool
           , thingable : Bool
           , hidden : Bool
           , hover : Bool
           , isAwesome : Bool
           , splines : Int
           , id : Int
           , otherId : Int
           , stuff : Bool
           , yetAnotherId : Int
           , showThing : Bool
           , useThing : Bool
           }
    -> Bool
    -> Thing
    -> a
    -> Html
```

