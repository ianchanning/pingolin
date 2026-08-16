port module Main exposing (main)

import AppState exposing (Model)
import Archive
import Auth
import BookmarkForm
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


type alias Flags =
    { query : Maybe String
    , isHydrated : Bool
    , version : String
    }


type Msg
    = GotAuthMsg Auth.Msg
    | GotArchiveMsg Archive.Msg
    | GotFormMsg BookmarkForm.Msg
    | StartSync
    | FromWorker Decode.Value
    | SetOnline Bool
    | ManualRefresh
    | Tick Time.Posix
    | FlushNext
    | RenameTagRequest Decode.Value
    | RenamePushNextMsg
    | QueryAll
    | QuerySearch String
    | SendWorkerValue Encode.Value


init : Flags -> ( Model, Cmd Msg )
init flags =
    let
        initialQuery =
            Maybe.withDefault "" flags.query
    in
    ( { auth = Auth.init ( "", "https://pinboard-proxy.ian-pinboard-proxy.workers.dev/", not flags.isHydrated )
      , archive = Archive.init initialQuery
      , form = BookmarkForm.init
      , status = "Awakening Ritual..."
      , progress = 0.0
      , isOnline = True
      , isHydrated = flags.isHydrated
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


updateWith : (subModel -> Model -> Model) -> (subMsg -> Msg) -> Model -> ( subModel, Cmd subMsg ) -> ( Model, Cmd Msg )
updateWith updater toMsg model ( subModel, subCmd ) =
    ( updater subModel model
    , Cmd.map toMsg subCmd
    )


mapSyncMsg : Types.Msg -> Msg
mapSyncMsg msg =
    case msg of
        Types.StartSync ->
            StartSync

        Types.FromWorker val ->
            FromWorker val

        Types.SetOnline online ->
            SetOnline online

        Types.ManualRefresh ->
            ManualRefresh

        Types.Tick time ->
            Tick time

        Types.FlushNext ->
            FlushNext

        Types.RenameTagRequest val ->
            RenameTagRequest val

        Types.RenamePushNextMsg ->
            RenamePushNextMsg

        Types.QueryAll ->
            QueryAll

        Types.QuerySearch term ->
            QuerySearch term

        Types.SendWorkerValue val ->
            SendWorkerValue val


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GotAuthMsg authMsg ->
            case authMsg of
                Auth.TriggerStartSync ->
                    let
                        payload =
                            Encode.object
                                [ ( "type", Encode.string "START_HYDRATION" )
                                , ( "payload"
                                  , Encode.object
                                        [ ( "proxyUrl", Encode.string model.auth.proxyUrl )
                                        , ( "authToken", Encode.string model.auth.token )
                                        ]
                                  )
                                , ( "id", Encode.string "initial-sync" )
                                ]
                    in
                    let
                        ( nextAuth, cmd ) =
                            Auth.update authMsg model.auth
                    in
                    ( { model | auth = nextAuth, status = "Summoning Archive...", progress = 0.1 }
                    , Cmd.batch [ Cmd.map GotAuthMsg cmd, toWorker payload ]
                    )

                _ ->
                    Auth.update authMsg model.auth
                        |> updateWith (\a m -> { m | auth = a }) GotAuthMsg model

        GotArchiveMsg archiveMsg ->
            case archiveMsg of
                Archive.SetQuery query ->
                    let
                        ( nextArchive, cmd ) =
                            Archive.update archiveMsg model.archive
                    in
                    ( { model | archive = nextArchive }
                    , Cmd.batch
                        [ Cmd.map GotArchiveMsg cmd
                        , toWorker <|
                            Encode.object
                                [ ( "type", Encode.string "QUERY_SEARCH" )
                                , ( "payload", Encode.string query )
                                , ( "id", Encode.string "search" )
                                ]
                        , updateUrl query
                        ]
                    )

                _ ->
                    Archive.update archiveMsg model.archive
                        |> updateWith (\a m -> { m | archive = a }) GotArchiveMsg model

        GotFormMsg formMsg ->
            case formMsg of
                BookmarkForm.TriggerSubmit ->
                    let
                        payload =
                            Encode.object
                                [ ( "type", Encode.string "LOCAL_UPSERT" )
                                , ( "payload"
                                  , Encode.object
                                        [ ( "href", Encode.string model.form.newBookmark.href )
                                        , ( "description", Encode.string model.form.newBookmark.description )
                                        , ( "extended", Encode.string "" )
                                        , ( "tags", Encode.string model.form.newBookmark.tags )
                                        , ( "time", Encode.string "2023-10-01T12:00:00Z" )
                                        ]
                                  )
                                , ( "id", Encode.string "local-add" )
                                ]
                    in
                    let
                        ( nextForm, cmd ) =
                            BookmarkForm.update formMsg model.form
                    in
                    ( { model | form = { nextForm | showAddForm = False, newBookmark = BookmarkForm.init.newBookmark } }
                    , Cmd.batch [ Cmd.map GotFormMsg cmd, toWorker payload ]
                    )

                _ ->
                    BookmarkForm.update formMsg model.form
                        |> updateWith (\f m -> { m | form = f }) GotFormMsg model

        StartSync ->
            ( model, Cmd.none )

        FromWorker val ->
            case Decode.decodeValue workerMessageDecoder val of
                Ok workerMsg ->
                    let
                        env =
                            { token = model.auth.token
                            , proxyUrl = model.auth.proxyUrl
                            , query = model.archive.query
                            , bookmarks = model.archive.bookmarks
                            , tagSuggestions = model.form.tagSuggestions
                            , isHydrated = model.isHydrated
                            , status = model.status
                            , progress = model.progress
                            , lastSyncTime = model.lastSyncTime
                            , targetSyncTime = model.targetSyncTime
                            , syncPhase = model.syncPhase
                            , inFlightRpcs = model.inFlightRpcs
                            , pendingFlush = model.pendingFlush
                            , serverDates = model.serverDates
                            , pendingDateReconciles = model.pendingDateReconciles
                            , dayServerHrefs = model.dayServerHrefs
                            , renameOldTag = model.renameOldTag
                            , renameNewTag = model.renameNewTag
                            , renameQueue = model.renameQueue
                            }
                    in
                    let
                        ( nextEnv, cmd ) =
                            Sync.handleWorkerMsg workerMsg env

                        nextAuth =
                            { token = nextEnv.token
                            , proxyUrl = nextEnv.proxyUrl
                            , showLoginForm =
                                if nextEnv.token == "" then
                                    model.auth.showLoginForm

                                else
                                    False
                            }

                        nextArchive =
                            { query = nextEnv.query
                            , bookmarks = nextEnv.bookmarks
                            , scrollTop = model.archive.scrollTop
                            , viewportHeight = model.archive.viewportHeight
                            }

                        nextForm =
                            { newBookmark = model.form.newBookmark
                            , showAddForm = model.form.showAddForm
                            , tagSuggestions = nextEnv.tagSuggestions
                            }
                    in
                    ( { model
                        | auth = nextAuth
                        , archive = nextArchive
                        , form = nextForm
                        , status = nextEnv.status
                        , progress = nextEnv.progress
                        , isHydrated = nextEnv.isHydrated
                        , syncPhase = nextEnv.syncPhase
                        , lastSyncTime = nextEnv.lastSyncTime
                        , pendingFlush = nextEnv.pendingFlush
                        , serverDates = nextEnv.serverDates
                        , pendingDateReconciles = nextEnv.pendingDateReconciles
                        , dayServerHrefs = nextEnv.dayServerHrefs
                        , renameOldTag = nextEnv.renameOldTag
                        , renameNewTag = nextEnv.renameNewTag
                        , renameQueue = nextEnv.renameQueue
                        , targetSyncTime = nextEnv.targetSyncTime
                        , inFlightRpcs = nextEnv.inFlightRpcs
                      }
                    , Cmd.map mapSyncMsg cmd
                    )

                Err err ->
                    ( { model | status = "Ritual Failure: " ++ Decode.errorToString err }, Cmd.none )

        SetOnline online ->
            ( { model | isOnline = online }, Cmd.none )

        ManualRefresh ->
            if model.auth.token == "" || model.auth.proxyUrl == "" || Sync.isSyncing model.syncPhase then
                ( { model | status = "Refreshing..." }, Task.perform (\_ -> QueryAll) (Process.sleep 0) )

            else
                let
                    ( m1, fetchEnv ) =
                        Rpc.rpcFetch "hb-update"
                            "/posts/update"
                            [ ( "auth_token", model.auth.token ), ( "format", "json" ) ]
                            model.auth.proxyUrl
                            model.inFlightRpcs

                    ( m2, pendingEnv ) =
                        Rpc.rpcSqlQuery "hb-pending"
                            "SELECT href, description, extended, tags, time, sync_status FROM bookmarks WHERE sync_status IN ('PENDING_INSERT', 'PENDING_UPDATE', 'PENDING_DELETE') ORDER BY local_last_modified ASC"
                            []
                            m1
                in
                ( { model | inFlightRpcs = m2, syncPhase = SyncCheckingUpdate, status = "Checking for updates..." }
                , Cmd.batch [ toWorker fetchEnv, toWorker pendingEnv ]
                )

        Tick _ ->
            if Sync.isSyncing model.syncPhase || model.auth.token == "" || model.auth.proxyUrl == "" || not model.isHydrated then
                ( model, Cmd.none )

            else
                let
                    ( m1, fetchEnv ) =
                        Rpc.rpcFetch "hb-update"
                            "/posts/update"
                            [ ( "auth_token", model.auth.token ), ( "format", "json" ) ]
                            model.auth.proxyUrl
                            model.inFlightRpcs

                    ( m2, pendingEnv ) =
                        Rpc.rpcSqlQuery "hb-pending"
                            "SELECT href, description, extended, tags, time, sync_status FROM bookmarks WHERE sync_status IN ('PENDING_INSERT', 'PENDING_UPDATE', 'PENDING_DELETE') ORDER BY local_last_modified ASC"
                            []
                            m1
                in
                ( { model | inFlightRpcs = m2, syncPhase = SyncCheckingUpdate, status = "Checking for updates..." }
                , Cmd.batch [ toWorker fetchEnv, toWorker pendingEnv ]
                )

        FlushNext ->
            let
                env =
                    { token = model.auth.token
                    , proxyUrl = model.auth.proxyUrl
                    , query = model.archive.query
                    , bookmarks = model.archive.bookmarks
                    , tagSuggestions = model.form.tagSuggestions
                    , isHydrated = model.isHydrated
                    , status = model.status
                    , progress = model.progress
                    , lastSyncTime = model.lastSyncTime
                    , targetSyncTime = model.targetSyncTime
                    , syncPhase = model.syncPhase
                    , inFlightRpcs = model.inFlightRpcs
                    , pendingFlush = model.pendingFlush
                    , serverDates = model.serverDates
                    , pendingDateReconciles = model.pendingDateReconciles
                    , dayServerHrefs = model.dayServerHrefs
                    , renameOldTag = model.renameOldTag
                    , renameNewTag = model.renameNewTag
                    , renameQueue = model.renameQueue
                    }
            in
            let
                ( nextEnv, cmd ) =
                    Sync.flushNext env
            in
            let
                nextAuth =
                    { token = nextEnv.token
                    , proxyUrl = nextEnv.proxyUrl
                    , showLoginForm =
                        if nextEnv.token == "" then
                            model.auth.showLoginForm

                        else
                            False
                    }

                nextArchive =
                    { query = nextEnv.query
                    , bookmarks = nextEnv.bookmarks
                    , scrollTop = model.archive.scrollTop
                    , viewportHeight = model.archive.viewportHeight
                    }

                nextForm =
                    { newBookmark = model.form.newBookmark
                    , showAddForm = model.form.showAddForm
                    , tagSuggestions = nextEnv.tagSuggestions
                    }
            in
            ( { model
                | auth = nextAuth
                , archive = nextArchive
                , form = nextForm
                , status = nextEnv.status
                , syncPhase = nextEnv.syncPhase
                , pendingFlush = nextEnv.pendingFlush
                , inFlightRpcs = nextEnv.inFlightRpcs
              }
            , Cmd.map mapSyncMsg cmd
            )

        RenameTagRequest value ->
            case Decode.decodeValue renamePayloadDecoder value of
                Ok payload ->
                    let
                        ( m1, env ) =
                            Rpc.rpcSqlQuery "rename-query"
                                "SELECT href, description, extended, tags, time, sync_status FROM bookmarks WHERE (' ' || tags || ' ') LIKE ?"
                                [ Encode.string ("% " ++ payload.oldTag ++ " %") ]
                                model.inFlightRpcs
                    in
                    ( { model
                        | inFlightRpcs = m1
                        , renameOldTag = payload.oldTag
                        , renameNewTag = payload.newTag
                        , syncPhase = SyncRenameQuerying payload.oldTag payload.newTag
                        , status = "Renaming tag: querying DB"
                      }
                    , toWorker env
                    )

                Err _ ->
                    ( model, Cmd.none )

        RenamePushNextMsg ->
            let
                env =
                    { token = model.auth.token
                    , proxyUrl = model.auth.proxyUrl
                    , query = model.archive.query
                    , bookmarks = model.archive.bookmarks
                    , tagSuggestions = model.form.tagSuggestions
                    , isHydrated = model.isHydrated
                    , status = model.status
                    , progress = model.progress
                    , lastSyncTime = model.lastSyncTime
                    , targetSyncTime = model.targetSyncTime
                    , syncPhase = model.syncPhase
                    , inFlightRpcs = model.inFlightRpcs
                    , pendingFlush = model.pendingFlush
                    , serverDates = model.serverDates
                    , pendingDateReconciles = model.pendingDateReconciles
                    , dayServerHrefs = model.dayServerHrefs
                    , renameOldTag = model.renameOldTag
                    , renameNewTag = model.renameNewTag
                    , renameQueue = model.renameQueue
                    }
            in
            let
                ( nextEnv, cmd ) =
                    Sync.renamePushNext env
            in
            let
                nextAuth =
                    { token = nextEnv.token
                    , proxyUrl = nextEnv.proxyUrl
                    , showLoginForm =
                        if nextEnv.token == "" then
                            model.auth.showLoginForm

                        else
                            False
                    }

                nextArchive =
                    { query = nextEnv.query
                    , bookmarks = nextEnv.bookmarks
                    , scrollTop = model.archive.scrollTop
                    , viewportHeight = model.archive.viewportHeight
                    }

                nextForm =
                    { newBookmark = model.form.newBookmark
                    , showAddForm = model.form.showAddForm
                    , tagSuggestions = nextEnv.tagSuggestions
                    }
            in
            ( { model
                | auth = nextAuth
                , archive = nextArchive
                , form = nextForm
                , status = nextEnv.status
                , syncPhase = nextEnv.syncPhase
                , renameQueue = nextEnv.renameQueue
                , inFlightRpcs = nextEnv.inFlightRpcs
              }
            , Cmd.map mapSyncMsg cmd
            )

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


view : Model -> Html Msg
view model =
    viewLayout model
        [ if model.auth.showLoginForm || model.auth.token == "" then
            viewAuth model

          else
            text ""
        , viewStatus model
        , viewSearch model
        , if model.form.showAddForm then
            viewAddForm model

          else
            text ""
        , viewVirtualList model
        ]


viewLayout : Model -> List (Html Msg) -> Html Msg
viewLayout model children =
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
                , button [ onClick (GotAuthMsg Auth.ToggleLoginForm), attribute "id" "help-toggle-btn", class "help-btn", attribute "title" "Toggle Login Form" ] [ text "?" ]
                ]
            , img [ src "/pangolin_trans.png", attribute "id" "masthead-logo" ] []
            , h1 [] [ text "pingolin" ]
            ]
        , div [ attribute "id" "contain" ] children
        ]


