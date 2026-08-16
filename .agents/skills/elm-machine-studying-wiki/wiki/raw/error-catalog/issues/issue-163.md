---
issue_number: 163
title: "A better error for writing functions with upper-case first letter"
state: CLOSED
author: "martinmodrak"
created_at: "2016-09-08T17:30:20Z"
url: "https://github.com/elm/error-message-catalog/issues/163"
labels: ['parser']
---

# Issue #163: A better error for writing functions with upper-case first letter

**State:** `CLOSED` | **Author:** @martinmodrak | **Source:** [https://github.com/elm/error-message-catalog/issues/163](https://github.com/elm/error-message-catalog/issues/163)

## Description

This simple program

```
A : Float
A = 10
```

gives this error:

```
I ran into something unexpected when parsing your code!

1| A : Float
     ^
I am looking for one of the following things:

    an equals sign '='
    whitespace
```

I guess it should say something as:

```
1| A : Float
     ^
Names of functions/values cannot start with an upper-case letter.
```

