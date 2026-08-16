---
issue_number: 73
title: "Comparability of composite structures and an example in tuples"
state: OPEN
author: "s-marashi"
created_at: "2015-12-18T15:28:16Z"
url: "https://github.com/elm/error-message-catalog/issues/73"
labels: ['types']
---

# Issue #73: Comparability of composite structures and an example in tuples

**State:** `OPEN` | **Author:** @s-marashi | **Source:** [https://github.com/elm/error-message-catalog/issues/73](https://github.com/elm/error-message-catalog/issues/73)

## Description

As I was playing around of comparability an equability concept, I found this weird example:

``` elm
import Graphics.Element exposing (..)


f1 a = a
f2 a = a


main : Element
main = show <| (1,f1) > (1,f2)
```

which fails by this error:

> (>) is expecting the left argument to be a: 
> 
>  ( number, a -> a ) 
> 
> But the left argument is: 
> 
>  ( number, a -> a ) 
> 
> Hint: Only ints, floats, chars, strings, lists, and tuples are comparable.

So I think here is a challenge for comparability concept, i.e. although in the compiler's hint is said tuples are comparable but this one is an exception so maybe comparability should be defined as "any composite data structure is comparable if and only if all of its members are comparable" then the mentioned tuple is not comparable at all and then compiler error should be:

> (>) is expecting the left argument to be a: 
> 
>  comparable 
> 
> Hint: Only ints, floats, chars, strings and composite structures whose members are comparable are counted as comparable.

or maybe something more declarative.

