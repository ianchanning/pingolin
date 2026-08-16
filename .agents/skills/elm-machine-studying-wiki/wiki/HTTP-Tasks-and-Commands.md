# HTTP Tasks & Commands in Practice

## 1. The Sovereign Law
All HTTP operations in Elm 0.19.1 (`elm/http`) are declarative effect requests decoupled into pure expectations (`expectJson`, `expectString`, `expectWhatever`, `expectBytes`) that exhaustively categorize network, status, and decoding failures through the 5-variant `Http.Error` sum type, or compose into sequential pipelines via `Http.task` and `Task.andThen`.

## 2. The Trigger & Context
Developers frequently struggle with Elm 0.19's redesigned `elm/http` API when arriving from JavaScript (Fetch / Axios) or legacy Elm 0.18:
- **Legacy 0.18 Hallucinations:** Attempting to call `Http.send Msg request` or `Http.getString` (which were completely removed in Elm 0.19).
- **Incomplete `Http.Error` Handling:** Treating `Http.Error` as a simple string error, missing the crucial distinction between a `NetworkError` (offline/CORS), a `BadStatus 404` (server reached but resource missing), and a `BadBody` (HTTP succeeded with 200 OK, but JSON decoder rejected the payload).
- **Sequential Request Deadlock:** Attempting to fire HTTP request #2 from inside `update` after request #1 returns, when the two requests could be composed into an atomic sequential unit via `Http.task` and `Task.andThen`.

---

## 3. Developer Intent vs. Elm Semantics

| Dimension | JavaScript (Fetch / Axios) | Elm 0.19.1 `elm/http` |
| :--- | :--- | :--- |
| **Execution Model** | `const res = await fetch(url)` executes immediately. | `Http.get { ... }` produces an inert `Cmd Msg`. The runtime handles execution and dispatches the result to `update`. |
| **Response Parsing** | Manual `.json()` promise parsing with `try/catch`. | Declarative expectation: `expect = Http.expectJson GotResult decoder`. Response parsing and error mapping occur automatically. |
| **Error Granularity** | Generic `Error` object requiring manual inspect of `status` / `statusText`. | Strongly typed `Http.Error`: `BadUrl String \| Timeout \| NetworkError \| BadStatus Int \| BadBody String`. |
| **Chaining Requests** | `fetch(url1).then(r => fetch(url2))`. | `Http.task req1 |> Task.andThen (\res1 -> Http.task (req2 res1)) |> Task.attempt GotFinalResult`. |

---

## 4. The Pattern

### ❌ THE WRONG WAY: Legacy 0.18 Syntax & Generic Error Handling

```elm
module AntiPattern.Http exposing (..)

-- ANTI-PATTERN: Elm 0.18 syntax (Will NOT compile in Elm 0.19+)
-- import Http exposing (getString, send) -- REMOVED in 0.19

-- BAD: Discarding the exact Http.Error variant
formatErrorBad : String
formatErrorBad =
    "An error occurred" -- User cannot tell if offline, 401 Unauthorized, or bad JSON
```

---

### ✅ THE RIGHT WAY: Modern Elm 0.19.1 Commands, Error Recovery & Task Chaining

#### 1. Standard CRUD Operations & Exhaustive Error Formatting (`Api.elm`)

