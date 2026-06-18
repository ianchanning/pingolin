port module Main exposing (main)

import Browser
import Html exposing (Html, div, text, button, input, h1, img, h3, a, span)
import Html.Attributes exposing (placeholder, value, type_, class, style, attribute, src, href, target)
import Html.Events exposing (onClick, onInput, preventDefaultOn)
import Dict exposing (Dict)
import Json.Encode as Encode
import Json.Decode as Decode exposing (Decoder)
import Task
import Time
import Process

-- PORTS

port toWorker : Encode.Value -> Cmd msg
port fromWorker : (Decode.Value -> msg) -> Sub msg
port updateUrl : String -> Cmd msg
port networkStatus : (Bool -> msg) -> Sub msg
port tagSuggestions : (List String -> msg) -> Sub msg
port viewportSize : (Int -> msg) -> Sub msg
port scrollPosition : (Int -> msg) -> Sub msg
port renameTagPort : (Decode.Value -> msg) -> Sub msg

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

-- Sync lifecycle: what is the State Machine currently doing?
type SyncPhase
    = SyncIdle
    | SyncCheckingUpdate
    | SyncFlushing { index : Int, total : Int }
    -- Phase 5.3: Dates Hack delta reconciliation states
    | SyncCheckingDates                  -- waiting for /posts/dates from server
    | SyncComparingDates                 -- waiting for local date counts
    | SyncReconcilingDay String          -- waiting for /posts/get?dt=<date>
    | SyncPruningDay String              -- waiting for local hrefs to diff against server
    -- Phase 5.4: Tag Rename states
    | SyncRenameQuerying String String          -- oldTag, newTag
    | SyncRenameProcessing { oldTag : String, newTag : String, index : Int, total : Int }
    | SyncRenameDeletingTag String

-- A bookmark row from SQLite that is awaiting upstream sync.
type alias PendingRow =
    { href : String
    , description : String
    , extended : String
    , tags : String
    , time : String
    , syncStatus : String
    }

-- RPC request lifecycle state.
-- Each in-flight request is tracked by its id in the Model.
type RpcState
    = RpcPending
    | RpcSuccess (Maybe Decode.Value)
    | RpcFailed { message : String, code : String }

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
    , showLoginForm : Bool
    , version : String
    , inFlightRpcs : Dict String RpcState
    -- Phase 5.2: Sovereign time & flush queue
    , syncPhase : SyncPhase
    , lastSyncTime : String
    , pendingFlush : List PendingRow
    -- Phase 5.3: Dates Hack delta reconciliation scratch state
    , serverDates : Dict String Int       -- date -> server count (from /posts/dates)
    , pendingDateReconciles : List String  -- mismatch dates still to process
    , dayServerHrefs : List String         -- server hrefs for the date being reconciled
    -- Phase 5.4: Tag Rename scratch state
    , renameOldTag : String
    , renameNewTag : String
    , renameQueue : List PendingRow
    }

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
        (Decode.field "tags" (Decode.oneOf [ Decode.string, Decode.succeed "" ]) |> Decode.map (String.split " " >> List.filter (not << String.isEmpty)))
        (Decode.field "time" Decode.string)
        (Decode.field "sync_status" Decode.string |> Decode.map decodeSyncStatus)

workerMessageDecoder : Decoder WorkerMsg
workerMessageDecoder =
    Decode.map2 (\typeName id -> { typeName = typeName, id = id })
        (Decode.field "type" Decode.string)
        (Decode.oneOf [ Decode.field "id" Decode.string, Decode.succeed "" ])
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
                        Decode.at [ "payload" ]
                            (Decode.map3 SessionRestoredMsg
                                (Decode.oneOf [ Decode.field "token" Decode.string, Decode.succeed "" ])
                                (Decode.oneOf [ Decode.field "proxyUrl" Decode.string, Decode.succeed "" ])
                                (Decode.oneOf [ Decode.field "lastSync" Decode.string, Decode.succeed "" ])
                            )

                    "RPC_SUCCESS" ->
                        Decode.map2 RpcSuccessMsg
                            (Decode.succeed id)
                            (Decode.maybe (Decode.field "payload" Decode.value))

                    "RPC_ERROR" ->
                        Decode.map3 RpcErrorMsg
                            (Decode.succeed id)
                            (Decode.at [ "payload", "message" ] Decode.string)
                            (Decode.at [ "payload", "code" ] (Decode.oneOf [ Decode.string, Decode.succeed "UNKNOWN" ]))

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
    | SessionRestoredMsg String String String  -- token, proxyUrl, lastSync
    | RpcSuccessMsg String (Maybe Decode.Value)  -- id, optional payload
    | RpcErrorMsg String String String            -- id, message, code
    | UnknownMsg

