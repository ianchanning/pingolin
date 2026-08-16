---
issue_number: 105
title: "Confusing message about \"type applications should start with a type atom\""
state: CLOSED
author: "fredcy"
created_at: "2016-03-30T21:11:26Z"
url: "https://github.com/elm/error-message-catalog/issues/105"
labels: []
---

# Issue #105: Confusing message about "type applications should start with a type atom"

**State:** `CLOSED` | **Author:** @fredcy | **Source:** [https://github.com/elm/error-message-catalog/issues/105](https://github.com/elm/error-message-catalog/issues/105)

## Description

I get the following error message from elm-make (0.16) when compiling the code following that.

```
-- TYPE MISMATCH ------------------------------------------------------ Main.elm

The type annotation for `update` does not match its definition.

17│ update : Users -> Action -> Users
             ^^^^^^^^^^^^^^^^^^^^^^^^
The type annotation is saying:

    Users -> Action -> Users

But I am inferring that the definition has this type:

    elm-make: type applications should start with a type atom
```

``` elm
module Main (..) where

type alias Users =
  { users : List User
  }

type alias User =
  { name : String
  }

type Action
  = X (Result () List)

update : Users -> Action -> Users
update model action model =
  case action of
    X result ->
      case result of
        Ok users ->
          Users (List.map2 (+) model.users users)
```

