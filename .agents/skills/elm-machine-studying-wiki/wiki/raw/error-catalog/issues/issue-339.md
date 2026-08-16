---
issue_number: 339
title: "Got type X instead of type Y having single variant X"
state: OPEN
author: "malaire"
created_at: "2020-05-27T10:49:18Z"
url: "https://github.com/elm/error-message-catalog/issues/339"
labels: []
---

# Issue #339: Got type X instead of type Y having single variant X

**State:** `OPEN` | **Author:** @malaire | **Source:** [https://github.com/elm/error-message-catalog/issues/339](https://github.com/elm/error-message-catalog/issues/339)

## Description

I recently got this kind of error
```
Something is off with the body of the `someFunc` definition:
...
The body is a list of type:

    List (Maybe { someField : Bool })

But the type annotation on `someFunc` says it should be:

    List SomeRecord
```
where `SomeRecord` is defined as
```
type SomeRecord
    = Maybe { someField: Bool }
```

The error here is missing `alias` from `type SomeRecord`, which makes type to have a single variant `Maybe`, instead of being alias to type `Maybe` what is used in the function.

This error can be tricky to notice, so it would be nice if compiler could detect that type `Maybe` and variant `Maybe` have same name, and report this.