-- UPDATE (Pure Logic / Side-Effect Management)

type Msg
    = SetToken String
    | SetProxy String
    | SetQuery String
    | StartSync
    | FromWorker Decode.Value
    | ToggleAddForm
    | ToggleLoginForm
    | SetNewHref String
    | SetNewDescription String
    | SetNewTags String
    | SubmitAdd
    | SetOnline Bool
    | SetTagSuggestions (List String)
    | OnScroll Int
    | OnResize Int
    | ManualRefresh
    | Tick Time.Posix
    | FlushNext
    | RenameTagRequest Decode.Value
    | RenamePushNextMsg

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        SetToken token ->
            ( { model | token = token }, Cmd.none )

        SetProxy proxy ->
            ( { model | proxyUrl = proxy }, Cmd.none )

        SetQuery query ->
            ( { model | query = query, scrollTop = 0 }, Cmd.batch [ querySearch query, updateUrl query ] )

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

        ToggleLoginForm ->
            ( { model | showLoginForm = not model.showLoginForm }, Cmd.none )

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

        ManualRefresh ->
            -- Full heartbeat: check for server updates AND flush any pending local mutations.
            if model.token == "" || model.proxyUrl == "" || isSyncing model.syncPhase then
                ( { model | status = "Refreshing..." }, queryAll )
            else
                let
                    ( m1, fetchCmd ) =
                        rpcFetch "hb-update"
                            "/posts/update"
                            [ ( "auth_token", model.token ), ( "format", "json" ) ]
                            { model | syncPhase = SyncCheckingUpdate, status = "Checking for updates..." }

                    ( m2, pendingCmd ) =
                        rpcSqlQuery "hb-pending"
                            "SELECT href, description, extended, tags, time, sync_status FROM bookmarks WHERE sync_status IN ('PENDING_INSERT', 'PENDING_UPDATE', 'PENDING_DELETE') ORDER BY local_last_modified ASC"
                            []
                            m1
                in
                ( m2, Cmd.batch [ fetchCmd, pendingCmd ] )

        Tick _ ->
            if isSyncing model.syncPhase || model.token == "" || model.proxyUrl == "" || not model.isHydrated then
                ( model, Cmd.none )
            else
                let
                    ( m1, fetchCmd ) =
                        rpcFetch "hb-update"
                            "/posts/update"
                            [ ( "auth_token", model.token ), ( "format", "json" ) ]
                            { model | syncPhase = SyncCheckingUpdate, status = "Checking for updates..." }

                    ( m2, pendingCmd ) =
                        rpcSqlQuery "hb-pending"
                            "SELECT href, description, extended, tags, time, sync_status FROM bookmarks WHERE sync_status IN ('PENDING_INSERT', 'PENDING_UPDATE', 'PENDING_DELETE') ORDER BY local_last_modified ASC"
                            []
                            m1
                in
                ( m2, Cmd.batch [ fetchCmd, pendingCmd ] )

        FlushNext ->
            flushNext model

        RenameTagRequest value ->
            case Decode.decodeValue renamePayloadDecoder value of
                Ok payload ->
                    let
                        ( m1, cmd ) =
                            rpcSqlQuery "rename-query"
                                "SELECT href, description, extended, tags, time, sync_status FROM bookmarks WHERE (' ' || tags || ' ') LIKE ?"
                                [ Encode.string ("% " ++ payload.oldTag ++ " %") ]
                                { model
                                | renameOldTag = payload.oldTag
                                , renameNewTag = payload.newTag
                                , syncPhase = SyncRenameQuerying payload.oldTag payload.newTag
                                , status = "Renaming tag: querying DB"
                                }
                    in
                    ( m1, cmd )

                Err _ ->
                    ( model, Cmd.none )

        RenamePushNextMsg ->
            renamePushNext model

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
            -- Phase 5.2: Elm heartbeat (Time.every) will replace the old JS timer.
            -- For now, queryAll is sufficient; auto-sync resumes in Phase 5.2.
            ( { model | status = "Archive Restored. Finalizing...", progress = 1.0, isHydrated = True, showLoginForm = False }
            , queryAll
            )

        QueryResultsMsg bookmarks ->
            let
                hydrated =
                    model.isHydrated || not (List.isEmpty bookmarks)

                newStatus =
                    if hydrated && not (String.contains "Chaos" model.status) then
                        "Archive Online: " ++ String.fromInt (List.length bookmarks)

                    else
                        String.fromInt (List.length bookmarks)
            in
            ( { model | bookmarks = bookmarks, status = newStatus, isHydrated = hydrated }, Cmd.none )

        TagSuggestionsMsg suggestions ->
            ( { model | tagSuggestions = suggestions }, Cmd.none )

        ErrorMsg err ->
            ( { model | status = "Worker Chaos: " ++ err }, Cmd.none )

        RefreshRequiredMsg ->
            if model.query == "" then
                ( model, queryAll )

            else
                ( model, querySearch model.query )

        SessionRestoredMsg token proxyUrl lastSync ->
            let
                effectiveToken =
                    if token == "" then model.token else token

                effectiveProxy =
                    if proxyUrl == "" then model.proxyUrl else proxyUrl

                restoredModel =
                    { model
                    | isHydrated = True
                    , status = "Session Restored."
                    , token = effectiveToken
                    , proxyUrl = effectiveProxy
                    , showLoginForm = False
                    , lastSyncTime = lastSync
                    }

                queryCmd =
                    if model.query == "" then queryAll else querySearch model.query
            in
            -- Auto-trigger the heartbeat check immediately after session restore.
            -- This fixes Zombie DB detection and surfaces proxy errors on startup.
            if effectiveToken /= "" && effectiveProxy /= "" then
                let
                    ( m1, fetchCmd ) =
                        rpcFetch "hb-update"
                            "/posts/update"
                            [ ( "auth_token", effectiveToken ), ( "format", "json" ) ]
                            { restoredModel | syncPhase = SyncCheckingUpdate }

                    ( m2, pendingCmd ) =
                        rpcSqlQuery "hb-pending"
                            "SELECT href, description, extended, tags, time, sync_status FROM bookmarks WHERE sync_status IN ('PENDING_INSERT', 'PENDING_UPDATE', 'PENDING_DELETE') ORDER BY local_last_modified ASC"
                            []
                            m1
                in
                ( m2, Cmd.batch [ queryCmd, fetchCmd, pendingCmd ] )
            else
                ( restoredModel, queryCmd )

        RpcSuccessMsg rpcId payload ->
            let
                updatedModel =
                    { model | inFlightRpcs = Dict.insert rpcId (RpcSuccess payload) model.inFlightRpcs }
            in
            routeRpcSuccess rpcId payload updatedModel

        RpcErrorMsg rpcId message code ->
            let
                updatedModel =
                    { model
                    | inFlightRpcs = Dict.insert rpcId (RpcFailed { message = message, code = code }) model.inFlightRpcs
                    , syncPhase = SyncIdle
                    , status = "Error (" ++ code ++ "): " ++ message
                    }
            in
            ( updatedModel, Cmd.none )

        UnknownMsg ->
            ( model, Cmd.none )


