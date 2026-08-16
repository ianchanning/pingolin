---
issue_number: 311
title: "Using \"type\" instead of \"type_\" "
state: OPEN
author: "lovasoa"
created_at: "2019-10-21T14:43:28Z"
url: "https://github.com/elm/error-message-catalog/issues/311"
labels: []
---

# Issue #311: Using "type" instead of "type_" 

**State:** `OPEN` | **Author:** @lovasoa | **Source:** [https://github.com/elm/error-message-catalog/issues/311](https://github.com/elm/error-message-catalog/issues/311)

## Description

In elm, `type` is a reserved keyword that can't be used as a function name, which results in a syntax that can be surprising and unintuitive  when trying to use the html [type](https://package.elm-lang.org/packages/elm/html/latest/Html-Attributes#type_) attribute.

### SSCCE

```elm
import Html exposing (..)
import Html.Attributes exposing (..)

text_input = input [type "text"] []
```

### Current error message

```text
-- UNFINISHED LIST --------------------------------------------- Jump To Problem

I am partway through parsing a list, but I got stuck here:

4| text_input = input [type "text"] []
                       ^
I was expecting to see a closing square bracket before this, so try adding a ]
and see if that helps?

Note: When I get stuck like this, it usually means that there is a missing
parenthesis or bracket somewhere earlier. It could also be a stray keyword or
operator.
```

The compiler is suggesting to add a closing bracket before `type`, which is clearly not the solution here. Instead, it should suggest to use `type_` instead of `type`.
