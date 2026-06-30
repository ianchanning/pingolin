module Sync exposing (..)

import Types exposing (Model, SyncPhase, WorkerMsg)



-- Main entry point for worker messages


handleWorkerMsg : WorkerMsg -> Model -> ( Model, Cmd msg )



-- Implementation moves from Main.elm
-- Routes completed RPC responses to business logic handlers


routeRpcSuccess : String -> Maybe Decode.Value -> Model -> ( Model, Cmd msg )



-- Implementation moves from Main.elm
-- Heartbeat logic


handleHeartbeatUpdate : Maybe Decode.Value -> Model -> ( Model, Cmd msg )



-- Implementation moves from Main.elm
-- Delta Sync / Dates Hack logic


handleDeltaFetchResult : Maybe Decode.Value -> Model -> ( Model, Cmd msg )


handleDatesServerResult : Maybe Decode.Value -> Model -> ( Model, Cmd msg )


handleDatesLocalResult : Maybe Decode.Value -> Model -> ( Model, Cmd msg )


reconcileNextDay : Model -> ( Model, Cmd msg )


handleDayGetResult : Maybe Decode.Value -> Model -> ( Model, Cmd msg )


handleDayLocalResult : Maybe Decode.Value -> Model -> ( Model, Cmd msg )



-- Flush Loop logic


flushNext : Model -> ( Model, Cmd msg )


handleFlushDone : Model -> ( Model, Cmd msg )


handleFlushDeleteDone : Model -> ( Model, Cmd msg )



-- Tag Rename logic


handleRenameQueryResult : Maybe Decode.Value -> Model -> ( Model, Cmd msg )


renamePushNext : Model -> ( Model, Cmd msg )


handleRenamePushAddDone : Model -> ( Model, Cmd msg )


handleRenameDeleteTagDone : Model -> ( Model, Cmd msg )
