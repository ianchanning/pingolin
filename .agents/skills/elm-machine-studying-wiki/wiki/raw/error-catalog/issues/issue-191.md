---
issue_number: 191
title: "Context-aware parsing hints"
state: CLOSED
author: "evancz"
created_at: "2016-12-16T04:11:29Z"
url: "https://github.com/elm/error-message-catalog/issues/191"
labels: ['parser', 'meta']
---

# Issue #191: Context-aware parsing hints

**State:** `CLOSED` | **Author:** @evancz | **Source:** [https://github.com/elm/error-message-catalog/issues/191](https://github.com/elm/error-message-catalog/issues/191)

## Description

I think the parse errors could be improved in two ways:

  1. When the parser has totally failed, try to recognize some symbols and keywords. So if you see it failed on `as` #139  or `port` #76 you can provide a hint about them not being variables. Or about `->` showing up in definitions #142. This would also let you underline the whole token.

  2. Provide links to a syntax document based on context. This requires that a syntax document is created specially for this purpose, though it could double as relatively dry and verbose documentation.

Besides the issues already linked, the following issues could also benefit from this:

  - #2 - `type Point = { x : Int, y : Int }`
  - #126 - type annotation then definition body, but forgot to start the definition
  - #136 - missing `exposing` in `module` declaration
  - #168 - `{ x = 3, , y = 4 }`
