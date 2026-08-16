---
issue_number: 225
title: "Case statement with wrong indents could give better hints"
state: CLOSED
author: "dmag"
created_at: "2017-07-10T00:18:27Z"
url: "https://github.com/elm/error-message-catalog/issues/225"
labels: ['parser']
---

# Issue #225: Case statement with wrong indents could give better hints

**State:** `CLOSED` | **Author:** @dmag | **Source:** [https://github.com/elm/error-message-catalog/issues/225](https://github.com/elm/error-message-catalog/issues/225)

## Description

I had a working program (elm 0.18.0), and tried to add a simple NoOp branch to my update function. I was doing a copy-paste, which accidentally added an extra space.
```
update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
  case msg of
    Name name ->
      ( { model | name = name }, Cmd.none )
     NoOp ->
      ( model, Cmd.none )
```

The compiler gave me this error, which was quite confusing.
```
-- SYNTAX PROBLEM --------------------------------------------- ./src/Update.elm

Arrows are reserved for cases and anonymous functions. Maybe you want > or >=
instead?

30|      NoOp ->
              ^
Maybe <http://elm-lang.org/docs/syntax> can help you figure it out.

Detected errors in 1 module.                                        
```
It would have helped if the compiler saw the arrow and gave a hint: "if was supposed to be part of your existing case statement, it's not indented properly."  For completeness, if you have too little indent, you get this error, which could use a similar heuristic to give the same hint.
```
-- SYNTAX PROBLEM --------------------------------------------- ./src/Update.elm

I ran into something unexpected when parsing your code!

30|   NoOp ->
      ^
I am looking for one of the following things:

    end of input
    whitespace
```

