---
issue_number: 104
title: "Returning part of a type alias / forgetting a parameter"
state: CLOSED
author: "pinx"
created_at: "2016-03-25T22:21:09Z"
url: "https://github.com/elm/error-message-catalog/issues/104"
labels: ['types']
---

# Issue #104: Returning part of a type alias / forgetting a parameter

**State:** `CLOSED` | **Author:** @pinx | **Source:** [https://github.com/elm/error-message-catalog/issues/104](https://github.com/elm/error-message-catalog/issues/104)

## Description

I have a two level data model, for which I was building a decoder. To start simple, I wanted to just decode the top level.

``` elm
type alias Category =
  { id : Int
  , name : String
  , products : List Product
  }

type alias Product =
  { id : Int
  , name : String
  }

categoryDecoder : Decoder Category
categoryDecoder = 
  Json.Decode.object2
    Category
    ("id" := Json.Decode.int)
    ("name" := Json.Decode.string)
```

The mistake I'm making here, is forgetting to set products to a default (empty list).
The message I get is:

```
The type annotation for `categoryDecoder` does not match its definition.

75│ categoryDecoder : Decoder Category
                      ^^^^^^^^^^^^^^^^
The type annotation is saying:

    Decoder { id : Int, name : String, products : List Product }

But I am inferring that the definition has this type:

    Decoder (List Product -> Category)
```

What would be helpful, is a message like:

```
The type annotation for `categoryDecoder` does not match its definition.

75│ categoryDecoder : Decoder Category
                      ^^^^^^^^^^^^^^^^
The type annotation is saying this function returns:

    Category

But I am inferring that the definition is returning a function that creates a Category:

    (List Product -> Category)

Did you forget an argument to the function that creates a Category?
```

