module Types exposing (..)

import Dict exposing (Dict)
import Json.Decode as Decode exposing (Decoder)


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
    }



-- Decoders move here
-- bookmarkDecoder, workerMessageDecoder, etc.
