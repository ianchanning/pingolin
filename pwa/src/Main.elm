port module Main exposing (main)

import Browser
import Html exposing (Html, div, text, button, input, h1, img, h3, a)
import Html.Attributes exposing (placeholder, value, type_, class, style, attribute, src, href, target)
import Html.Events exposing (onClick, onInput, preventDefaultOn)
import Json.Encode as Encode
import Json.Decode as Decode exposing (Decoder)

-- PORTS

port toWorker : Encode.Value -> Cmd msg
port fromWorker : (Decode.Value -> msg) -> Sub msg
port updateUrl : String -> Cmd msg
port networkStatus : (Bool -> msg) -> Sub msg
port tagSuggestions : (List String -> msg) -> Sub msg
port viewportSize : (Int -> msg) -> Sub msg
port scrollPosition : (Int -> msg) -> Sub msg

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
    , isOnline : Bool
    , isHydrated : Bool
    , showAddForm : Bool
    , tagSuggestions : List String
    , scrollTop : Int
    , viewportHeight : Int
    , newBookmark :
        { href : String
        , description : String
        , tags : String
        }
    }

type alias Flags =
    { query : Maybe String
    }

init : Flags -> ( Model, Cmd Msg )
init flags =
    let
        initialQuery =
            Maybe.withDefault "" flags.query
    in
    ( { token = ""
      , proxyUrl = "https://pinboard-proxy.ian-pinboard-proxy.workers.dev/"
      , query = initialQuery
      , status = "Awaiting Ritual..."
      , bookmarks = []
      , progress = 0.0
      , isOnline = True
      , isHydrated = False
      , showAddForm = False
      , tagSuggestions = []
      , scrollTop = 0
      , viewportHeight = 800
      , newBookmark = { href = "", description = "", tags = "" }
      }
    , if initialQuery /= "" then
        querySearch initialQuery
      else
        queryAll
    )

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
    Decode.map2 (\typeName id -> { typeName = typeName, id = id })
        (Decode.field "type" Decode.string)
        (Decode.field "id" (Decode.oneOf [ Decode.string, Decode.succeed "" ]))
        |> Decode.andThen
            (\{ typeName, id } ->
                case typeName of
                    "SYNC_PROGRESS" ->
                        Decode.map2 ProgressMsg
                            (Decode.at [ "payload", "status" ] Decode.string)
                            (Decode.at [ "payload", "progress" ] (Decode.oneOf [ Decode.float, Decode.succeed 0.0 ]))

                    "SYNC_COMPLETE" ->
                        Decode.succeed SyncCompleteMsg

                    "QUERY_RESULTS" ->
                        case id of
                            "popular-tags" ->
                                Decode.map TagSuggestionsMsg (Decode.field "payload" (Decode.list Decode.string))
                            
                            _ ->
                                Decode.map QueryResultsMsg (Decode.field "payload" (Decode.list bookmarkDecoder))

                    "ERROR" ->
                        Decode.map ErrorMsg (Decode.field "payload" Decode.string)

                    "REFRESH_REQUIRED" ->
                        Decode.succeed RefreshRequiredMsg

                    "SESSION_RESTORED" ->
                        Decode.succeed SessionRestoredMsg

                    _ ->
                        Decode.succeed UnknownMsg
            )

type WorkerMsg
    = ProgressMsg String Float
    | SyncCompleteMsg
    | QueryResultsMsg (List Bookmark)
    | TagSuggestionsMsg (List String)
    | ErrorMsg String
    | RefreshRequiredMsg
    | SessionRestoredMsg
    | UnknownMsg

-- UPDATE (Pure Logic / Side-Effect Management)

