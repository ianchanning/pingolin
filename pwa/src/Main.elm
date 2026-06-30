port module Main exposing (main)

import Browser
import Dict exposing (Dict)
import Html exposing (Html, a, button, div, h1, h3, img, input, span, text)
import Html.Attributes exposing (attribute, class, href, placeholder, src, style, target, type_, value)
import Html.Events exposing (onClick, onInput, preventDefaultOn)
import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode
import Process
import Rpc exposing (..)
import Sync exposing (..)
import Task
import Time
import Types exposing (..)



-- PORTS


port toWorker : Encode.Value -> Cmd msg


port fromWorker : (Decode.Value -> msg) -> Sub msg


port updateUrl : String -> Cmd msg


port networkStatus : (Bool -> msg) -> Sub msg


port tagSuggestions : (List String -> msg) -> Sub msg


port viewportSize : (Int -> msg) -> Sub msg


port scrollPosition : (Int -> msg) -> Sub msg


port renameTagPort : (Decode.Value -> msg) -> Sub msg



-- DOMAIN MODEL (Sovereign Edition)


type alias Flags =
    { query : Maybe String
    , isHydrated : Bool
    , version : String
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
      , status = "Awakening Ritual..."
      , bookmarks = []
      , progress = 0.0
      , isOnline = True
      , isHydrated = flags.isHydrated
      , showAddForm = False
      , tagSuggestions = []
      , scrollTop = 0
      , viewportHeight = 800
      , newBookmark = { href = "", description = "", tags = "" }
      , showLoginForm = not flags.isHydrated
      , version = flags.version
      , inFlightRpcs = Dict.empty
      , syncPhase = SyncIdle
      , lastSyncTime = ""
      , pendingFlush = []
      , serverDates = Dict.empty
      , pendingDateReconciles = []
      , dayServerHrefs = []
      , renameOldTag = ""
      , renameNewTag = ""
      , renameQueue = []
      , targetSyncTime = ""
      }
    , if initialQuery /= "" then
        Task.perform (\_ -> QuerySearch initialQuery) (Process.sleep 0)

      else
        Task.perform (\_ -> QueryAll) (Process.sleep 0)
    )



-- DECODERS (The "Dunkirk Clarity" Boundary)
-- UPDATE (Pure Logic / Side-Effect Management)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        SetToken token ->
            ( { model | token = token }, Cmd.none )

        SetProxy proxy ->
            ( { model | proxyUrl = proxy }, Cmd.none )

        SetQuery query ->
            ( { model | query = query, scrollTop = 0 }
            , Cmd.batch
                [ toWorker <|
                    Encode.object
                        [ ( "type", Encode.string "QUERY_SEARCH" )
                        , ( "payload", Encode.string query )
                        , ( "id", Encode.string "search" )
                        ]
                , updateUrl query
                ]
            )

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
                    Sync.handleWorkerMsg workerMsg model

                Err err ->
                    ( { model | status = "Ritual Failure: " ++ Decode.errorToString err }, Cmd.none )

        ToggleAddForm ->
            ( { model | showAddForm = not model.showAddForm }, Cmd.none )

        ToggleLoginForm ->
            ( { model | showLoginForm = not model.showLoginForm }, Cmd.none )

        SetNewHref href ->
            let
                nb =
                    model.newBookmark
            in
            ( { model | newBookmark = { nb | href = href } }, Cmd.none )

        SetNewDescription desc ->
            let
                nb =
                    model.newBookmark
            in
            ( { model | newBookmark = { nb | description = desc } }, Cmd.none )

        SetNewTags tags ->
            let
                nb =
                    model.newBookmark
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
            , toWorker payload
            )

        SetOnline online ->
            ( { model | isOnline = online }, Cmd.none )

        SetTagSuggestions suggestions ->
            ( { model | tagSuggestions = suggestions }, Cmd.none )

        OnScroll top ->
            ( { model | scrollTop = top }, Cmd.none )

        OnResize height ->
            ( { model | viewportHeight = height }, Cmd.none )

        ManualRefresh ->
            -- Full heartbeat: check for server updates AND flush any pending local mutations.
            if model.token == "" || model.proxyUrl == "" || Sync.isSyncing model.syncPhase then
                ( { model | status = "Refreshing..." }, Task.perform (\_ -> QueryAll) (Process.sleep 0) )

            else
                let
                    ( m1, fetchEnv ) =
                        Rpc.rpcFetch "hb-update"
                            "/posts/update"
                            [ ( "auth_token", model.token ), ( "format", "json" ) ]
                            { model | syncPhase = SyncCheckingUpdate, status = "Checking for updates..." }

                    ( m2, pendingEnv ) =
                        Rpc.rpcSqlQuery "hb-pending"
                            "SELECT href, description, extended, tags, time, sync_status FROM bookmarks WHERE sync_status IN ('PENDING_INSERT', 'PENDING_UPDATE', 'PENDING_DELETE') ORDER BY local_last_modified ASC"
                            []
                            m1
                in
                ( m2, Cmd.batch [ toWorker fetchEnv, toWorker pendingEnv ] )

        Tick _ ->
            if Sync.isSyncing model.syncPhase || model.token == "" || model.proxyUrl == "" || not model.isHydrated then
                ( model, Cmd.none )

            else
                let
                    ( m1, fetchEnv ) =
                        Rpc.rpcFetch "hb-update"
                            "/posts/update"
                            [ ( "auth_token", model.token ), ( "format", "json" ) ]
                            { model | syncPhase = SyncCheckingUpdate, status = "Checking for updates..." }

                    ( m2, pendingEnv ) =
                        Rpc.rpcSqlQuery "hb-pending"
                            "SELECT href, description, extended, tags, time, sync_status FROM bookmarks WHERE sync_status IN ('PENDING_INSERT', 'PENDING_UPDATE', 'PENDING_DELETE') ORDER BY local_last_modified ASC"
                            []
                            m1
                in
                ( m2, Cmd.batch [ toWorker fetchEnv, toWorker pendingEnv ] )

        FlushNext ->
            Sync.flushNext model

        RenameTagRequest value ->
            case Decode.decodeValue renamePayloadDecoder value of
                Ok payload ->
                    let
                        ( m1, env ) =
                            Rpc.rpcSqlQuery "rename-query"
                                "SELECT href, description, extended, tags, time, sync_status FROM bookmarks WHERE (' ' || tags || ' ') LIKE ?"
                                [ Encode.string ("% " ++ payload.oldTag ++ " %") ]
                                { model
                                    | renameOldTag = payload.oldTag
                                    , renameNewTag = payload.newTag
                                    , syncPhase = SyncRenameQuerying payload.oldTag payload.newTag
                                    , status = "Renaming tag: querying DB"
                                }
                    in
                    ( m1, toWorker env )

                Err _ ->
                    ( model, Cmd.none )

        RenamePushNextMsg ->
            Sync.renamePushNext model

        QueryAll ->
            ( model
            , toWorker <|
                Encode.object
                    [ ( "type", Encode.string "QUERY_ALL" )
                    , ( "id", Encode.string "load-all" )
                    ]
            )

        QuerySearch term ->
            ( model
            , toWorker <|
                Encode.object
                    [ ( "type", Encode.string "QUERY_SEARCH" )
                    , ( "payload", Encode.string term )
                    , ( "id", Encode.string "search" )
                    ]
            )

        SendWorkerValue val ->
            ( model, toWorker val )



