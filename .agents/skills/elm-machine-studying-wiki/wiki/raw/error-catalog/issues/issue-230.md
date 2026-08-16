---
issue_number: 230
title: "When argument used with inconsistent types, compiler only points out one use. "
state: OPEN
author: "dela3499"
created_at: "2017-08-10T13:34:30Z"
url: "https://github.com/elm/error-message-catalog/issues/230"
labels: ['types', 'x-record']
---

# Issue #230: When argument used with inconsistent types, compiler only points out one use. 

**State:** `OPEN` | **Author:** @dela3499 | **Source:** [https://github.com/elm/error-message-catalog/issues/230](https://github.com/elm/error-message-catalog/issues/230)

## Description

I used a function argument inconsistently, where one use treated it like a record, and another as a `comparable`. The first use was correct, and the second was a mistake. The error message pointed to the correct use and didn't mention the incorrect one. It took a while to realize where I'd made the mistake. 

I created a function without annotations, like so: 

```elm
import Dict

f record = 
  let x = record.a
      y = Dict.get record Dict.empty -- accidentally typed "record" rather than "record.a"
  in 0
```
and misused  `record`. The compiler gave the following message: 

![image](https://user-images.githubusercontent.com/5673550/29172482-13ba892a-7dae-11e7-81df-16ca87c013dc.png)

While the `y = ` definition is where I made the mistake, the compiler doesn't mention it. In this case, it would be great for the compiler to say something like " in `y = ...`,  record is a `comparable`, but in `x = ...` it's being treated like a `{a: a}`. 

I get a much better error message after adding a type annotation to the function. 

```elm
import Dict

f: {a: String} -> Int
f record = 
  let x = record.a
      y = Dict.get record Dict.empty -- accidentally typed "record" rather than "record.a"
  in 0
```

![image](https://user-images.githubusercontent.com/5673550/29172638-86c0d5dc-7dae-11e7-9bf0-d9792d0befeb.png)



