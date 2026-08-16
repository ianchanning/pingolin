---
issue_number: 120
title: "elm-make outputs cryptic error message"
state: CLOSED
author: "coproduto"
created_at: "2016-05-18T18:49:55Z"
url: "https://github.com/elm/error-message-catalog/issues/120"
labels: []
---

# Issue #120: elm-make outputs cryptic error message

**State:** `CLOSED` | **Author:** @coproduto | **Source:** [https://github.com/elm/error-message-catalog/issues/120](https://github.com/elm/error-message-catalog/issues/120)

## Description

I was trying to run a piece of code that contained this function:

``` elm
searchAndRemove' : a -> List (a,b) -> List (a,b) -> (List (a,b), Maybe (a,b))                                                                                                                                                                 
searchAndRemove' x list accList =                                                                                                                                                                                                             
  case list of                                                                                                                                                                                                                                
    (a, b) :: rest ->                                                                                                                                                                                                                         
      if a == x then ((List.reverse accList) ++ rest, Just (a, b))                                                                                                                                                                            
      else searchAndRemove' x rest (x::accList)                                                                                                                                                                                               

    [] -> (List.reverse accList, Nothing)
```

When I tried to run it in elm-reactor, the following error message appeared:

```
The type annotation for `searchAndRemove'` does not match its definition. 

106| searchAndRemove' : a -> List (a,b) -> List (a,b) -> (List (a,b), Maybe (a,b))                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ 

The type annotation is saying:     
elm-make: Type applications without concrete names should not get here.
```

Now, that doesn't help me a bit and it seems to me like it may be a consequence of an error in the type checker.

I eventually found the error in my code ( the line `else searchAndRemove' x rest (x::accList)` should be `else searchAndRemove' x rest ((a,b)::accList)`) but this message was not helpful at all.

