---
issue_number: 276
title: "Dict.insert given type mismatch error when it should be given Arg count error."
state: OPEN
author: "sarasfox"
created_at: "2018-10-14T15:13:35Z"
url: "https://github.com/elm/error-message-catalog/issues/276"
labels: ['types']
---

# Issue #276: Dict.insert given type mismatch error when it should be given Arg count error.

**State:** `OPEN` | **Author:** @sarasfox | **Source:** [https://github.com/elm/error-message-catalog/issues/276](https://github.com/elm/error-message-catalog/issues/276)

## Description

These work.

```elm
{ model | gameData = Dict.insert model.game { game | players = List.Extra.unique (List.append game.players [ model.player ]) } model.gameData }
{ model | gameData = Dict.insert model.game { players = [ model.player ] } model.gameData }
```

But these give worry error

```elm
{ model | gameData = Dict.insert model.game { game | players = List.Extra.unique (List.append game.players [ model.player ]) } }
```

```
--ERROR

I cannot update the `gameData` field like this:

85|             { model | gameData = Dict.insert model.game { game | players = List.Extra.unique (List.append game.players [ model.player ]) } }
                                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
This `insert` call produces:

    Dict String { players : List String }
    -> Dict String { players : List String }

But it should be:

    Dict String Game

Note: The record update syntax does not allow you to change the type of fields.
You can achieve that with record constructors or the record literal syntax.
```

```elm
{ model | gameData = Dict.insert model.game { players = [ model.player ] } }
```

```
--ERROR

I cannot update the `gameData` field like this:

88|             { model | gameData = Dict.insert model.game { players = [ model.player ] } }
                                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
This `insert` call produces:

    Dict String { players : List String }
    -> Dict String { players : List String }

But it should be:

    Dict String Game

Note: The record update syntax does not allow you to change the type of fields.
You can achieve that with record constructors or the record literal syntax.
```

OH 

```elm
type alias Game =
    { players : List String }
```
