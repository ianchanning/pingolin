---
issue_number: 69
title: "Wrong type variable reported for polymorphic type alias"
state: CLOSED
author: "jefelino"
created_at: "2015-12-07T02:10:09Z"
url: "https://github.com/elm/error-message-catalog/issues/69"
labels: []
---

# Issue #69: Wrong type variable reported for polymorphic type alias

**State:** `CLOSED` | **Author:** @jefelino | **Source:** [https://github.com/elm/error-message-catalog/issues/69](https://github.com/elm/error-message-catalog/issues/69)

## Description

```
type alias F a = a

wrong : F a -> F b
wrong = identity
```

This produces the following error message (Elm version 0.16).

```
The type annotation for `wrong` does not match its definition.
The type annotation is saying:
    F b -> F b
But I am inferring that the definition has this type:
    F b -> F b
Hint: A type annotation is clashing with itself or with a sub-annotation. This
can be particularly tricky, so read more about it.
<https://github.com/elm-lang/elm-compiler/blob/0.16.0/hints/type-annotations.md>
```

Note in contrast that this code produces the correct error message:

```
wrong' : a -> b
wrong' = identity
```

```
The type annotation for `wrong'` does not match its definition.
The type annotation is saying:
    a -> b
But I am inferring that the definition has this type:
    a -> a
```