-- startSyncLoop removed in Phase 5.0.
-- The JS heartbeat (setInterval) has been deleted from the worker.
-- Phase 5.2 introduces Elm-native Time.every + Process.sleep orchestration.

-- ── SYNC PHASE HELPERS (Phase 5.2) ────────────────────────────────────

isSyncing : SyncPhase -> Bool
isSyncing phase =
    case phase of
        SyncIdle -> False
        _ -> True

-- ── RPC ROUTING ──────────────────────────────────────────────────
-- Routes completed RPC responses to the correct business logic handler.
-- This is the Sovereign's dispatch board.

routeRpcSuccess : String -> Maybe Decode.Value -> Model -> ( Model, Cmd Msg )
routeRpcSuccess rpcId maybePayload model =
    let
        refreshCmd =
            if model.query == "" then queryAll else querySearch model.query
    in
    case rpcId of
        "hb-update"        -> handleHeartbeatUpdate maybePayload model
        "hb-pending"       -> handleHeartbeatPending maybePayload model
        "hb-flush-add"     -> handleFlushDone model
        "hb-flush-delete"  -> handleFlushDeleteDone model
        -- After marking a record synced or deleted, refresh the visible list
        "hb-mark-synced"   -> ( model, refreshCmd )
        "hb-mark-deleted"  -> ( model, refreshCmd )
        -- Phase 5.3: Dates Hack reconciliation chain
        "hb-dates-server"  -> handleDatesServerResult maybePayload model
        "hb-dates-local"   -> handleDatesLocalResult maybePayload model
        "hb-day-get"       -> handleDayGetResult maybePayload model
        "hb-day-local"     -> handleDayLocalResult maybePayload model
        "hb-day-prune"     ->
            let
                ( nextModel, nextCmd ) = reconcileNextDay model
            in
            ( nextModel, Cmd.batch [ refreshCmd, nextCmd ] )
        -- Phase 5.4: Tag Rename chain
        "rename-query"     -> handleRenameQueryResult maybePayload model
        "rename-tx"        -> renamePushNext model
        "rename-push-add"  -> handleRenamePushAddDone model
        "rename-mark-synced" -> ( model, refreshCmd )
        "rename-delete-tag"  -> handleRenameDeleteTagDone model
        _                  -> ( model, Cmd.none )

