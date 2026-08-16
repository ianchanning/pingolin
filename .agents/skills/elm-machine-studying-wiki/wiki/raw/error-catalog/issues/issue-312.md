---
issue_number: 312
title: "using ^ to indicate position in a line is bad for accessibility"
state: OPEN
author: "mikolysz"
created_at: "2019-10-21T15:57:03Z"
url: "https://github.com/elm/error-message-catalog/issues/312"
labels: []
---

# Issue #312: using ^ to indicate position in a line is bad for accessibility

**State:** `OPEN` | **Author:** @mikolysz | **Source:** [https://github.com/elm/error-message-catalog/issues/312](https://github.com/elm/error-message-catalog/issues/312)

## Description

A message like this one (from the [Elm 0.19.1 blog post](https://elm-lang.org/news/the-syntax-cliff)):

```
1| import * as Set from 'set'
          ^
```

Is hard to understand for people using screen readers. Screen readers are mostly useful for blind computer users. They read aloud the contents of the screen (code included), allowing them to do many things, including programming. However, the position of the ^ below a particular place in the line is a very visual thing. The screen reader will read that the ^ exists, but not underneath what character it's lcated, obviously. One possible fix is to include the column number next to the line number (there are editor facilities to check what column we're in), or, better, to put some indication in the line itself, not underneath.
