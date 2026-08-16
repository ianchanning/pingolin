---
issue_number: 268
title: "Misleading TYPE MISMATCH error on the body of a function"
state: OPEN
author: "mordrax"
created_at: "2018-09-02T10:28:20Z"
url: "https://github.com/elm/error-message-catalog/issues/268"
labels: ['types', 'no sscce']
---

# Issue #268: Misleading TYPE MISMATCH error on the body of a function

**State:** `OPEN` | **Author:** @mordrax | **Source:** [https://github.com/elm/error-message-catalog/issues/268](https://github.com/elm/error-message-catalog/issues/268)

## Description

i'm finding the wording of the type mismatch to be confusing as it's lead me down the wrong path:

```
-- TYPE MISMATCH ------------------------------ ../frontend/src/Model/Person.elm

Something is off with the body of the `getCoverStartDate` definition:

18|>    Debug.log "Person cover start date:"
19|>        (person.coverInfoDetails
20|>            |> List.sortWith sorter
21|>            |> List.reverse
22|>            |> List.head
23|>            |> Maybe.map .startDate

The body is:

    Maybe DateTime

But the type annotation on `getCoverStartDate` says it should be:

    Maybe Date
```

In this example, I spent some time working out what the body is actually returning, and it's the correct `Maybe Date`. I'm 99% certain.

However I believe the compiler is inferring that the type is `Maybe DateTime` from the _usage_ of the return of the function elsewhere. So it's misleading to say that the body is `Maybe DateTime` when the body is actually a `Maybe Date` being used as a `Maybe DateTime`.

The full function is:
```
getCoverStartDate : Person -> Maybe Date
getCoverStartDate person =
    let
        sorter : CoverInfoDetail -> CoverInfoDetail -> Order
        sorter a b =
            Alfred.DateTime.compare a.startDate b.startDate
    in
    Debug.log "Person cover start date:"
        (person.coverInfoDetails
            |> List.sortWith sorter
            |> List.reverse
            |> List.head
            |> Maybe.map .startDate
        )
```
CoverInfoDetail.startDate, Alfred.DateTime.compare both work with `Date`.

Once I get it compiling, I can confirm that it's the usage of the function and not the body that's `Maybe DateTime`