-- ── HEARTBEAT HANDLERS ───────────────────────────────────────────

handleHeartbeatUpdate : Maybe Decode.Value -> Model -> ( Model, Cmd Msg )
handleHeartbeatUpdate maybePayload model =
    let
        serverTime =
            maybePayload
                |> Maybe.andThen
                    (\v -> Decode.decodeValue (Decode.field "update_time" Decode.string) v |> Result.toMaybe)
                |> Maybe.withDefault ""

        needsSync =
            serverTime /= "" && serverTime /= model.lastSyncTime
    in
    if needsSync then
        -- Server has newer data: re-trigger the Big Pull exception
        let
            hydrateEnvelope =
                Encode.object
                    [ ( "type", Encode.string "START_HYDRATION" )
                    , ( "payload"
                      , Encode.object
                            [ ( "proxyUrl", Encode.string model.proxyUrl )
                            , ( "authToken", Encode.string model.token )
                            ]
                      )
                    , ( "id", Encode.string "hb-hydrate" )
                    ]
        in
        ( { model | syncPhase = SyncIdle, status = "Syncing...", lastSyncTime = serverTime }
        , toWorker hydrateEnvelope
        )
    else
        -- Up-to-date: run the Dates Hack to catch remote deletions.
        let
            ( m1, datesCmd ) =
                rpcFetch "hb-dates-server"
                    "/posts/dates"
                    [ ( "auth_token", model.token ), ( "format", "json" ) ]
                    { model | syncPhase = SyncCheckingDates, status = "Checking for deletions..." }
        in
        ( m1, datesCmd )

pendingRowDecoder : Decoder PendingRow
pendingRowDecoder =
    Decode.map6 PendingRow
        (Decode.field "href" Decode.string)
        (Decode.field "description" (Decode.oneOf [ Decode.string, Decode.succeed "" ]))
        (Decode.field "extended" (Decode.oneOf [ Decode.string, Decode.succeed "" ]))
        (Decode.field "tags" (Decode.oneOf [ Decode.string, Decode.succeed "" ]))
        (Decode.field "time" Decode.string)
        (Decode.field "sync_status" Decode.string)

handleHeartbeatPending : Maybe Decode.Value -> Model -> ( Model, Cmd Msg )
handleHeartbeatPending maybePayload model =
    let
        pending =
            maybePayload
                |> Maybe.andThen
                    (\v -> Decode.decodeValue (Decode.list pendingRowDecoder) v |> Result.toMaybe)
                |> Maybe.withDefault []
    in
    if List.isEmpty pending then
        ( model, Cmd.none )
    else
        flushNext
            { model
            | pendingFlush = pending
            , syncPhase = SyncFlushing { index = 0, total = List.length pending }
            }

-- ── FLUSH LOOP ───────────────────────────────────────────────────
-- Throttled upstream flush: one API call per 3 seconds via Process.sleep.

