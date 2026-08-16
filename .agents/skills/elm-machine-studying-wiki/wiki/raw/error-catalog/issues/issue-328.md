---
issue_number: 328
title: "Type alias should be expanded or diffed to figure out problematic areas"
state: OPEN
author: "j-maas"
created_at: "2020-01-21T15:20:46Z"
url: "https://github.com/elm/error-message-catalog/issues/328"
labels: []
---

# Issue #328: Type alias should be expanded or diffed to figure out problematic areas

**State:** `OPEN` | **Author:** @j-maas | **Source:** [https://github.com/elm/error-message-catalog/issues/328](https://github.com/elm/error-message-catalog/issues/328)

## Description

I just had a frustrating debugging experience, because the error message hid the difference between my input and the expected type behind a type alias: https://ellie-app.com/7PKyQLmk8BNa1

I spend a lot of time comparing it to the [record in the documentation](https://package.elm-lang.org/packages/dillonkearns/elm-markdown/latest/Markdown-Parser) before figuring out that the problem was that the `unorderedList` and `orderedList` fields take a `List (List view)`, instead of a `List view`. The latter was correctly inferred because I put the list `itemBlocks` as an element in `Element.row`'s element list. (I hope this makes sense. Please look at the Ellie linked above if this is unhelpful.)

Now the error just tells me that there is something wrong. However, we have a similar case where I get one of Elm's perfect error messages: https://ellie-app.com/6RCVwj43wQfa1 It highlights that the field `list` does not exist.

I was wondering whether the less helpful error message I got above could do something similar to the second, helpful one by telling me what the type alias looks like. Ideally, it would even diff the inferred record type with the type alias and point out where they differ. This would have made it really easy to spot at least which fields are provoking the error. And even with a simple diff that would highlight the mismatched, but in this case irrelevant, generic types, it would also highlight that I am missing a list. That realization was what helped me solve the problem.

It is also important to note that we should not replace the type alias mention with its expansion, to prevent [unexpected types where aliases were used](https://github.com/elm/error-message-catalog/issues/43). I am suggesting to offer the expansion and ideally a diff as further help for debugging the problem.

I've found some other issues that have issues with type alias reporting that feel related (maybe they might be alleviated by the proposed expansion):
- https://github.com/elm/error-message-catalog/issues/288 A type alias is reported as not being a `List`, though it is an alias for `List Int`.
- https://github.com/elm/error-message-catalog/issues/212 It appears that the type alias was marked as a difference between two types, though it actually boils down to the same.