type Msg
    = SetToken String
    | SetProxy String
    | SetQuery String
    | StartSync
    | FromWorker Decode.Value
    | ToggleAddForm
    | SetNewHref String
    | SetNewDescription String
    | SetNewTags String
    | SubmitAdd
    | SetOnline Bool
    | SetTagSuggestions (List String)
    | OnScroll Int
    | OnResize Int

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        SetToken token ->
            ( { model | token = token }, Cmd.none )

        SetProxy proxy ->
            ( { model | proxyUrl = proxy }, Cmd.none )

        SetQuery query ->
            ( { model | query = query }, Cmd.batch [ querySearch query, updateUrl query ] )

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

        ToggleAddForm ->
            ( { model | showAddForm = not model.showAddForm }, Cmd.none )

        SetNewHref href ->
            let
                nb = model.newBookmark
            in
            ( { model | newBookmark = { nb | href = href } }, Cmd.none )

        SetNewDescription desc ->
            let
                nb = model.newBookmark
            in
            ( { model | newBookmark = { nb | description = desc } }, Cmd.none )

        SetNewTags tags ->
            let
                nb = model.newBookmark
            in
            ( { model | newBookmark = { nb | tags = tags } }, Cmd.none )

        SubmitAdd ->
            let
                payload =
                    Encode.object
                        [ ( "type", Encode.string "LOCAL_UPSERT" )
                        , ( "payload"
                          , Encode.object
                                [ ( "href", Encode.string model.newBookmark.href )
                                , ( "description", Encode.string model.newBookmark.description )
                                , ( "extended", Encode.string "" )
                                , ( "tags", Encode.string model.newBookmark.tags )
                                , ( "time", Encode.string "2023-10-01T12:00:00Z" )
                                ]
                          )
                        , ( "id", Encode.string "local-add" )
                        ]
            in
            ( { model | showAddForm = False, newBookmark = { href = "", description = "", tags = "" } }
            , toWorker payload )

        SetOnline online ->
            ( { model | isOnline = online }, Cmd.none )

        SetTagSuggestions suggestions ->
            ( { model | tagSuggestions = suggestions }, Cmd.none )

        OnScroll top ->
            ( { model | scrollTop = top }, Cmd.none )

        OnResize height ->
            ( { model | viewportHeight = height }, Cmd.none )

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
            ( { model | status = "Archive Restored. Finalizing...", progress = 1.0, isHydrated = True }, queryAll )

        QueryResultsMsg bookmarks ->
            let
                hydrated =
                    model.isHydrated || not (List.isEmpty bookmarks)
            in
            ( { model | bookmarks = bookmarks, status = String.fromInt (List.length bookmarks), isHydrated = hydrated, scrollTop = 0 }, Cmd.none )

        TagSuggestionsMsg suggestions ->
            ( { model | tagSuggestions = suggestions }, Cmd.none )

        ErrorMsg err ->
            ( { model | status = "Worker Chaos: " ++ err }, Cmd.none )

        RefreshRequiredMsg ->
            if model.query == "" then
                ( model, queryAll )
            else
                ( model, querySearch model.query )

        SessionRestoredMsg ->
            ( { model | isHydrated = True, status = "Session Restored." }, queryAll )

        UnknownMsg ->
            ( model, Cmd.none )

-- VIEW (Brutally Simple)