```elm
module Api exposing
    ( Bookmark
    , Msg(..)
    , createBookmark
    , errorToString
    , fetchBookmarks
    )

import Http
import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode

type alias Bookmark =
    { id : Int
    , url : String
    , title : String
    }

type Msg
    = BookmarksReceived (Result Http.Error (List Bookmark))
    | BookmarkCreated (Result Http.Error Bookmark)

-- GET Request with expectJson
fetchBookmarks : Cmd Msg
fetchBookmarks =
    Http.get
        { url = "https://api.pinboard.in/v1/posts/recent"
        , expect = Http.expectJson BookmarksReceived (Decode.list bookmarkDecoder)
        }

-- POST Request with JSON Body
createBookmark : String -> String -> Cmd Msg
createBookmark url title =
    Http.post
        { url = "https://api.pinboard.in/v1/posts/add"
        , body =
            Http.jsonBody <|
                Encode.object
                    [ ( "url", Encode.string url )
                    , ( "title", Encode.string title )
                    ]
        , expect = Http.expectJson BookmarkCreated bookmarkDecoder
        }

bookmarkDecoder : Decoder Bookmark
bookmarkDecoder =
    Decode.map3 Bookmark
        (Decode.field "id" Decode.int)
        (Decode.field "url" Decode.string)
        (Decode.field "title" Decode.string)

-- Exhaustive, user-friendly error diagnostics
errorToString : Http.Error -> String
errorToString error =
    case error of
        Http.BadUrl url ->
            "Invalid URL: " ++ url

        Http.Timeout ->
            "Request timed out. Please check your internet connection."

        Http.NetworkError ->
            "Network error: Unable to reach server (possible CORS or offline issue)."

        Http.BadStatus 401 ->
            "Session expired. Please log in again."

        Http.BadStatus 404 ->
            "Resource not found (404)."

        Http.BadStatus code ->
            "Server returned status code: " ++ String.fromInt code

        Http.BadBody reason ->
            "Server returned invalid data: " ++ reason
```

#### 2. Sequential Request Chaining with `Http.task` (`AuthFlow.elm`)

When authentication requires authenticating, fetching user profile, and loading initial bookmarks in one atomic command:

```elm
module AuthFlow exposing (authenticateAndLoad)

import Api exposing (Bookmark)
import Http
import Json.Decode as Decode
import Task exposing (Task)

type alias AuthPayload =
    { token : String
    , userId : Int
    }

authenticateAndLoad : String -> String -> (Result Http.Error ( AuthPayload, List Bookmark ) -> msg) -> Cmd msg
authenticateAndLoad username password toMsg =
    loginTask username password
        |> Task.andThen
            (\auth ->
                fetchBookmarksTask auth.token
                    |> Task.map (\bookmarks -> ( auth, bookmarks ))
            )
        |> Task.attempt toMsg

loginTask : String -> String -> Task Http.Error AuthPayload
loginTask user pass =
    Http.task
        { method = "POST"
        , headers = []
        , url = "/api/login"
        , body = Http.jsonBody (Decode.encode 0 (Encode.object [ ( "u", Encode.string user ), ( "p", Encode.string pass ) ]))
        , resolver = Http.stringResolver (resolveJson authDecoder)
        , timeout = Just 10000
        }

fetchBookmarksTask : String -> Task Http.Error (List Bookmark)
fetchBookmarksTask token =
    Http.task
        { method = "GET"
        , headers = [ Http.header "Authorization" ("Bearer " ++ token) ]
        , url = "/api/bookmarks"
        , body = Http.emptyBody
        , resolver = Http.stringResolver (resolveJson (Decode.list Api.bookmarkDecoder))
        , timeout = Just 10000
        }

resolveJson : Decode.Decoder a -> Http.Response String -> Result Http.Error a
resolveJson decoder response =
    case response of
        Http.GoodStatus_ _ body ->
            case Decode.decodeString decoder body of
                Ok value ->
                    Ok value

                Err err ->
                    Err (Http.BadBody (Decode.errorToString err))

        Http.BadStatus_ metadata _ ->
            Err (Http.BadStatus metadata.statusCode)

        Http.BadUrl_ url ->
            Err (Http.BadUrl url)

        Http.Timeout_ ->
            Err Http.Timeout

        Http.NetworkError_ ->
            Err Http.NetworkError

authDecoder : Decode.Decoder AuthPayload
authDecoder =
    Decode.map2 AuthPayload
        (Decode.field "token" Decode.string)
        (Decode.field "user_id" Decode.int)
```
