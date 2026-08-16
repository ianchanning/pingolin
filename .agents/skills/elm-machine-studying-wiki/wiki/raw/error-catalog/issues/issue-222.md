---
issue_number: 222
title: "Tell user explicitly that they're trying to use a type as a constructor"
state: CLOSED
author: "drathier"
created_at: "2017-06-11T22:19:43Z"
url: "https://github.com/elm/error-message-catalog/issues/222"
labels: ['no sscce']
---

# Issue #222: Tell user explicitly that they're trying to use a type as a constructor

**State:** `CLOSED` | **Author:** @drathier | **Source:** [https://github.com/elm/error-message-catalog/issues/222](https://github.com/elm/error-message-catalog/issues/222)

## Description

If you have a `type T = T A` and you try to construct `T` using `T`, having imported the type but not the constructor, you get asked if you ment to use the constructor `T` instead, but there's no mention that you're trying to use a type as a constructor. Since they're sharing the same name, it took a while to figure out what happened. 
