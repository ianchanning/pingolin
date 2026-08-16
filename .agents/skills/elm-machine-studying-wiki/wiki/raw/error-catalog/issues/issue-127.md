---
issue_number: 127
title: "Forgot to add a type argument"
state: OPEN
author: "kittykatattack"
created_at: "2016-06-14T12:33:43Z"
url: "https://github.com/elm/error-message-catalog/issues/127"
labels: ['naming']
---

# Issue #127: Forgot to add a type argument

**State:** `OPEN` | **Author:** @kittykatattack | **Source:** [https://github.com/elm/error-message-catalog/issues/127](https://github.com/elm/error-message-catalog/issues/127)

## Description

Consider the following:

``` elm
type Msg
  = UpdateMarkdown
```

Then, in my `update` function:

``` elm
UpdateMarkdown questions ->
      { model | essay = Essay.update (Essay.CreateMarkdown questions) model.essay }
      ![]
```

Oops! I added a `questions` argument to the type!
Here's the error message:

```
-- TOO MANY ARGUMENTS ---------------------------------- .\src\WritingAdvice.el m

Pattern WritingAdvice.UpdateMarkdown has too many arguments.

55|     UpdateMarkdown questions ->
        ^^^^^^^^^^^^^^^^^^^^^^^^
Expecting 0, but got 1.
```

Perhaps we can improve this by telling the user that they may have forgotten to define the type argument, and suggesting the inferred type?

