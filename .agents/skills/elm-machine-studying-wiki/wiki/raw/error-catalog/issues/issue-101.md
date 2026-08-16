---
issue_number: 101
title: "Large tuple error message"
state: CLOSED
author: "yang-wei"
created_at: "2016-03-19T13:32:42Z"
url: "https://github.com/elm/error-message-catalog/issues/101"
labels: []
---

# Issue #101: Large tuple error message

**State:** `CLOSED` | **Author:** @yang-wei | **Source:** [https://github.com/elm/error-message-catalog/issues/101](https://github.com/elm/error-message-catalog/issues/101)

## Description

From the doc[http://elm-lang.org/docs/syntax]:

> There is a special function for creating tuples:
> 
> (,) 1 2              == (1,2)
> (,,,) 1 True 'a' []  == (1,True,'a',[])
> You can use as many commas as you want.

This is not true. The maximum commas can be used is 8, which is to create 9 elements.

```
---- elm repl 0.16.0 -----------------------------------------------------------
 :help for help, :exit to exit, more at <https://github.com/elm-lang/elm-repl>
--------------------------------------------------------------------------------
> (,,,,,,,,) 1 2 3 4 5 6 7 8 9
(1,2,3,4,5,6,7,8,9)
    : ( number
      , number'
      , number''
      , number'''
      , number''''
      , number'''''
      , number''''''
      , number'''''''
      , number''''''''
      )
> (,,,,,,,,,) 1 2 3 4 5 6 7 8 9 10
elm-make: Could not find `_Tuple10` when solving type constraints.
elm-make: thread blocked indefinitely in an MVar operation
```

The maximum element in a tuple is 9 ? This is undocumented (I think)

(from https://github.com/elm-lang/elm-compiler/issues/1289#issuecomment-198565920 )

