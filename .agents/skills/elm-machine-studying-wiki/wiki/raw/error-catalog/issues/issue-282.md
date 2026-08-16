---
issue_number: 282
title: "Package install with malformed package name produced unhelpful error message"
state: CLOSED
author: "MartinSStewart"
created_at: "2018-11-18T16:04:18Z"
url: "https://github.com/elm/error-message-catalog/issues/282"
labels: []
---

# Issue #282: Package install with malformed package name produced unhelpful error message

**State:** `CLOSED` | **Author:** @MartinSStewart | **Source:** [https://github.com/elm/error-message-catalog/issues/282](https://github.com/elm/error-message-catalog/issues/282)

## Description

I ran `elm install elm-geometry` in PowerShell using Window 10 and got the following error message:
```
elm.exe: TODO show possible arg configurations
CallStack (from HasCallStack):
  error, called at ui/terminal/src\Terminal\Args\Error.hs:281:13 in main:Terminal.Args.Error
```
After a couple minutes I realized that I should have written `elm install ianmackenzie/elm-geometry` instead but I think it would be more helpful if the error message returned was something along the lines of `Failed to install package.  I expected the package name formatted as author/package-name`.
