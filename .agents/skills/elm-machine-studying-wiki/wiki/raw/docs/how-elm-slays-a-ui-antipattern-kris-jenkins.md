---
title: "How Elm Slays a UI Antipattern (Kris Jenkins)"
category: "cat:types"
source_url: "http://blog.jenkster.com/2016/06/how-elm-slays-a-ui-antipattern.html"
ingested_at: "2026-08-16"
key_concepts: "`RemoteData` pattern (`NotAsked \| Loading \| Failure \| Success`), clean asynchronous UI state"
---

# How Elm Slays a UI Antipattern (Kris Jenkins)

**Source URL:** [http://blog.jenkster.com/2016/06/how-elm-slays-a-ui-antipattern.html](http://blog.jenkster.com/2016/06/how-elm-slays-a-ui-antipattern.html)  
**Category:** `cat:types` | **Ingested:** `2026-08-16`  
**Key Concepts:** `RemoteData` pattern (`NotAsked \| Loading \| Failure \| Success`), clean asynchronous UI state

---

## The Problem

There’s a bug in several places in the OSX Twitter client, and in at least one place in the Slack client, and in _loads_ of other apps. Here’s Twitter:

![Twitter says no](/files/twitter_zero.png)

That’s not the correct data. When I go to this tweet, it shows “0 Retweets 0 Likes” for a few moments, until the real data loads in.

Now here’s Slack:

![Slack says no](/files/slack_zero.png)

Again, it’s not correct. when I go to the view it says, “no messages,” as a placeholder until the actual data loads in. A few moments later I get a big long list.

It’s one of those UX patterns that crops up everywhere once you start noticing it: showing zero or empty when you should be showing a loading message. It’s incredibly common.

Now I don’t have access to their source code, of course, but I’m willing to bet that in most cases, it boils down to this broken data model:

javascriptCopy
    
    
    var data = {
      loading: true,
      things: [],
    };

Store a loading flag and an empty list/count of things you’re loading. Then in the UI, you’re supposed to check the loading flag before you display the things.

Inevitably someone forgets, and so on a slow connection the UI immediately displays the, “No Things Found,” message until the response comes back.

We’ve all done it. Especially when deadlines are tight and people start planning whole sprints around, “the happy path.” But it’s poor UX, and it’s a shame to spoil a quality experience on such a small detail.

Now, how can we fix this? Discipline? Linters? More unit tests? A QA army? No! Let’s fix the data model, because fixing the data model is fastest, cheapest, most reliable fix there is.

## To Elm!

Let’s move over to Elm, because we’ll need a language with explicit data models if we’re going to talk about this properly. So here’s an absolutely basic version of this data model, and it’s a wrong ‘un:

elmCopy
    
    
    type alias Model =
        { things : List Thing
        }

If you think about it, this broken from the outset. It’s saying that you will always have a list of things available, which isn’t true when we startup. And that causes the display bug.

## The Solution

A much better model would be:

elmCopy
    
    
    type alias Model =
        { things : Maybe (List Thing)
        }

Now we can represent, “we haven’t loaded things yet,” naturally. On startup the list of things is `Nothing`. When the load completes it becomes `Just [thing1, thing2, ...]`.

If the server replies that there genuinely were no things, then that’s `Just []`. Now the empty list actually means the empty list, it’s no longer doing double-duty as the “not loaded” case.

You can do this in JavaScript of course, but you won’t. Long experience will have taught you that setting a property to `null` may be correct, but it’s just asking for runtime exceptions. Hence the separate loading flag, which gets forgotten.

In Elm, you can not only handle the nothing case safely, but the compiler will actively nag you to remember to write the “Loading” message:

elmCopy
    
    
    module View exposing (..)
    
    ...
    
    someView model =
      case model.things of
        Just things -> ...

…and when we compile:

shCopy
    
    
    -- MISSING PATTERNS ---------------------------------------------- src/View.elm
    
    This `case` does not have branches for all possibilities.
    
    ...
    
    You need to account for the following values:
    
        Maybe.Nothing
    
    Add a branch to cover this pattern!

We get an error message about missing out the loading case, _exactly_ where the solution needs to go.

On the surface it seems like we’ve made a simple data-model change, but by reshaping the data it becomes _much_ easier to ensure an improved user experience. Win.

## The Leveling-Up

I like this, but I reckon we can be much more sophisticated. And Elm will still make it easy when we do. In my mental model, REST requests have one of four states:

  * We haven’t asked yet.
  * We’ve asked, but we haven’t got a response yet.
  * We got a response, but it was an error.
  * We got a response, and it was the data we wanted.



In a language with nice data-modelling facilities, we can easily create something that represents these four states:

elmCopy
    
    
    type RemoteData e a
        = NotAsked
        | Loading
        | Failure e
        | Success a

This is like a `Result` or `Either` type, where we can have parameters for the `Failure` and `Success` types, plus tracking for the `NotAsked` and `Loading` states.

Now in our data model, we can properly represent the list of things as something we fetch from an external source:

elmCopy
    
    
      type alias Model =
          { things : RemoteData Http.Error (List Thing)
          }

Let’s make a quick refinement to that - most of our external requests are REST requests, so the error type is nearly always an `Http.Error`. A quick alias tidies that up:

elmCopy
    
    
      type alias WebData a =
          RemoteData Http.Error a
    
    
      type alias Model =
          { things : WebData (List Thing)
          }

The nice thing about this data model in Elm is, the compiler will now force you to write the correct UI code. It will keep track of the possibility of “things not loaded” and errors, and _force_ you to handle them all in the UI.

Personally, I love it. A bit of thought about the data model, a couple of utterly-reusable definitions, and for the rest of the project the compiler will be at our backs, pushing us towards better UX. Happier users at bargain prices.

## The Download

If you want to play with this, I’ve published it as a standalone package which you can add to your project with:

shCopy
    
    
    $ elm package install krisajenkins/remotedata

[Here are the docs](http://package.elm-lang.org/packages/krisajenkins/remotedata/latest), and happy modelling!

