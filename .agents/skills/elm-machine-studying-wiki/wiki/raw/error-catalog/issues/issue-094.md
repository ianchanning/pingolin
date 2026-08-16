---
issue_number: 94
title: "`exposing` makes arguments fragile"
state: OPEN
author: "kossnocorp"
created_at: "2016-03-04T01:17:32Z"
url: "https://github.com/elm/error-message-catalog/issues/94"
labels: ['no sscce', 'naming']
---

# Issue #94: `exposing` makes arguments fragile

**State:** `OPEN` | **Author:** @kossnocorp | **Source:** [https://github.com/elm/error-message-catalog/issues/94](https://github.com/elm/error-message-catalog/issues/94)

## Description

I'm going through ["Elm: Building Reactive Web Apps" cource](https://pragmaticstudio.com/elm) and just met a problem:

<img width="486" alt="tmux___users_koss_src_edu_elm" src="https://cloud.githubusercontent.com/assets/52201/13514456/ee071cf6-e1ce-11e5-9f73-f507c511f9dd.png">

...but:

<img width="359" alt="tmux___users_koss_src_edu_elm" src="https://cloud.githubusercontent.com/assets/52201/13514463/027f77e6-e1cf-11e5-9d64-cfe95735b12b.png">

Elm is known as the error-prone language, but this is obviously a point of failure.

Not sure if it's sounds sane to you, but I'd offer to change syntax of arguments to make such mistakes impossible:

``` elm
newEntry $phrase $points $ids =
  { phrase = $phrase
  , points = $points
  , wasSpoken = False
  , id = $id
  }
```

`$`, `@`, whatever is working.

Alternatively, Elm could check unused arguments and warn a user, if a possible typo is made. However, I don't see how to make it bulletproof.

Thank you, for your great work!