flushNext : Model -> ( Model, Cmd Msg )
flushNext model =
    case model.pendingFlush of
        [] ->
            ( { model | syncPhase = SyncIdle, pendingFlush = [], status = "Flush complete." }, Cmd.none )

        first :: _ ->
            let
                flushIndex =
                    case model.syncPhase of
                        SyncFlushing { index } -> index
                        _ -> 0

                total =
                    case model.syncPhase of
                        SyncFlushing flush -> flush.total
                        _ -> List.length model.pendingFlush

                statusText =
                    "Flushing " ++ String.fromInt (flushIndex + 1) ++ " of " ++ String.fromInt total

                ( newModel, cmd ) =
                    if first.syncStatus == "PENDING_DELETE" then
                        rpcFetch "hb-flush-delete"
                            "/posts/delete"
                            [ ( "url", first.href )
                            , ( "auth_token", model.token )
                            , ( "format", "json" )
                            ]
                            model
                    else
                        rpcFetch "hb-flush-add"
                            "/posts/add"
                            [ ( "url", first.href )
                            , ( "description", first.description )
                            , ( "extended", first.extended )
                            , ( "tags", first.tags )
                            , ( "dt", first.time )
                            , ( "auth_token", model.token )
                            , ( "format", "json" )
                            ]
                            model
            in
            ( { newModel | status = statusText }, cmd )

handleFlushDone : Model -> ( Model, Cmd Msg )
handleFlushDone model =
    case model.pendingFlush of
        [] ->
            ( { model | syncPhase = SyncIdle }, Cmd.none )

        first :: rest ->
            let
                nextPhase =
                    case model.syncPhase of
                        SyncFlushing { index, total } -> SyncFlushing { index = index + 1, total = total }
                        other -> other

                ( markedModel, markCmd ) =
                    rpcSqlExec "hb-mark-synced"
                        "UPDATE bookmarks SET sync_status = 'SYNCHRONIZED' WHERE href = ?"
                        [ Encode.string first.href ]
                        { model | pendingFlush = rest, syncPhase = nextPhase }
            in
            ( markedModel
            , Cmd.batch
                [ markCmd
                , Task.perform (\_ -> FlushNext) (Process.sleep 3000)
                ]
            )

handleFlushDeleteDone : Model -> ( Model, Cmd Msg )
handleFlushDeleteDone model =
    case model.pendingFlush of
        [] ->
            ( { model | syncPhase = SyncIdle }, Cmd.none )

        first :: rest ->
            let
                nextPhase =
                    case model.syncPhase of
                        SyncFlushing { index, total } -> SyncFlushing { index = index + 1, total = total }
                        other -> other

                ( markedModel, deleteCmd ) =
                    rpcSqlExec "hb-mark-deleted"
                        "DELETE FROM bookmarks WHERE href = ?"
                        [ Encode.string first.href ]
                        { model | pendingFlush = rest, syncPhase = nextPhase }
            in
            ( markedModel
            , Cmd.batch
                [ deleteCmd
                , Task.perform (\_ -> FlushNext) (Process.sleep 3000)
                ]
            )

-- ── PHASE 5.3: DATES HACK RECONCILIATION ─────────────────────────────────────
-- Pure functional delta-sync: detect remote deletions by comparing date counts.

serverDatesDecoder : Decoder (Dict String Int)
serverDatesDecoder =
    Decode.field "dates" (Decode.dict Decode.string)
        |> Decode.map (Dict.map (\_ v -> String.toInt v |> Maybe.withDefault 0))

localDateCountDecoder : Decoder (Dict String Int)
localDateCountDecoder =
    Decode.list
        (Decode.map2 Tuple.pair
            (Decode.field "d" Decode.string)
            (Decode.field "c" Decode.int)
        )
        |> Decode.map Dict.fromList

hrefListDecoder : Decoder (List String)
hrefListDecoder =
    Decode.list (Decode.field "href" Decode.string)

handleDatesServerResult : Maybe Decode.Value -> Model -> ( Model, Cmd Msg )
handleDatesServerResult maybePayload model =
    let
        dates =
            maybePayload
                |> Maybe.andThen (\v -> Decode.decodeValue serverDatesDecoder v |> Result.toMaybe)
                |> Maybe.withDefault Dict.empty
    in
    -- Store server dates and query local counts in parallel
    let
        ( m1, localCmd ) =
            rpcSqlQuery "hb-dates-local"
                "SELECT date(time) as d, count(*) as c FROM bookmarks WHERE sync_status = 'SYNCHRONIZED' GROUP BY d"
                []
                { model | serverDates = dates, syncPhase = SyncComparingDates }
    in
    ( m1, localCmd )

