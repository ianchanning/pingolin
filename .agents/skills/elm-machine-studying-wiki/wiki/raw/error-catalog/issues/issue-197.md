---
issue_number: 197
title: "Mention the arrow in type mismatch errors"
state: OPEN
author: "marick"
created_at: "2016-12-30T19:30:47Z"
url: "https://github.com/elm/error-message-catalog/issues/197"
labels: ['types']
---

# Issue #197: Mention the arrow in type mismatch errors

**State:** `OPEN` | **Author:** @marick | **Source:** [https://github.com/elm/error-message-catalog/issues/197](https://github.com/elm/error-message-catalog/issues/197)

## Description

I don't know how I got the idea, or how I was able to maintain it for so long, but I had the impression that the arrow in type mismatch errors pointed to the last correct line, not the erroneous line:

<img width="671" alt="screen shot 2016-12-30 at 1 22 22 pm" src="https://cloud.githubusercontent.com/assets/71909/21571352/017e6688-ce94-11e6-8b60-7fd9f55bfdfd.png">

Maybe change the text from "But the 4th is:" to "But the 4th (marked with >) is:"
