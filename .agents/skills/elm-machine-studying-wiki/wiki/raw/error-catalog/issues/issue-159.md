---
issue_number: 159
title: "Nested record update message"
state: OPEN
author: "chalmagean"
created_at: "2016-08-22T09:31:45Z"
url: "https://github.com/elm/error-message-catalog/issues/159"
labels: ['parser']
---

# Issue #159: Nested record update message

**State:** `OPEN` | **Author:** @chalmagean | **Source:** [https://github.com/elm/error-message-catalog/issues/159](https://github.com/elm/error-message-catalog/issues/159)

## Description

I was trying to update a nested record and stumbled upon an error message that wasn't very helpful.

My code looks like this:

``` elm
type alias State = {
  , reservations = []
  , calendar = Calendar
  }

view state =
  let
    newCalendar = { state.calendar | reservations = state.reservations }
  in
    ....view code that renders `Calendar.view newCalendar`...
```

So my goal was to get a new record out of the old one and pass it to my nested component (Calendar).

Here's the error message:

``` elm
I ran into something unexpected when parsing your code!

139|           { state.calendar
                      ^
I am looking for one of the following things:

    "|"
    an equals sign '='
    more letters in this name
    whitespace
```

Even after I found out that I cannot use nested records like that, I don't think that the error message helps in identifying the problem.

So maybe a better message would be to mention that fact that nested record updates are not allowed or something that will make it more obvious. Additionally, an example of how to correct the issue would be nice too.

``` elm
let
    oldRecord = state.record
    newRecord = { oldRecord | ... = ... }
in
   ...
```

