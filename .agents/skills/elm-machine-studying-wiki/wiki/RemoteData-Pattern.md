# The RemoteData Pattern

## 1. The Sovereign Law
Model all asynchronous data lifecycles as a four-state disjoint union (`NotAsked | Loading | Failure error | Success data`) rather than pairing data payloads with independent boolean flags or ambiguous `Maybe` types.

## 2. The Trigger & Context
In JavaScript, React, and naive Elm code, developers model asynchronous remote data by combining flags with default fallback values:
```elm
type alias BrokenAsyncModel =
    { isLoading : Bool
    , error : Maybe String
    , items : List Item -- Initialized to []
    }
```

This triggers the classic **Asynchronous UI Antipattern** (identified by Kris Jenkins):
- **The "Empty List" Flash:** When the view renders before the HTTP response resolves, `model.items` is `[]`. If the developer checks `List.isEmpty model.items` before checking `model.isLoading`, the UI displays *"No items found"* for 300ms before replacing it with actual results.
- **The "Zero Count" Flash:** Numeric counts initialize to `0`, displaying *"0 Likes, 0 Comments"* while network requests are in flight.
- **The Ambiguity of `Maybe (Result error data)`:** Using `Maybe` handles `Nothing` vs `Just`, but cannot distinguish between `NotAsked` (initial idle state before user action) and `Loading` (in-flight network request).

---

## 3. Developer Intent vs. Elm Semantics

| Dimension | JavaScript / React / Redux Model | Elm 0.19.1 RemoteData Pattern |
| :--- | :--- | :--- |
| **State Representation** | Multiple properties: `{ isFetching: true, isError: false, data: null }`. | Single algebraic sum type: `type RemoteData e a = NotAsked \| Loading \| Failure e \| Success a`. |
| **Data Accessibility** | `data` field is permanently present in memory, requiring defensive null checks (`data?.map(...)`). | Data payload only exists inside the `Success a` constructor. Accessing data in `Loading` or `Failure` states is a compile-time impossibility. |
| **Transformations** | Null checks sprinkled across computed properties and utility formatters. | Functor map: `RemoteData.map f remoteData` transforms inner data only when `Success`, preserving `Loading` or `Failure` states automatically. |
| **UI Exhaustiveness** | Optional ternary statements where developers frequently forget to handle loading or error branches. | Exhaustive `case ... of` pattern matching; missing a loading or failure branch halts compilation. |

---

## 4. The Pattern

### ❌ THE WRONG WAY: Boolean Flags with Default Values (Anti-Pattern)

```elm
module AntiPattern.AsyncFeed exposing (..)

import Html exposing (Html, div, p, text)

-- ANTI-PATTERN: Allows isLoading=True with items populated or error present
type alias Model =
    { isLoading : Bool
    , errorMessage : Maybe String
    , posts : List String
    }

init : Model
init =
    { isLoading = True
    , errorMessage = Nothing
    , posts = [] -- Dangerous default: triggers "No posts" flash!
    }

viewBad : Model -> Html msg
viewBad model =
    -- BUG: If developer checks list emptyness first, UI flashes wrong text
    if List.isEmpty model.posts then
        div [] [ text "No posts available." ]

    else if model.isLoading then
        div [] [ text "Loading posts..." ]

    else
        div [] (List.map (\post -> p [] [ text post ]) model.posts)
```

---

### ✅ THE RIGHT WAY: The Sovereign `RemoteData` Pattern

#### 1. Core Definition & Functor Utilities (`RemoteData.elm`)

```elm
module RemoteData exposing
    ( RemoteData(..)
    , andMap
    , fromResult
    , isSuccess
    , map
    , map2
    , withDefault
    )

type RemoteData error value
    = NotAsked
    | Loading
    | Failure error
    | Success value

map : (a -> b) -> RemoteData e a -> RemoteData e b
map fn data =
    case data of
        Success val ->
            Success (fn val)

        NotAsked ->
            NotAsked

        Loading ->
            Loading

        Failure err ->
            Failure err

map2 : (a -> b -> c) -> RemoteData e a -> RemoteData e b -> RemoteData e c
map2 fn dataA dataB =
    case ( dataA, dataB ) of
        ( Success a, Success b ) ->
            Success (fn a b)

        ( Failure e, _ ) ->
            Failure e

        ( _, Failure e ) ->
            Failure e

        ( Loading, _ ) ->
            Loading

        ( _, Loading ) ->
            Loading

        ( NotAsked, _ ) ->
            NotAsked

        ( _, NotAsked ) ->
            NotAsked

andMap : RemoteData e a -> RemoteData e (a -> b) -> RemoteData e b
andMap =
    map2 (|>)

fromResult : Result e a -> RemoteData e a
fromResult result =
    case result of
        Ok val ->
            Success val

        Err err ->
            Failure err

withDefault : a -> RemoteData e a -> a
withDefault default data =
    case data of
        Success val ->
            val

        _ ->
            default

isSuccess : RemoteData e a -> Bool
isSuccess data =
    case data of
        Success _ ->
            True

        _ ->
            False
```

#### 2. Clean UI Integration Without UI Flickering (`Feed.elm`)

```elm
module Feed exposing (Model, Msg(..), init, update, view)

import Html exposing (Html, button, div, li, p, text, ul)
import Html.Events exposing (onClick)
import Http
import RemoteData exposing (RemoteData(..))

type alias Post =
    { id : Int
    , title : String
    }

type alias Model =
    { posts : RemoteData Http.Error (List Post)
    }

init : Model
init =
    { posts = NotAsked }

type Msg
    = FetchPostsRequested
    | PostsReceived (Result Http.Error (List Post))

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        FetchPostsRequested ->
            ( { model | posts = Loading }
            , Cmd.none -- fetch HTTP command
            )

        PostsReceived result ->
            ( { model | posts = RemoteData.fromResult result }
            , Cmd.none
            )

-- Clean, exhaustive rendering: Impossible to show "No Posts" during loading!
view : Model -> Html Msg
view model =
    div []
        [ button [ onClick FetchPostsRequested ] [ text "Load Posts" ]
        , case model.posts of
            NotAsked ->
                p [] [ text "Click button to fetch your timeline." ]

            Loading ->
                p [] [ text "Fetching timeline from server..." ]

            Failure _ ->
                p [] [ text "Failed to load posts. Please retry." ]

            Success [] ->
                p [] [ text "Your timeline is empty. Follow users to see posts!" ]

            Success posts ->
                ul []
                    (List.map (\post -> li [] [ text post.title ]) posts)
        ]
```