viewAuth : Model -> Html Msg
viewAuth model =
    Auth.view model.auth GotAuthMsg model.version


viewStatus : Model -> Html Msg
viewStatus model =
    div [ class "status-chamber" ]
        [ div [ attribute "data-testid" "sync-status", class "status-text" ]
            [ text model.status ]
        , if model.progress > 0 && model.progress < 1.0 then
            div [ class "progress-bar", attribute "data-testid" "sync-progress" ]
                [ div [ class "progress-fill", style "width" (String.fromFloat (model.progress * 100) ++ "%") ] [] ]

          else
            text ""
        ]


viewSearch : Model -> Html Msg
viewSearch model =
    div [ class "search-chamber" ]
        [ input [ placeholder "Search (exact: #tag, fuzzy: term)", value model.archive.query, onInput (GotArchiveMsg << Archive.SetQuery), attribute "data-testid" "search-input" ] []
        , button [ attribute "id" "toggle-add-btn", onClick (GotFormMsg BookmarkForm.ToggleAddForm) ] [ text "+" ]
        , button [ onClick ManualRefresh, class "refresh-btn", attribute "title" "Force Sync" ] [ text "↻" ]
        ]


viewAddForm : Model -> Html Msg
viewAddForm model =
    BookmarkForm.view model.form GotFormMsg model.form.tagSuggestions


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
            List.length model.archive.bookmarks

        containerHeight =
            totalCount * rowHeight

        startIndex =
            max 0 ((model.archive.scrollTop // rowHeight) - bufferItems)

        endIndex =
            min (totalCount - 1) ((model.archive.scrollTop + model.archive.viewportHeight) // rowHeight + bufferItems)

        visibleBookmarks =
            model.archive.bookmarks
                |> List.drop startIndex
                |> List.take (endIndex - startIndex + 1)
                |> List.indexedMap (\i b -> ( startIndex + i, b ))
    in
    div [ class "archive-scroll-container" ]
        [ div [ class "archive-height-spacer", style "height" (String.fromInt containerHeight ++ "px") ]
            (List.map (viewIndexedBookmark (\msg -> GotArchiveMsg msg)) visibleBookmarks)
        ]


viewIndexedBookmark : (Archive.Msg -> msg) -> ( Int, Bookmark ) -> Html msg
viewIndexedBookmark toMsg ( index, b ) =
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
            (Html.label [] [ text "Tags: " ] :: List.intersperse (text ", ") (List.map (viewTag toMsg) b.tags))
        ]


viewTag : (Archive.Msg -> msg) -> String -> Html msg
viewTag toMsg tag =
    a
        [ href ("?q=#" ++ tag)
        , preventDefaultOn "click" (Decode.succeed ( toMsg (Archive.SetQuery ("#" ++ tag)), True ))
        ]
        [ text tag ]



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ fromWorker FromWorker
        , networkStatus SetOnline
        , tagSuggestions (GotFormMsg << BookmarkForm.SetTagSuggestions)
        , viewportSize (GotArchiveMsg << Archive.OnResize)
        , scrollPosition (GotArchiveMsg << Archive.OnScroll)
        , renameTagPort RenameTagRequest
        , if model.auth.token /= "" && model.isHydrated then
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
