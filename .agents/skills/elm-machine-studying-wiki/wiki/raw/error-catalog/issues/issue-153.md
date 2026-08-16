---
issue_number: 153
title: "\"Weird self-referential type\" when types just mismatch"
state: OPEN
author: "bendiksolheim"
created_at: "2016-08-07T21:10:35Z"
url: "https://github.com/elm/error-message-catalog/issues/153"
labels: ['types']
---

# Issue #153: "Weird self-referential type" when types just mismatch

**State:** `OPEN` | **Author:** @bendiksolheim | **Source:** [https://github.com/elm/error-message-catalog/issues/153](https://github.com/elm/error-message-catalog/issues/153)

## Description

Good evening

I had an idea of making a function for getting the value at a specific index of a `List`, and fallback to `head` of the list if the index was out of bounds. Ended up trying this:

``` Elm
getAt : Int -> List a -> Maybe a
getAt idx ls = List.head <| List.drop idx ls

getWithFallback : Int -> List a -> a
getWithFallback idx ls =
    case getAt idx ls of
        Just a -> a
        Nothing -> List.head ls
```

This gave me a rather interesting error:

```
I am inferring a weird self-referential type for `ls`
6| getWithFallback idx ls =                       
                       ^^
Here is my best effort at writing down the type. You will see ? and ∞ for parts of the type that repeat something already printed out infinitely.

List ?
```

After thinking about it for a while, I found my error (`List.head ls` returning `Maybe a` instead of `a`), but I think the error message is quite confusing. A more helpful error message might be to tell me that my `Nothing` branch don't match my function defintion.

I believe this issue might be the same as https://github.com/elm-lang/error-message-catalog/issues/85 and https://github.com/elm-lang/error-message-catalog/issues/130 , but as I was not sure I made a new one just in case. I don't mind you closing it to keep things tidy if you are certain this issue is the same as those :)