handleDatesLocalResult : Maybe Decode.Value -> Model -> ( Model, Cmd Msg )
handleDatesLocalResult maybePayload model =
    let
        localCounts =
            maybePayload
                |> Maybe.andThen (\v -> Decode.decodeValue localDateCountDecoder v |> Result.toMaybe)
                |> Maybe.withDefault Dict.empty

        -- Find dates where local count exceeds server count (deletions happened)
        mismatches =
            Dict.keys localCounts
                |> List.filter
                    (\date ->
                        let
                            localC = Dict.get date localCounts |> Maybe.withDefault 0
                            serverC = Dict.get date model.serverDates |> Maybe.withDefault 0
                        in
                        localC > serverC
                    )
    in
    if List.isEmpty mismatches then
        ( { model | syncPhase = SyncIdle, status = "Synchronized." }, Cmd.none )
    else
        let
            m1 = { model | pendingDateReconciles = mismatches }
        in
        reconcileNextDay m1 |> Tuple.mapFirst (\m -> m)

reconcileNextDay : Model -> ( Model, Cmd Msg )
reconcileNextDay model =
    case model.pendingDateReconciles of
        [] ->
            ( { model | syncPhase = SyncIdle, status = "Synchronized." }, Cmd.none )

        date :: _ ->
            let
                ( m1, cmd ) =
                    rpcFetch "hb-day-get"
                        "/posts/get"
                        [ ( "dt", date )
                        , ( "auth_token", model.token )
                        , ( "format", "json" )
                        ]
                        { model | syncPhase = SyncReconcilingDay date, status = "Reconciling " ++ date ++ "..." }
            in
            ( m1, cmd )

handleDayGetResult : Maybe Decode.Value -> Model -> ( Model, Cmd Msg )
handleDayGetResult maybePayload model =
    let
        serverHrefs =
            maybePayload
                |> Maybe.andThen (\v -> Decode.decodeValue hrefListDecoder v |> Result.toMaybe)
                |> Maybe.withDefault []

        date =
            case model.syncPhase of
                SyncReconcilingDay d -> d
                _ -> List.head model.pendingDateReconciles |> Maybe.withDefault ""
    in
    let
        ( m1, localCmd ) =
            rpcSqlQuery "hb-day-local"
                "SELECT href FROM bookmarks WHERE date(time) = ? AND sync_status = 'SYNCHRONIZED'"
                [ Encode.string date ]
                { model | dayServerHrefs = serverHrefs, syncPhase = SyncPruningDay date }
    in
    ( m1, localCmd )

handleDayLocalResult : Maybe Decode.Value -> Model -> ( Model, Cmd Msg )
handleDayLocalResult maybePayload model =
    let
        localHrefs =
            maybePayload
                |> Maybe.andThen (\v -> Decode.decodeValue hrefListDecoder v |> Result.toMaybe)
                |> Maybe.withDefault []

        ghosts =
            List.filter (\h -> not (List.member h model.dayServerHrefs)) localHrefs

        -- Always pop the current date from the queue
        remaining =
            List.drop 1 model.pendingDateReconciles
    in
    if List.isEmpty ghosts then
        -- No ghosts on this date; move to next
        reconcileNextDay { model | pendingDateReconciles = remaining }
    else
        let
            deleteStmts =
                List.map
                    (\href -> ( "DELETE FROM bookmarks WHERE href = ?", [ Encode.string href ] ))
                    ghosts

            ( m1, pruneCmd ) =
                rpcSqlTransaction "hb-day-prune" deleteStmts
                    { model | pendingDateReconciles = remaining }
        in
        ( m1, pruneCmd )

-- ── PHASE 5.4: TAG RENAME WORKAROUND ─────────────────────────────────────────

type alias RenamePayload =
    { oldTag : String
    , newTag : String
    }

renamePayloadDecoder : Decoder RenamePayload
renamePayloadDecoder =
    Decode.map2 RenamePayload
        (Decode.field "oldTag" Decode.string)
        (Decode.field "newTag" Decode.string)

