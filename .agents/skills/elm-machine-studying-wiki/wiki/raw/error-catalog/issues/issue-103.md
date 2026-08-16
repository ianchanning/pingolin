---
issue_number: 103
title: "Imported module without name assumed to be Main"
state: OPEN
author: "mgold"
created_at: "2016-03-24T03:06:09Z"
url: "https://github.com/elm/error-message-catalog/issues/103"
labels: ['naming']
---

# Issue #103: Imported module without name assumed to be Main

**State:** `OPEN` | **Author:** @mgold | **Source:** [https://github.com/elm/error-message-catalog/issues/103](https://github.com/elm/error-message-catalog/issues/103)

## Description

Library.elm contains a single defintion, say `question = Nothing`, and no module declaration. Main.elm includes `import Library` and a defintion, say `answer = 42`. Library does not need to be exposed in `elm-package.json`. Now:

```
$ elm make Main.elm 
The module name is messed up for ././Library.elm

    According to the file's name it should be Library
    According to the source code it should be Main

Which is it?
```

This is confusing because nowhere in Library.elm does it declare itself as Main. Rather this name is inferred silently.

If it's possible to detect that there is no module declaration, or just if the source code name is Main, then print a message along the lines of

```
{{filename i.e. Library.elm}} is being imported but it doesn't have a module declaration.
Add this line at the very top of the file:

module {{name inferred from file name i.e. Library}} where
```

(Also, what's up with `././` before the file name?)

