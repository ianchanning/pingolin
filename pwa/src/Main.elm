port module Main exposing (main)

import Browser
import Html exposing (Html, div, text, button, input, h1)
import Html.Attributes exposing (placeholder, value, type_, class, style)
import Html.Events exposing (onClick, onInput)
import Json.Encode as Encode
import Json.Decode as Decode exposing (Decoder)

-- PORTS

port toWorker : Encode.Value -> Cmd msg
port fromWorker : (Decode.Value -> msg) -> Sub msg

-- DOMAIN MODEL (Steel & Stone Edition)

type SyncStatus
    = Synchronized
    | PendingInsert
    | PendingUpdate
    | PendingDelete

type alias Bookmark =
    { href : String
    , description : String
    , extended : String
    , tags : List String
    , time : String
    , syncStatus : SyncStatus
    }

type alias Model =
    { token : String
    , proxyUrl : String
    , query : String
    , status : String
    , bookmarks : List Bookmark
    , progress : Float
    }

init : () -> ( Model, Cmd Msg )
init _ =
    ( { token = ""
      , proxyUrl = "https://YOUR_PROXY_URL_HERE"
      , query = ""
      , status = "Awaiting Ritual..."
      , bookmarks = []
      , progress = 0.0
      }
    , Cmd.none )

-- DECODERS (The "Dunkirk Clarity" Boundary)

decodeSyncStatus : String -> SyncStatus
decodeSyncStatus status =
    case status of
        "PENDING_INSERT" -> PendingInsert
        "PENDING_UPDATE" -> PendingUpdate
        "PENDING_DELETE" -> PendingDelete
        _ -> Synchronized

bookmarkDecoder : Decoder Bookmark
bookmarkDecoder =
    Decode.map6 Bookmark
        (Decode.field "href" Decode.string)
        (Decode.field "description" Decode.string)
        (Decode.field "extended" (Decode.oneOf [ Decode.string, Decode.succeed "" ]))
        (Decode.field "tags" Decode.string |> Decode.map (String.split " " >> List.filter (not << String.isEmpty)))
        (Decode.field "time" Decode.string)
        (Decode.field "sync_status" Decode.string |> Decode.map decodeSyncStatus)

workerMessageDecoder : Decoder WorkerMsg
workerMessageDecoder =
    Decode.field "type" Decode.string
        |> Decode.andThen
            (\typeName ->
                case typeName of
                    "SYNC_PROGRESS" ->
                        Decode.map2 ProgressMsg
                            (Decode.at [ "payload", "status" ] Decode.string)
                            (Decode.at [ "payload", "progress" ] (Decode.oneOf [ Decode.float, Decode.succeed 0.0 ]))

                    "SYNC_COMPLETE" ->
                        Decode.succeed SyncCompleteMsg

                    "QUERY_RESULTS" ->
                        Decode.map QueryResultsMsg
                            (Decode.field "payload" (Decode.list bookmarkDecoder))

                    "ERROR" ->
                        Decode.map ErrorMsg (Decode.field "payload" Decode.string)

                    _ ->
                        Decode.succeed UnknownMsg
            )

type WorkerMsg
    = ProgressMsg String Float
    | SyncCompleteMsg
    | QueryResultsMsg (List Bookmark)
    | ErrorMsg String
    | UnknownMsg

-- UPDATE (Pure Logic / Side-Effect Management)

type Msg
    = SetToken String
    | SetProxy String
    | SetQuery String
    | StartSync
    | FromWorker Decode.Value

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        SetToken token ->
            ( { model | token = token }, Cmd.none )

        SetProxy proxy ->
            ( { model | proxyUrl = proxy }, Cmd.none )

        SetQuery query ->
            ( { model | query = query }, querySearch query )

        StartSync ->
            let
                payload =
                    Encode.object
                        [ ( "type", Encode.string "START_HYDRATION" )
                        , ( "payload"
                          , Encode.object
                                [ ( "proxyUrl", Encode.string model.proxyUrl )
                                , ( "authToken", Encode.string model.token )
                                ]
                          )
                        , ( "id", Encode.string "initial-sync" )
                        ]
            in
            ( { model | status = "Summoning Archive...", progress = 0.1 }, toWorker payload )

        FromWorker val ->
            case Decode.decodeValue workerMessageDecoder val of
                Ok workerMsg ->
                    handleWorkerMsg workerMsg model

                Err err ->
                    ( { model | status = "Ritual Failure: " ++ Decode.errorToString err }, Cmd.none )

queryAll : Cmd msg
queryAll =
    toWorker <|
        Encode.object
            [ ( "type", Encode.string "QUERY_ALL" )
            , ( "id", Encode.string "load-all" )
            ]

querySearch : String -> Cmd msg
querySearch term =
    toWorker <|
        Encode.object
            [ ( "type", Encode.string "QUERY_SEARCH" )
            , ( "payload", Encode.string term )
            , ( "id", Encode.string "search" )
            ]

handleWorkerMsg : WorkerMsg -> Model -> ( Model, Cmd Msg )
handleWorkerMsg msg model =
    case msg of
        ProgressMsg status progress ->
            ( { model | status = status, progress = progress }, Cmd.none )

        SyncCompleteMsg ->
            ( { model | status = "Archive Restored. Finalizing...", progress = 1.0 }, queryAll )

        QueryResultsMsg bookmarks ->
            ( { model | bookmarks = bookmarks, status = "Archive Online. " ++ String.fromInt (List.length bookmarks) ++ " records loaded." }, Cmd.none )

        ErrorMsg err ->
            ( { model | status = "Worker Chaos: " ++ err }, Cmd.none )

        UnknownMsg ->
            ( model, Cmd.none )

-- VIEW (Brutally Simple)

view : Model -> Html Msg
view model =
    div [ class "pingolin-fortress" ]
        [ h1 [] [ text "PINGOLIN" ]
        , div [ class "ritual-controls" ]
            [ input [ placeholder "Auth Token (user:HEX)", value model.token, onInput SetToken ] []
            , input [ placeholder "Proxy URL", value model.proxyUrl, onInput SetProxy ] []
            , button [ onClick StartSync ] [ text "Initialize Sync" ]
            ]
        , div [ class "search-chamber" ]
            [ input [ placeholder "Search (exact: #tag, fuzzy: term)", value model.query, onInput SetQuery ] [] ]
        , div [ class "status-chamber" ]
            [ div [] [ text ("STATE: " ++ model.status) ]
            , if model.progress > 0 && model.progress < 1.0 then
                div [ class "progress-bar" ] 
                    [ div [ class "progress-fill", style "width" (String.fromFloat (model.progress * 100) ++ "%") ] [] ]
              else
                text ""
            ]
        , div [ class "archive-list" ]
            (List.map viewBookmark model.bookmarks)
        ]

viewBookmark : Bookmark -> Html Msg
viewBookmark b =
    div [ class "bookmark-shrine" ]
        [ div [ class "href" ] [ text b.href ]
        , div [ class "desc" ] [ text b.description ]
        , div [ class "tags" ] [ text (String.join " · " b.tags) ]
        ]

-- SUBSCRIPTIONS

subscriptions : Model -> Sub Msg
subscriptions _ =
    fromWorker FromWorker

main : Program () Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }
