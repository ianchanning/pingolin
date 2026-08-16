---
issue_number: 321
title: "error when publishing package with non-root elm.json"
state: OPEN
author: "bburdette"
created_at: "2019-11-02T17:48:04Z"
url: "https://github.com/elm/error-message-catalog/issues/321"
labels: []
---

# Issue #321: error when publishing package with non-root elm.json

**State:** `OPEN` | **Author:** @bburdette | **Source:** [https://github.com/elm/error-message-catalog/issues/321](https://github.com/elm/error-message-catalog/issues/321)

## Description

**Quick Summary:**

I got an error trying to publish my package!

```
-- ERROR -----------------------------------------------------------------------

I ran into something that bypassed the normal error reporting process! I
extracted whatever information I could from the internal error:

>   /home/bburdette/code/pdf-element/elm/elm-stuff/0.19.1/prepublish/elm.json: getModificationTime:getFileStatus: does not exist (No such file or directory)

These errors are usually pretty confusing, so start by asking around on one of
forums listed at https://elm-lang.org/community to see if anyone can get you
unstuck quickly.

```

## SSCCE

Its a pretty small package with only one elm.json and one elm source file.  One potentially unusual feature is that the elm project is a subfolder of the repo, and not the root.

https://github.com/bburdette/pdf-element

revision:  5079f103efc33996cbde3c0ce29e073a3922f95d

- **Elm:** 0.19.1
- **Operating System:** nixos


