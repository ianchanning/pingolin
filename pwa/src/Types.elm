module Types exposing (..)

import Dict exposing (Dict)
import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode
import Time


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


type SyncPhase
    = SyncIdle
    | SyncCheckingUpdate
    | SyncFlushing { index : Int, total : Int }
    | SyncCheckingDates
    | SyncComparingDates
    | SyncReconcilingDay String
    | SyncPruningDay String
    | SyncRenameQuerying String String
    | SyncRenameProcessing { oldTag : String, newTag : String, index : Int, total : Int }
    | SyncRenameDeletingTag String


type alias PendingRow =
    { href : String
    , description : String
    , extended : String
    , tags : String
    , time : String
    , syncStatus : String
    }


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
    , newBookmark : { href : String, description : String, tags : String }
    , showLoginForm : Bool
    , version : String
    , inFlightRpcs : Dict String RpcState
    , syncPhase : SyncPhase
    , lastSyncTime : String
    , pendingFlush : List PendingRow
    , serverDates : Dict String Int
    , pendingDateReconciles : List String
    , dayServerHrefs : List String
    , renameOldTag : String
    , renameNewTag : String
    , renameQueue : List PendingRow
    , targetSyncTime : String
    }


type WorkerMsg
    = ProgressMsg String Float
    | SyncCompleteMsg
    | QueryResultsMsg (List Bookmark)
    | TagSuggestionsMsg (List String)
    | ErrorMsg String
    | RefreshRequiredMsg
    | SessionRestoredMsg String String String
    | RpcSuccessMsg String (Maybe Decode.Value)
    | RpcErrorMsg String String String
    | UnknownMsg


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
    | QueryAll
    | QuerySearch String
    | SendWorkerValue Encode.Value


decodeSyncStatus : String -> SyncStatus
decodeSyncStatus status =
    case status of
        "PENDING_INSERT" ->
            PendingInsert

        "PENDING_UPDATE" ->
            PendingUpdate

        "PENDING_DELETE" ->
            PendingDelete

        _ ->
            Synchronized


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
                        Decode.map2 RpcSuccessMsg (Decode.succeed id) (Decode.maybe (Decode.field "payload" Decode.value))

                    "RPC_ERROR" ->
                        Decode.map3 RpcErrorMsg
                            (Decode.succeed id)
                            (Decode.at [ "payload", "message" ] Decode.string)
                            (Decode.at [ "payload", "code" ] (Decode.oneOf [ Decode.string, Decode.succeed "UNKNOWN" ]))

                    _ ->
                        Decode.succeed UnknownMsg
            )


type alias RenamePayload =
    { oldTag : String
    , newTag : String
    }


renamePayloadDecoder : Decoder RenamePayload
renamePayloadDecoder =
    Decode.map2 RenamePayload
        (Decode.field "oldTag" Decode.string)
        (Decode.field "newTag" Decode.string)


flexibleBookmarkDecoder : Decoder Bookmark
flexibleBookmarkDecoder =
    let
        hrefDecoder =
            Decode.oneOf
                [ Decode.field "href" Decode.string
                , Decode.field "url" Decode.string
                ]

        descDecoder =
            Decode.oneOf
                [ Decode.field "description" Decode.string
                , Decode.field "title" Decode.string
                ]

        timeDecoder =
            Decode.oneOf
                [ Decode.field "time" Decode.string
                , Decode.field "updated" Decode.string
                ]

        extendedDecoder =
            Decode.oneOf
                [ Decode.field "extended" Decode.string
                , Decode.succeed ""
                ]

        tagsDecoder =
            Decode.oneOf
                [ Decode.field "tags" Decode.string
                , Decode.succeed ""
                ]
                |> Decode.map (String.split " " >> List.filter (not << String.isEmpty))

        statusDecoder =
            Decode.oneOf
                [ Decode.field "sync_status" Decode.string |> Decode.map decodeSyncStatus
                , Decode.succeed Synchronized
                ]
    in
    Decode.map6 Bookmark
        hrefDecoder
        descDecoder
        extendedDecoder
        tagsDecoder
        timeDecoder
        statusDecoder


deltaResponseDecoder : Decoder (List Bookmark)
deltaResponseDecoder =
    Decode.oneOf
        [ Decode.list flexibleBookmarkDecoder
        , Decode.field "items" (Decode.list flexibleBookmarkDecoder)
        ]


pendingRowDecoder : Decoder PendingRow
pendingRowDecoder =
    Decode.map6 PendingRow
        (Decode.field "href" Decode.string)
        (Decode.field "description" (Decode.oneOf [ Decode.string, Decode.succeed "" ]))
        (Decode.field "extended" (Decode.oneOf [ Decode.string, Decode.succeed "" ]))
        (Decode.field "tags" (Decode.oneOf [ Decode.string, Decode.succeed "" ]))
        (Decode.field "time" Decode.string)
        (Decode.field "sync_status" Decode.string)


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