replaceTag : String -> String -> String -> String
replaceTag old new tagsStr =
    tagsStr
        |> String.split " "
        |> List.filter (not << String.isEmpty)
        |> List.map (\t -> if t == old then new else t)
        |> String.join " "

handleRenameQueryResult : Maybe Decode.Value -> Model -> ( Model, Cmd Msg )
handleRenameQueryResult maybePayload model =
    let
        bookmarks =
            maybePayload
                |> Maybe.andThen (\v -> Decode.decodeValue (Decode.list pendingRowDecoder) v |> Result.toMaybe)
                |> Maybe.withDefault []

        oldTag = model.renameOldTag
        newTag = model.renameNewTag

        updatedQueue =
            List.map
                (\b -> { b | tags = replaceTag oldTag newTag b.tags, syncStatus = "PENDING_UPDATE" })
                bookmarks

        txStmts =
            List.map
                (\b ->
                    ( "UPDATE bookmarks SET tags = ?, sync_status = 'PENDING_UPDATE', local_last_modified = ? WHERE href = ?"
                    , [ Encode.string b.tags, Encode.int 1700000000000, Encode.string b.href ]
                    )
                )
                updatedQueue

        m1 =
            { model
            | renameQueue = updatedQueue
            , syncPhase = SyncRenameProcessing { oldTag = oldTag, newTag = newTag, index = 0, total = List.length updatedQueue }
            , status = "Renaming tag: updating local DB"
            }
    in
    rpcSqlTransaction "rename-tx" txStmts m1

renamePushNext : Model -> ( Model, Cmd Msg )
renamePushNext model =
    case model.renameQueue of
        [] ->
            let
                oldTag =
                    case model.syncPhase of
                        SyncRenameProcessing r -> r.oldTag
                        _ -> model.renameOldTag
            in
            if oldTag /= "" then
                rpcFetch "rename-delete-tag"
                    "/tags/delete"
                    [ ( "tag", oldTag )
                    , ( "auth_token", model.token )
                    , ( "format", "json" )
                    ]
                    { model | syncPhase = SyncRenameDeletingTag oldTag, status = "Deleting tag " ++ oldTag ++ " from server..." }
            else
                ( { model | syncPhase = SyncIdle, status = "Rename complete." }, Cmd.none )

        first :: _ ->
            let
                rState =
                    case model.syncPhase of
                        SyncRenameProcessing r -> r
                        _ -> { oldTag = model.renameOldTag, newTag = model.renameNewTag, index = 0, total = List.length model.renameQueue }

                statusText =
                    "Renaming tag: pushing bookmark " ++ String.fromInt (rState.index + 1) ++ " of " ++ String.fromInt rState.total
            in
            rpcFetch "rename-push-add"
                "/posts/add"
                [ ( "url", first.href )
                , ( "description", first.description )
                , ( "extended", first.extended )
                , ( "tags", first.tags )
                , ( "dt", first.time )
                , ( "auth_token", model.token )
                , ( "format", "json" )
                , ( "replace", "yes" )
                ]
                { model | status = statusText }

handleRenamePushAddDone : Model -> ( Model, Cmd Msg )
handleRenamePushAddDone model =
    case model.renameQueue of
        [] ->
            ( model, Cmd.none )

        first :: rest ->
            let
                rState =
                    case model.syncPhase of
                        SyncRenameProcessing r -> r
                        _ -> { oldTag = model.renameOldTag, newTag = model.renameNewTag, index = 0, total = List.length model.renameQueue }

                ( markedModel, markCmd ) =
                    rpcSqlExec "rename-mark-synced"
                        "UPDATE bookmarks SET sync_status = 'SYNCHRONIZED' WHERE href = ?"
                        [ Encode.string first.href ]
                        { model | renameQueue = rest, syncPhase = SyncRenameProcessing { rState | index = rState.index + 1 } }
            in
            ( markedModel
            , Cmd.batch
                [ markCmd
                , Task.perform (\_ -> RenamePushNextMsg) (Process.sleep 100)
                ]
            )

handleRenameDeleteTagDone : Model -> ( Model, Cmd Msg )
handleRenameDeleteTagDone model =
    let
        refreshCmd =
            if model.query == "" then queryAll else querySearch model.query
    in
    ( { model
      | syncPhase = SyncIdle
      , renameOldTag = ""
      , renameNewTag = ""
      , status = "Rename complete."
      }
    , refreshCmd
    )

