---
issue_number: 274
title: "Error message suggests the same type as the value that's passed in, should suggest it needs a comparable"
state: CLOSED
author: "alex-tan"
created_at: "2018-10-01T22:33:57Z"
url: "https://github.com/elm/error-message-catalog/issues/274"
labels: ['types']
---

# Issue #274: Error message suggests the same type as the value that's passed in, should suggest it needs a comparable

**State:** `CLOSED` | **Author:** @alex-tan | **Source:** [https://github.com/elm/error-message-catalog/issues/274](https://github.com/elm/error-message-catalog/issues/274)

## Description

At least, I think that's the issue:

```elm
module Main exposing (groupBy)

import Dict exposing (Dict)

groupBy : (a -> comparable) -> List a -> Dict comparable (List a)
groupBy groupFn a =
    Dict.empty

type alias Modification =
    { objectName : String
    , objectNumber : Maybe String
    , attributeName : String
    }

type alias ConflictsForPath = 
    Dict (String, Maybe String, String) (List (Int, Modification))
    
type alias AllModificationsForPath = List (Int, Modification )
  
getConflicts : AllModificationsForPath -> ConflictsForPath
getConflicts all =
    all |> groupBy (Tuple.second >> objectAttributeKey)

objectAttributeKey : Modification -> (String, Maybe String, String)
objectAttributeKey m = 
    (m.objectName, m.objectNumber, m.attributeName)
```

[Ellie](https://ellie-app.com/3vzvkQzScdZa1)

```
The 1st argument to `groupBy` is not what I expect:

24|     all |> groupBy (Tuple.second >> objectAttributeKey)
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
This argument is:

    ( a, Modification ) -> ( String, Maybe String, String )

But `groupBy` needs the 1st argument to be:

    ( a, Modification ) -> ( String, Maybe String, String )
```

As you can see it says the argument is one thing, but is the same thing it suggests it to be.

The issue seems to be that Maybe isn't comparable, which causes the error. If the Maybe value is removed from the tuple the code compiles.
