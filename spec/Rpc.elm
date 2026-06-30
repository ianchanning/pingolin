module Rpc exposing (..)

import Dict exposing (Dict)
import Json.Encode as Encode
import Types exposing (Model, RpcPending, RpcState)



-- Helper to send an RPC_FETCH command and track it as Pending.


rpcFetch : String -> String -> List ( String, String ) -> Model -> ( Model, Cmd msg )



-- Implementation moves from Main.elm


rpcSqlQuery : String -> String -> List Encode.Value -> Model -> ( Model, Cmd msg )



-- Implementation moves from Main.elm


rpcSqlExec : String -> String -> List Encode.Value -> Model -> ( Model, Cmd msg )



-- Implementation moves from Main.elm


rpcSqlTransaction : String -> List ( String, List Encode.Value ) -> Model -> ( Model, Cmd msg )



-- Implementation moves from Main.elm


rpcResult : String -> Model -> Maybe RpcState



-- Implementation moves from Main.elm


rpcClear : String -> Model -> Model



-- Implementation moves from Main.elm
