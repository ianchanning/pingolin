---
issue_number: 119
title: "Suggest missing function arguments"
state: OPEN
author: "kittykatattack"
created_at: "2016-05-17T12:56:35Z"
url: "https://github.com/elm/error-message-catalog/issues/119"
labels: ['naming']
---

# Issue #119: Suggest missing function arguments

**State:** `OPEN` | **Author:** @kittykatattack | **Source:** [https://github.com/elm/error-message-catalog/issues/119](https://github.com/elm/error-message-catalog/issues/119)

## Description

Consider the following:
Here's function that displays a paragraph based on some parameters:

```
paragraphView paragraphId =
  let

    answeredQuestions =
      List.filter (\question -> not (String.isEmpty question.answer)) model.questions

    sentencesBelongingToParagraph paragraphId =
       List.filter (\question -> question.paragraphId == paragraphId ) answeredQuestions
  in
  p [] (List.map sentenceView (sentencesBelongingToParagraph paragraphId))
```

However, it requires access to `model`, which is not accessible in its current scope. If a user tries to call this function, the following error message is generated:

```
Cannot find variable `model`

261|       List.filter (\question -> not (String.isEmpty question.answer)) model.questions
                                                                           ^^^^^
Maybe you want one of the following?

    Model
    code
    del
    node
```

The actual problem isn't detected. Maybe we need to add something like this:

```
"Or, perhaps you need to include `model` as an argument to `paragraphView`?
```

