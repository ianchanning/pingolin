---
issue_number: 201
title: "Fix strange `t_s_o_l` error message"
state: OPEN
author: "rudolf-adamkovic"
created_at: "2017-01-26T12:24:50Z"
url: "https://github.com/elm/error-message-catalog/issues/201"
labels: []
---

# Issue #201: Fix strange `t_s_o_l` error message

**State:** `OPEN` | **Author:** @rudolf-adamkovic | **Source:** [https://github.com/elm/error-message-catalog/issues/201](https://github.com/elm/error-message-catalog/issues/201)

## Description

In REPL:

```elm
> let a = 1
-- SYNTAX PROBLEM -------------------------------------------- repl-temp-000.elm

I need whitespace, but got stuck on what looks like a new declaration. You are
either missing some stuff in the declaration above or just need to add some
spaces here:

5| t_s_o_l = ()
   ^
I am looking for one of the following things:

    whitespace
```