view : Model -> Html Msg
view model =
    div [ class "pingolin-fortress" ]
        [ div [ attribute "id" "masthead" ]
            [ div [ class "top-bar" ] 
                [ text (if model.isOnline then "ONLINE" else "OFFLINE") ]
            , img [ src "/pangolin_trans.png", attribute "id" "masthead-logo" ] []
            , h1 [] [ text "pingolin" ]
            ]
        , div [ attribute "id" "contain" ]
            [ if not model.isHydrated then
                div [ class "ritual-controls", attribute "data-testid" "login-container" ]
                    [ input [ placeholder "Auth Token (user:HEX)", value model.token, onInput SetToken, attribute "data-testid" "auth-token" ] []
                    , input [ placeholder "Proxy URL", value model.proxyUrl, onInput SetProxy ] []
                    , button [ onClick StartSync, attribute "data-testid" "sync-button" ] [ text "Initialize Sync" ]
                    ]
              else
                text ""
            , div [ class "status-chamber" ]
                [ div [ attribute "data-testid" "sync-status" ] 
                    [ text (model.status) ]
                , if model.progress > 0 && model.progress < 1.0 then
                    div [ class "progress-bar", attribute "data-testid" "sync-progress" ] 
                        [ div [ class "progress-fill", style "width" (String.fromFloat (model.progress * 100) ++ "%") ] [] ]
                  else
                    text ""
                ]
            , div [ class "search-chamber" ]
                [ input [ placeholder "Search (exact: #tag, fuzzy: term)", value model.query, onInput SetQuery, attribute "data-testid" "search-input" ] []
                , button [ attribute "id" "toggle-add-btn", onClick ToggleAddForm ] [ text "+" ]
                ]
            , if model.showAddForm then
                div [ class "add-form", attribute "data-testid" "add-form" ]
                    [ input [ placeholder "URL", value model.newBookmark.href, onInput SetNewHref, attribute "data-testid" "new-url" ] []
                    , input [ placeholder "Title", value model.newBookmark.description, onInput SetNewDescription, attribute "data-testid" "new-title" ] []
                    , input [ placeholder "Tags", value model.newBookmark.tags, onInput SetNewTags, attribute "data-testid" "new-tags", attribute "list" "tag-suggestions" ] []
                    , Html.datalist [ attribute "id" "tag-suggestions" ]
                        (List.map (\tag -> Html.option [ value tag ] []) model.tagSuggestions)
                    , button [ onClick SubmitAdd, attribute "data-testid" "add-button" ] [ text "Add Bookmark" ]
                    ]
              else
                text ""
            , viewVirtualList model
            ]
        ]

rowHeight : Int
rowHeight = 120

bufferItems : Int
bufferItems = 5 -- Reduced for sharper updates

viewVirtualList : Model -> Html Msg
viewVirtualList model =
    let
        totalCount = List.length model.bookmarks
        containerHeight = totalCount * rowHeight
        
        startIndex = max 0 ((model.scrollTop // rowHeight) - bufferItems)
        endIndex = min (totalCount - 1) ((model.scrollTop + model.viewportHeight) // rowHeight + bufferItems)
        
        visibleBookmarks = 
            model.bookmarks
                |> List.drop startIndex
                |> List.take (endIndex - startIndex + 1)
                |> List.indexedMap (\i b -> (startIndex + i, b))
    in
    div [ class "archive-scroll-container" ]
        [ div [ class "archive-height-spacer", style "height" (String.fromInt containerHeight ++ "px") ]
            (List.map viewIndexedBookmark visibleBookmarks)
        ]

viewIndexedBookmark : (Int, Bookmark) -> Html Msg
viewIndexedBookmark (index, b) =
    div 
        [ class "bookmark-shrine"
        , attribute "data-testid" "bookmark-item"
        , style "transform" ("translateY(" ++ String.fromInt (index * rowHeight) ++ "px)")
        ]
        [ if b.syncStatus /= Synchronized then
            div [ class "pending-icon", attribute "data-testid" "pending-icon" ] [ text "🔄" ]
          else
            text ""
        , h3 [] [ a [ href b.href, target "_blank" ] [ text b.description ] ]
        , div [ class "tags" ] 
            (Html.label [] [ text "Tags: " ] :: List.intersperse (text ", ") (List.map viewTag b.tags))
        ]

viewTag : String -> Html Msg
viewTag tag =
    a 
        [ href ("?q=#" ++ tag)
        , preventDefaultOn "click" (Decode.succeed ( SetQuery ("#" ++ tag), True ))
        ] 
        [ text tag ]

-- SUBSCRIPTIONS

subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ fromWorker FromWorker
        , networkStatus SetOnline
        , tagSuggestions SetTagSuggestions
        , viewportSize OnResize
        , scrollPosition OnScroll
        ]

main : Program Flags Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }
