---
title: "The Elm Architecture Guide"
category: "cat:tea"
source_url: "https://guide.elm-lang.org/architecture/"
ingested_at: "2026-08-16"
key_concepts: "`Model`, `Msg`, `update`, `view`, `Cmd Msg`, `Sub Msg`"
---

# The Elm Architecture Guide

**Source URL:** [https://guide.elm-lang.org/architecture/](https://guide.elm-lang.org/architecture/)  
**Category:** `cat:tea` | **Ingested:** `2026-08-16`  
**Key Concepts:** `Model`, `Msg`, `update`, `view`, `Cmd Msg`, `Sub Msg`

---

#  __[The Elm Architecture](..)

# The Elm Architecture

The Elm Architecture is a pattern for architecting interactive programs, like webapps and games.

This architecture seems to emerge naturally in Elm. Rather than someone inventing it, early Elm programmers kept discovering the same basic patterns in their code. It was kind of spooky to see people ending up with well-architected code without planning ahead!

So The Elm Architecture is easy in Elm, but it is useful in any front-end project. In fact, projects like Redux have been inspired by The Elm Architecture, so you may have already seen derivatives of this pattern. Point is, even if you ultimately cannot use Elm at work yet, you will get a lot out of using Elm and internalizing this pattern.

## The Basic Pattern

Elm programs always look something like this:

![Diagram of The Elm Architecture](buttons.svg)

The Elm program produces HTML to show on screen, and then the computer sends back messages of what is going on. "They clicked a button!"

What happens within the Elm program though? It always breaks into three parts:

  * **Model** — the state of your application
  * **View** — a way to turn your state into HTML
  * **Update** — a way to update your state based on messages



These three concepts are the core of **The Elm Architecture**.

The next few examples are going to show how to use this pattern for user input, like buttons and text fields. It will make this much more concrete!

## Follow Along

The examples are all available in the online editor:

[![online editor](try.png)](https://elm-lang.org/try)

This editor shows hints in the top left corner:

Be sure to try out the hints if you run into something confusing!

#  results matching ""




# No results matching ""

[ __](/core_language) [ __](/architecture/buttons)

