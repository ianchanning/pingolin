---
issue_number: 337
title: "Inverted arguments by mistake"
state: OPEN
author: "gabriela-sartori"
created_at: "2020-05-02T22:23:28Z"
url: "https://github.com/elm/error-message-catalog/issues/337"
labels: []
---

# Issue #337: Inverted arguments by mistake

**State:** `OPEN` | **Author:** @gabriela-sartori | **Source:** [https://github.com/elm/error-message-catalog/issues/337](https://github.com/elm/error-message-catalog/issues/337)

## Description

# Example

```
module Main exposing (main)

import Html as H

main : H.Html Never
main =
    H.text (String.repeat "Hello World! " 3)
```

# Error

```
Type Mismatch
Line 7, Column 43
The 2nd argument to `repeat` is not what I expect:

7|     H.text (String.repeat "Hello World! " 3)
                                             ^
This argument is a number of type:

    number

But `repeat` needs the 2nd argument to be:

    String

Hint: I always figure out the argument types from left to right. If an argument
is acceptable, I assume it is “correct” and move on. So the problem may actually
be in one of the previous arguments!

Hint: Try using String.fromInt to convert it to a string?
Type Mismatch
Line 7, Column 27
The 1st argument to `repeat` is not what I expect:

7|     H.text (String.repeat "Hello World! " 3)
                             ^^^^^^^^^^^^^^^
This argument is a string of type:

    String

But `repeat` needs the 1st argument to be:

    Int

Hint: Want to convert a String into an Int? Use the String.toInt function!
```

# Suggestion

```
Type Mismatch
Line 7, Column 27 and 43
The argument order seems to be inverted at `repeat`:

7|     H.text (String.repeat "Hello World! " 3)
                             ^               ^
These argument are:

    String and number

But `repeat` needs arguments to be:

    number and String

```

