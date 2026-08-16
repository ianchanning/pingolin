module AppState exposing (Model)

import Archive
import Auth
import BookmarkForm
import Dict exposing (Dict)
import Types exposing (..)


type alias Model =
    { auth : Auth.Model
    , archive : Archive.Model
    , form : BookmarkForm.Model
    , status : String
    , progress : Float
    , isOnline : Bool
    , isHydrated : Bool
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
