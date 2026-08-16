---
issue_number: 131
title: "Bad fields in Html.program record give confusing messages"
state: CLOSED
author: "app/"
created_at: "2016-06-24T14:21:54Z"
url: "https://github.com/elm/error-message-catalog/issues/131"
labels: ['types']
---

# Issue #131: Bad fields in Html.program record give confusing messages

**State:** `CLOSED` | **Author:** @app/ | **Source:** [https://github.com/elm/error-message-catalog/issues/131](https://github.com/elm/error-message-catalog/issues/131)

## Description

error is `subscriptions = Sub.none`
solution is `subscriptions model = Sub.none`
![fixed by subscriptions model couldn t error message just say subscriptions is missing its argument](https://cloud.githubusercontent.com/assets/8081877/16340275/20f85442-3a1f-11e6-914a-035a795196f2.png)

It's as though Elm is starting at the top (with `main`), rather than at the bottom and seeing that `subscriptions` is just missing an argument.

