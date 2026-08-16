---
issue_number: 284
title: "Error points to the wrong function (when missing type annotations)"
state: OPEN
author: "drathier"
created_at: "2018-11-22T13:16:02Z"
url: "https://github.com/elm/error-message-catalog/issues/284"
labels: ['types']
---

# Issue #284: Error points to the wrong function (when missing type annotations)

**State:** `OPEN` | **Author:** @drathier | **Source:** [https://github.com/elm/error-message-catalog/issues/284](https://github.com/elm/error-message-catalog/issues/284)

## Description


Actual error: developer swapped first two arguments of List.member:
```
List.filter (\article -> List.member model.selectedTag article.tags) model.allArticles
List.filter (\article -> List.member article.tags model.selectedTag) model.allArticles
```

Which caused the type inference algorithm to think that it was fine, and it inferred type mismatches elsewhere in the program.

They got a bad error message for this, which points to a line that isn't even in the same function as where the accidentally swapped arguments are:
```
~/drathier/elm-0.19-workshop/intro/part3$ elm make src/Main.elm --output elm.js
Detected errors in 1 module.                                         
-- TYPE MISMATCH -------------------------------------------------- src/Main.elm

The 1st argument to `viewTags` is not what I expect:

95|                         , viewTags model
                                       ^^^^^
This `model` value is a:

    { c
        | allArticles :
              List { b | description : String, tags : a, title : String }
        , selectedTag : List a
        , tags : List String
    }

But `viewTags` needs the 1st argument to be:

    { c
        | allArticles :
              List { b | description : String, tags : a, title : String }
        , selectedTag : String
        , tags : List String
    }
```

If I add the type annotation for `view`, I get a more reasonable error:
```
~/drathier/elm-0.19-workshop/intro/part3$ elm make src/Main.elm --output elm.js
Detected errors in 1 module.                                         
-- TYPE MISMATCH -------------------------------------------------- src/Main.elm

The 2nd argument to `member` is not what I expect:

81|             List.filter (\article -> List.member article.tags model.selectedTag)
                                                                  ^^^^^^^^^^^^^^^^^
The value at .selectedTag is a:

    String

But `member` needs the 2nd argument to be:

    List a

Hint: I always figure out the argument types from left to right. If an argument
is acceptable, I assume it is “correct” and move on. So the problem may actually
be in one of the previous arguments!

Hint: Did you forget to add [] around it?
~/drathier/elm-0.19-workshop/intro/part3$ 
```


Code: 
([Ellie](https://ellie-app.com/3XxZ3tVXG95a1))
```
module Main exposing (main)

import Browser
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)



-- import Article


articleTags =
    [ "elm"
    , "fun"
    , "programming"
    , "dragons"
    ]


type alias Article =
    { body : String
    , description : String
    , slug : String
    , tags : List String
    , title : String
    }


articleFeed =
    [ { title = "Elm is fun!", description = "Elm", body = "I've really been enjoying it!", tags = [ "elm", "fun" ], slug = "elm-is-fun--zb6nba" }
    , { title = "Who says undefined isn't a function anyway?", description = "Functions", body = "Quite frankly I think undefined can be anything it wants to be,if it believes in itself.", slug = "who-says-undefined-isnt-a-function-anyway-t39ope", tags = [ "programming" ] }
    , { title = "This compiler is pretty neat", description = "Elm", body = "It tells me about problems in my code. How neat is that?", tags = [ "compilers", "elm" ], slug = "this-compiler-is-pretty-neat-9ycui8" }
    , { title = "Are dragons real?", description = "dragons", body = "Do Komodo Dragons count? I think they should. It's right there in the name!", tags = [ "dragons" ], slug = "are-dragons-real-467lsh" }
    ]



-- end of Article module
-- MODEL


initialModel =
    { tags = articleTags
    , selectedTag = "elm"
    , allArticles = articleFeed
    }


type alias Model =
    { allArticles :
        List Article
    , selectedTag : String
    , tags : List String
    }



-- UPDATE


update msg model =
    if msg.description == "ClickedTag" then
        { model | selectedTag = msg.data }

    else
        model

type alias Msg = {description : String, data : String}

-- VIEW


--view : Model -> Html Msg
view model =
    let
        articles =
            -- NOTE: accidentally swapped order of two arguments
            -- List.filter (\article -> List.member model.selectedTag article.tags)
            List.filter (\article -> List.member article.tags model.selectedTag)
                model.allArticles

        feed =
            List.map viewArticle articles
    in
    div [ class "home-page" ]
        [ viewBanner
        , div [ class "container page" ]
            [ div [ class "row" ]
                [ div [ class "col-md-9" ] feed
                , div [ class "col-md-3" ]
                    [ div [ class "sidebar" ]
                        [ p [] [ text "Popular Tags" ]
                        , viewTags model
                        ]
                    ]
                ]
            ]
        ]


viewArticle article =
    div [ class "article-preview" ]
        [ h1 [] [ text article.title ]
        , p [] [ text article.description ]
        , span [] [ text "Read more..." ]
        ]


viewBanner =
    div [ class "banner" ]
        [ div [ class "container" ]
            [ h1 [ class "logo-font" ] [ text "conduit" ]
            , p [] [ text "A place to share your knowledge." ]
            ]
        ]


viewTag selectedTagName tagName =
    let
        otherClass =
            if tagName == selectedTagName then
                "tag-selected"

            else
                "tag-default"
    in
    button
        [ class ("tag-pill " ++ otherClass)
        , onClick { description = "ClickedTag", data = tagName }
        ]
        [ text tagName ]


viewTags model =
    div [ class "tag-list" ] (List.map (viewTag model.selectedTag) model.tags)



-- MAIN


main =
    Browser.sandbox
        { init = initialModel
        , view = view
        , update = update
        }
```
