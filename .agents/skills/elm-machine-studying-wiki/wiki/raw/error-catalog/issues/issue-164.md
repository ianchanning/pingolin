---
issue_number: 164
title: "Specify line number of declaration in missing whitespace scenario"
state: CLOSED
author: "brunogirin"
created_at: "2016-09-20T11:07:19Z"
url: "https://github.com/elm/error-message-catalog/issues/164"
labels: ['parser', 'no sscce']
---

# Issue #164: Specify line number of declaration in missing whitespace scenario

**State:** `CLOSED` | **Author:** @brunogirin | **Source:** [https://github.com/elm/error-message-catalog/issues/164](https://github.com/elm/error-message-catalog/issues/164)

## Description

In this scenario, it would be very useful to specify the line number at which what looks like a new declaration was found. This is probably due to an unbalanced parens as in issue #9 and indicating the line number where the problem was found would help a lot.

```
-- SYNTAX PROBLEM -------------------------- ./src/Imby/Taxonomy/LocalSearch.elm

I need whitespace, but got stuck on what looks like a new declaration. You are
either missing some stuff in the declaration above or just need to add some
spaces here:


I am looking for one of the following things:

    whitespace
```

