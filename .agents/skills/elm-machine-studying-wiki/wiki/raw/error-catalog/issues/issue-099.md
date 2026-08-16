---
issue_number: 99
title: "case producing different types of values when accessing a field that does not exist"
state: OPEN
author: "Kauko"
created_at: "2016-03-17T18:09:30Z"
url: "https://github.com/elm/error-message-catalog/issues/99"
labels: ['types', 'no sscce']
---

# Issue #99: case producing different types of values when accessing a field that does not exist

**State:** `OPEN` | **Author:** @Kauko | **Source:** [https://github.com/elm/error-message-catalog/issues/99](https://github.com/elm/error-message-catalog/issues/99)

## Description

```
-- Main.elm

type alias Model =
  { teamListModel : TeamList.Model
  , matchListModel : MatchList.Model
  }

initialModel: {matchListModel: MatchList.Model, teamListModel: TeamList.Model}
initialModel =
  {
  matchListModel = MatchList.initialModel
  ,teamListModel = TeamList.initialModel
  }

type Action
  = MatchUpdate MatchList.Action
  | TeamUpdate TeamList.Action

update: Action -> Model -> Model
update action model =
  case action of
    MatchUpdate a ->
      {model | matchListModel = MatchList.update a model.matchListModel.model}
    TeamUpdate a ->
      {model | teamListModel = TeamList.update a model.teamListModel.model}
```

```
-- TeamList.elm

type alias Model =
  { teams : List ( ID, Team.Model )
  , nextID : ID
  }
```

MatchList.elm has a similarly typed Model.

This is the error message that I got from Main.update:

<img width="544" alt="screen shot 2016-03-17 at 19 46 35" src="https://cloud.githubusercontent.com/assets/804522/13855955/7f3a464c-ec7b-11e5-9454-ee47b5c9820a.png">

The error in code was obviously that I the model I wanted to pass on was just model.teamListModel; the ".model" had to be dropped from the end. I'm not sure what the compiler should've told me, but I was told on Slack to report this here. :)

