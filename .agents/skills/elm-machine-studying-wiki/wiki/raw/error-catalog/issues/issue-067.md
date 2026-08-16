---
issue_number: 67
title: "No record creation function for type aliases built with extensible types"
state: OPEN
author: "ccapndave"
created_at: "2015-12-02T19:05:03Z"
url: "https://github.com/elm/error-message-catalog/issues/67"
labels: ['naming']
---

# Issue #67: No record creation function for type aliases built with extensible types

**State:** `OPEN` | **Author:** @ccapndave | **Source:** [https://github.com/elm/error-message-catalog/issues/67](https://github.com/elm/error-message-catalog/issues/67)

## Description

When a type alias is constructed using a type alias it doesn't get a shorthand function of the same name with which to create the type.  Therefore it would be nice to have an error message explaining this.

`"Job was build using an extensible record, and so you cannot make new Jobs using a Job function.  Write an explicit function to create Jobs instead"`

Full discussion at https://groups.google.com/forum/#!topic/elm-discuss/Xu21kJMAujQ

