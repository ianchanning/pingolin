---
issue_number: 95
title: "Missing equals sign on function definition"
state: OPEN
author: "mgold"
created_at: "2016-03-07T17:45:56Z"
url: "https://github.com/elm/error-message-catalog/issues/95"
labels: ['parser']
---

# Issue #95: Missing equals sign on function definition

**State:** `OPEN` | **Author:** @mgold | **Source:** [https://github.com/elm/error-message-catalog/issues/95](https://github.com/elm/error-message-catalog/issues/95)

## Description

It would be nice if the following gave better errors. In many cases I tried the compiler said it was looking for an equals sign or some other helpful message, so these are the pathological cases.

A type annotation and defintion without the name repeated:

``` elm
import Html

p : Html.Html
  Html.p [] []
```
 yields
```

-- SYNTAX PROBLEM --------------------------------------------------------------

I ran into something unexpected when parsing your code!

5|   Html.p [] []
     ^
I am looking for one of the following things:

    end of input
    whitespace
```


A function missing an equals sign, exposed import within a list, says it's looking for a closing brace or whitespace:

``` elm
import Html exposing (p, text)

f : String -> Html.Html
f s
  p [] [text s]
```
yields:

```
-- SYNTAX PROBLEM --------------------------------------------------------------

I ran into something unexpected when parsing your code!

6|   p [] [text s]
                ^
I am looking for one of the following things:

    a closing brace ']'
    whitespace
```
A function missing an equals sign, qualified import within a list:

``` elm
import Html exposing (p)

f : String -> Html.Html
f s
  p [] [Html.text s]
```
yields
```
-- SYNTAX PROBLEM --------------------------------------------------------------

I ran into something unexpected when parsing your code!

6|   p [] [Html.text s]
                ^
I am looking for one of the following things:

    an upper case name
```


