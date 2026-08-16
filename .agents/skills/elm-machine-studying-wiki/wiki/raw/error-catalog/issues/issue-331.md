---
issue_number: 331
title: "Type alias should be expanded to show the details"
state: OPEN
author: "ChristophP"
created_at: "2020-03-06T09:54:58Z"
url: "https://github.com/elm/error-message-catalog/issues/331"
labels: []
---

# Issue #331: Type alias should be expanded to show the details

**State:** `OPEN` | **Author:** @ChristophP | **Source:** [https://github.com/elm/error-message-catalog/issues/331](https://github.com/elm/error-message-catalog/issues/331)

## Description

**Problem:** Often while developing I find myself getting an error like this:
```🚨  /Users/d441365/projects/swk/reco-service-frontend/src/Main.elm: Compilation failed
Compiling ...-- TYPE MISMATCH ------------------------------------------ src/Page/Results.elm

The 4th argument to `createSegments` is not what I expect:

134|             , Api.createSegments token apiBaseUrl CreateSegmentsResponse payload
                                                                              ^^^^^^^
This `payload` value is a:

    { combinationId : String }

But `createSegments` needs the 4th argument to be:

    Api.CreateSegmentsPayload

Hint: I always figure out the argument types from left to right. If an argument
is acceptable, I assume it is “correct” and move on. So the problem may actually
be in one of the previous arguments!

Hint: Looks like the segments field is missing.

Detected problems in 1 module.
```

The relevant bit here is shown below. It is telling me about a name of a type alias but not he structure. Most of the time I already know the name of the type alias but I want to know what the structure needs to be exactly.
```
This `payload` value is a :

    { combinationId : String }

But `createSegments` needs the 4th argument to be:

    Api.CreateSegmentsPayload
```
This is especially problematic with typos. Say my type alias is a record of 10 fields but one has a typo it is hard to figure out when you cannot really compare what you have to what it needs to be visually and makes one  looks where the definition is instead.

**Improvement suggestion** Display the structure details or even better which fields did not line up,  displaying typos and type mismatches on a field level.
