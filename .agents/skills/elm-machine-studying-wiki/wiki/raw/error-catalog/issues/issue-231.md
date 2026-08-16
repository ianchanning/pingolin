---
issue_number: 231
title: "Capitalization mistakes"
state: OPEN
author: "rtfeldman"
created_at: "2017-08-17T15:43:30Z"
url: "https://github.com/elm/error-message-catalog/issues/231"
labels: ['naming']
---

# Issue #231: Capitalization mistakes

**State:** `OPEN` | **Author:** @rtfeldman | **Source:** [https://github.com/elm/error-message-catalog/issues/231](https://github.com/elm/error-message-catalog/issues/231)

## Description

I saw this in `#beginners` on Elm Slack:

> what am i doing wrong here - says that I have a naming error `Cannot find pattern OK`

They used `OK` instead of `Ok`. At a glance, I can see how someone might look at their code and look at the suggestion of `Did you mean "Ok"?` and not spot the distinction.

Hints could detect when one of the suggestions matches what you typed exactly, except for capitalization (e.g. with `if String.toLower actual == String.toLower suggestion`) and call this out. Something like:

> Did you mean:
>
> `Ok` (Note the different capitalization from `OK`)
> `Okra`
> `Octopus`