-- VIEW (Brutally Simple)


view : Model -> Html Msg
view model =
    div [ class "pingolin-fortress" ]
        [ div [ attribute "id" "masthead" ]
            [ div [ class "top-bar" ]
                [ span [ attribute "data-testid" "network-status" ]
                    [ text
                        (if model.isOnline then
                            "ONLINE"

                         else
                            "OFFLINE"
                        )
                    ]
                , button [ onClick ToggleLoginForm, class "help-btn", attribute "id" "help-toggle-btn", attribute "title" "Toggle Login Form" ] [ text "?" ]
                ]
            , img [ src "/pangolin_trans.png", attribute "id" "masthead-logo" ] []
            , h1 [] [ text "pingolin" ]
            ]
        , div [ attribute "id" "contain" ]
            [ if model.showLoginForm || model.token == "" then
                div [ class "ritual-controls", attribute "data-testid" "login-container" ]
                    [ input [ placeholder "Auth Token (user:HEX)", value model.token, onInput SetToken, attribute "data-testid" "auth-token" ] []
                    , input [ placeholder "Proxy URL", value model.proxyUrl, onInput SetProxy ] []
                    , button [ onClick StartSync, attribute "data-testid" "sync-button" ] [ text "Initialize Sync" ]
                    , div [ class "version-tag" ] [ text ("v" ++ model.version) ]
                    ]

              else
                text ""
            , div [ class "status-chamber" ]
                [ div [ attribute "data-testid" "sync-status", class "status-text" ]
                    [ text model.status ]
                , if model.progress > 0 && model.progress < 1.0 then
                    div [ class "progress-bar", attribute "data-testid" "sync-progress" ]
                        [ div [ class "progress-fill", style "width" (String.fromFloat (model.progress * 100) ++ "%") ] [] ]

                  else
                    text ""
                ]
            , div [ class "search-chamber" ]
                [ input [ placeholder "Search (exact: #tag, fuzzy: term)", value model.query, onInput SetQuery, attribute "data-testid" "search-input" ] []
                , button [ attribute "id" "toggle-add-btn", onClick ToggleAddForm ] [ text "+" ]
                , button [ onClick ManualRefresh, class "refresh-btn", attribute "title" "Force Sync" ] [ text "↻" ]
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
rowHeight =
    120


bufferItems : Int
bufferItems =
    5



-- Reduced for sharper updates


viewVirtualList : Model -> Html Msg
viewVirtualList model =
    let
        totalCount =
            List.length model.bookmarks

        containerHeight =
            totalCount * rowHeight

        startIndex =
            max 0 ((model.scrollTop // rowHeight) - bufferItems)

        endIndex =
            min (totalCount - 1) ((model.scrollTop + model.viewportHeight) // rowHeight + bufferItems)

        visibleBookmarks =
            model.bookmarks
                |> List.drop startIndex
                |> List.take (endIndex - startIndex + 1)
                |> List.indexedMap (\i b -> ( startIndex + i, b ))
    in
    div [ class "archive-scroll-container" ]
        [ div [ class "archive-height-spacer", style "height" (String.fromInt containerHeight ++ "px") ]
            (List.map viewIndexedBookmark visibleBookmarks)
        ]


viewIndexedBookmark : ( Int, Bookmark ) -> Html Msg
viewIndexedBookmark ( index, b ) =
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
subscriptions model =
    Sub.batch
        [ fromWorker FromWorker
        , networkStatus SetOnline
        , tagSuggestions SetTagSuggestions
        , viewportSize OnResize
        , scrollPosition OnScroll
        , renameTagPort RenameTagRequest
        , if model.token /= "" && model.isHydrated then
            Time.every (60 * 1000) Tick

          else
            Sub.none
        ]


main : Program Flags Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }
