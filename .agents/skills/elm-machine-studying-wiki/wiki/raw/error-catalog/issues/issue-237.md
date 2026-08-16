---
issue_number: 237
title: "Set insert a Tuple containing a Type, error message confusing"
state: OPEN
author: "roine"
created_at: "2017-09-04T00:28:06Z"
url: "https://github.com/elm/error-message-catalog/issues/237"
labels: []
---

# Issue #237: Set insert a Tuple containing a Type, error message confusing

**State:** `OPEN` | **Author:** @roine | **Source:** [https://github.com/elm/error-message-catalog/issues/237](https://github.com/elm/error-message-catalog/issues/237)

## Description

This error message bugged me for quite a while until I understood that the Tuple couldn't contain a type prior to be inserted to a Set.

Here's a sample of the phenomenon: https://ellie-app.com/4cJ5WNSqjwLa1/0


```
Function fromList is expecting the argument to be:

List ( Olive, number )

But it is:

List ( Olive, number )
```

A better error message could be:
```
Function fromList is expecting the argument to be:

(comparable, comparable)

But it is:

(Olive, comparable)
