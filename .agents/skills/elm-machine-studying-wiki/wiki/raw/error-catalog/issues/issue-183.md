---
issue_number: 183
title: "bad recursion error: bad characters displayed on windows/cmd (letÔÇÖs)"
state: OPEN
author: "mandrolic"
created_at: "2016-11-29T09:52:12Z"
url: "https://github.com/elm/error-message-catalog/issues/183"
labels: ['x-misc']
---

# Issue #183: bad recursion error: bad characters displayed on windows/cmd (letÔÇÖs)

**State:** `OPEN` | **Author:** @mandrolic | **Source:** [https://github.com/elm/error-message-catalog/issues/183](https://github.com/elm/error-message-catalog/issues/183)

## Description

Seen in Windows 10, cmd line elm-make:

Maybe you DO want a recursive value? To define `foo` we need to know what `foo`
is, so letÔÇÖs expand it. Wait, but now we need to know what `foo` is, so letÔÇÖs
expand it... This will keep going infinitely!

Looks like a codepage issue with the changes brought in [here](https://github.com/elm-lang/elm-compiler/commit/a85deed70b9c2d86006b52a6cd95992aaa547b26).

