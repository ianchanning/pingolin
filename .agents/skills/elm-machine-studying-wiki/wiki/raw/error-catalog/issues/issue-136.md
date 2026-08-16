---
issue_number: 136
title: "Generic syntax error when 'module' declaration is missing 'exposing'"
state: CLOSED
author: "JohnBugner"
created_at: "2016-07-13T09:08:04Z"
url: "https://github.com/elm/error-message-catalog/issues/136"
labels: ['parser']
---

# Issue #136: Generic syntax error when 'module' declaration is missing 'exposing'

**State:** `CLOSED` | **Author:** @JohnBugner | **Source:** [https://github.com/elm/error-message-catalog/issues/136](https://github.com/elm/error-message-catalog/issues/136)

## Description

Take the following code:

```
module ModuleA

import ModuleB

[... stuff ...]
```

The compiler gives the following error message:

```
I need whitespace, but got stuck on what looks like a new declaration. You are
either missing some stuff in the declaration above or just need to add some
spaces here:

3| import ModuleB
   ^
I am looking for one of the following things:

    whitespace
```

But what caused the error?: not the lack of whitespace!, but a missing 'exposing' clause after "module ModuleA". It's fixed by simply writing:

```
module ModuleA exposing (..)

import ModuleB

[... stuff ...]
```

This is an misleading error message. It mentions needing whitespace three times, but needing an 'exposing' clause zero times. A beginner could get stuck looking at whitespace, forgetting that they need an 'exposing' clause, because the module declaration already looks and feels right to them. (Especially because many other languages list the module declaration at the top of the file just like Elm, but then either don't let the user define which things are exported, or let the user leave out the export clause.)

The error message should explicitly mention needing an 'exposing' clause. Saying "You are
either missing some stuff in the declaration above" isn't good enough. 

(I admit that I don't know how easy it would be to change this error message, and what other cases it would affect; I don't know the inner workings of the Elm compiler. Perhaps this is an unrealistic request; I apologize if it is.)

