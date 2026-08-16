---
issue_number: 161
title: "Unfinished expression followed by newline at the end of line gives unhelpful error message"
state: CLOSED
author: "app/"
created_at: "2016-08-24T08:49:47Z"
url: "https://github.com/elm/error-message-catalog/issues/161"
labels: []
---

# Issue #161: Unfinished expression followed by newline at the end of line gives unhelpful error message

**State:** `CLOSED` | **Author:** @app/ | **Source:** [https://github.com/elm/error-message-catalog/issues/161](https://github.com/elm/error-message-catalog/issues/161)

## Description

`case True of` + \n
`If True then` + \n

![screenshot from 2016-08-24 15-44-21](https://cloud.githubusercontent.com/assets/8935782/17924206/db23769a-6a11-11e6-91b2-02484ef6d233.jpg)

I was using Brackets and elm-reactor

---

Found with the help of cobalamin: https://elmlang.slack.com/team/cobalamin

