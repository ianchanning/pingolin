---
issue_number: 216
title: "Error Messages can they be made more intuitive?"
state: OPEN
author: "jiggneshhgohel"
created_at: "2017-04-25T08:27:44Z"
url: "https://github.com/elm/error-message-catalog/issues/216"
labels: []
---

# Issue #216: Error Messages can they be made more intuitive?

**State:** `OPEN` | **Author:** @jiggneshhgohel | **Source:** [https://github.com/elm/error-message-catalog/issues/216](https://github.com/elm/error-message-catalog/issues/216)

## Description

I have just started programming in elm-lang because of the positive responses I noticed on Twitter and various channels.

One of the selling points I have noticed is the intuitive error messages Elm compiler generates while parsing code. Inline with this I would like to share my experience about this w.r.t the behavior I encountered  while I am trying to follow the tutorial at https://www.elm-tutorial.org/en/

Attached is the error message which was reported. 

![localhost_2017-04-24_13-19-42](https://cloud.githubusercontent.com/assets/10440841/25375571/b582f6aa-29be-11e7-92a1-e6267bae81c2.png)



At first glance I was unable to figure out what was the issue because comparing the code I wrote with the one shown in the tutorial was looking identical. Then I noticed that in tutorial it is `MouseMsg  Mouse.Position` and I typed `MouseMsg Mouse.position` (_notice the small-case p in Position_).

I then checked the documentation and found that `Position` is a type-alias for a record. This made me think that wouldn't it be great if in the list of items shown by

**I am looking for one of the following things:** 

included `Position` because I was trying to access a type-alias defined in the Mouse module. In other words if I am trying to access something part of the library and I mis-typed in my code then the error message should consider that possibility too.

To convey my point I would like to use an analogy of Object-Oriented Programming's Class, Properties and Methods concepts. In present case Class is Mouse and Position can be considered as a Property or a Method or even a Nested-Class too.

I really have no idea what it would take to get this behavior but wanted to share my thoughts on this when I am seeing a lot of people being amazed by the elm-compiler's generated intuitive errors.

Thanks.

Reference:  https://groups.google.com/d/msg/elm-discuss/mSDjOm1Wj5o/5CgPz8orAAAJ
