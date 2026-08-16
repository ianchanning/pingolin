---
issue_number: 205
title: "space is required on new line in the repl"
state: OPEN
author: "gunnarahlberg"
created_at: "2017-02-28T09:57:04Z"
url: "https://github.com/elm/error-message-catalog/issues/205"
labels: ['parser']
---

# Issue #205: space is required on new line in the repl

**State:** `OPEN` | **Author:** @gunnarahlberg | **Source:** [https://github.com/elm/error-message-catalog/issues/205](https://github.com/elm/error-message-catalog/issues/205)

## Description

I was testing new lines in the REPL and found something worth mentioning. Maybe it is a  bug or room for improvement? At least I could not find the root cause without the awesome help of the slack channel - thank you ilias! https://elmlang.slack.com/team/ilias https://elmlang.slack.com/archives/beginners/p1488263240033090

```
> isNeg n = \
| n<0
-- SYNTAX PROBLEM -------------------------------------------- repl-temp-000.elm


The = operator is reserved for defining variables. Maybe you want == instead? Or

maybe you are defining a variable, but there is whitespace before it?

3|   isNeg n =
             ^
Maybe <http://elm-lang.org/docs/syntax> can help you figure it out.
```
I checked, sorry, nope

```
> isNeg n = \
|  n<0
<function> : number -> Bool
```
This works

All this was tested on elm 0.18, Windows cmd.exe started with elm-repl
I'm happy to assist in any kind for the triage of this bug!