-- ── RPC BUILDER HELPERS (Phase 5.1) ──────────────────────────────────────────
-- These encode a well-formed RPC envelope AND mark the request as Pending
-- in the Model's inFlightRpcs dict. Used by Phase 5.2+ sync orchestration.

{-| Send an RPC_FETCH command and track it as Pending. -}
rpcFetch : String -> String -> List ( String, String ) -> Model -> ( Model, Cmd Msg )
rpcFetch rpcId path params model =
    let
        envelope =
            Encode.object
                [ ( "type", Encode.string "RPC_FETCH" )
                , ( "id", Encode.string rpcId )
                , ( "payload"
                  , Encode.object
                      (( "proxyUrl", Encode.string model.proxyUrl )
                      :: ( "path", Encode.string path )
                      :: List.map (\( k, v ) -> ( k, Encode.string v )) params
                      )
                  )
                ]
    in
    ( { model | inFlightRpcs = Dict.insert rpcId RpcPending model.inFlightRpcs }
    , toWorker envelope
    )

{-| Send an RPC_SQL_QUERY command and track it as Pending. -}
rpcSqlQuery : String -> String -> List Encode.Value -> Model -> ( Model, Cmd Msg )
rpcSqlQuery rpcId sql bind model =
    let
        envelope =
            Encode.object
                [ ( "type", Encode.string "RPC_SQL_QUERY" )
                , ( "id", Encode.string rpcId )
                , ( "payload"
                  , Encode.object
                      [ ( "sql", Encode.string sql )
                      , ( "bind", Encode.list identity bind )
                      ]
                  )
                ]
    in
    ( { model | inFlightRpcs = Dict.insert rpcId RpcPending model.inFlightRpcs }
    , toWorker envelope
    )

{-| Send an RPC_SQL_EXEC command and track it as Pending. -}
rpcSqlExec : String -> String -> List Encode.Value -> Model -> ( Model, Cmd Msg )
rpcSqlExec rpcId sql bind model =
    let
        envelope =
            Encode.object
                [ ( "type", Encode.string "RPC_SQL_EXEC" )
                , ( "id", Encode.string rpcId )
                , ( "payload"
                  , Encode.object
                      [ ( "sql", Encode.string sql )
                      , ( "bind", Encode.list identity bind )
                      ]
                  )
                ]
    in
    ( { model | inFlightRpcs = Dict.insert rpcId RpcPending model.inFlightRpcs }
    , toWorker envelope
    )

{-| Send an RPC_SQL_TRANSACTION command and track it as Pending.
    stmts is a list of (sql, bind) pairs.
-}
rpcSqlTransaction : String -> List ( String, List Encode.Value ) -> Model -> ( Model, Cmd Msg )
rpcSqlTransaction rpcId stmts model =
    let
        encodeStmt ( sql, bind ) =
            Encode.object
                [ ( "sql", Encode.string sql )
                , ( "bind", Encode.list identity bind )
                ]

        envelope =
            Encode.object
                [ ( "type", Encode.string "RPC_SQL_TRANSACTION" )
                , ( "id", Encode.string rpcId )
                , ( "payload", Encode.list encodeStmt stmts )
                ]
    in
    ( { model | inFlightRpcs = Dict.insert rpcId RpcPending model.inFlightRpcs }
    , toWorker envelope
    )

{-| Look up the result of a completed RPC in the model.
    Returns Nothing if the request is still Pending or was never sent.
-}
rpcResult : String -> Model -> Maybe RpcState
rpcResult rpcId model =
    Dict.get rpcId model.inFlightRpcs

{-| Discard a completed RPC entry from the tracking dict (cleanup after use). -}
rpcClear : String -> Model -> Model
rpcClear rpcId model =
    { model | inFlightRpcs = Dict.remove rpcId model.inFlightRpcs }

-- VIEW (Brutally Simple)

view : Model -> Html Msg
view model =
    div [ class "pingolin-fortress" ]
        [ div [ attribute "id" "masthead" ]
            [ div [ class "top-bar" ] 
                [ span [ attribute "data-testid" "network-status" ] [ text (if model.isOnline then "ONLINE" else "OFFLINE") ]
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
