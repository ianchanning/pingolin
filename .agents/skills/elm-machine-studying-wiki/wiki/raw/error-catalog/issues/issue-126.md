---
issue_number: 126
title: "Forgot to define the function"
state: CLOSED
author: "kittykatattack"
created_at: "2016-06-10T19:21:48Z"
url: "https://github.com/elm/error-message-catalog/issues/126"
labels: ['parser']
---

# Issue #126: Forgot to define the function

**State:** `CLOSED` | **Author:** @kittykatattack | **Source:** [https://github.com/elm/error-message-catalog/issues/126](https://github.com/elm/error-message-catalog/issues/126)

## Description

Consider the following:

``` elm
update : Msg -> Model -> Model
  case message of 
    NoOp ->
      model
```

... Oops, I forgot to actually define the function!
It produces the following error message:

```
I ran into something unexpected when parsing your code!

28|   case message of
      ^
I am looking for one of the following things:

    end of input
    whitespace
```

Perhaps we can assist beginners with an error message like this:

```
It looks like you've written a type annotation for a function, but
forgot to actually define the function that uses it. You probably need 
to insert the following line of code at line number xxx :

update message model =

```

