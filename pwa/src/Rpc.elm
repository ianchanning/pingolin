module Rpc exposing (..)

import Dict exposing (Dict)
import Json.Encode as Encode
import Types exposing (Model, RpcState(..))



-- Helper to send an RPC_FETCH command and track it as Pending.


rpcFetch : String -> String -> List ( String, String ) -> Model -> ( Model, Encode.Value )
rpcFetch rpcId path params model =
    let
        envelope =
            Encode.object
                [ ( "type", Encode.string "RPC_FETCH" )
                , ( "id", Encode.string rpcId )
                , ( "payload"
                  , Encode.object
                        [ ( "proxyUrl", Encode.string model.proxyUrl )
                        , ( "path", Encode.string path )
                        , ( "params", Encode.object (List.map (\( k, v ) -> ( k, Encode.string v )) params) )
                        ]
                  )
                ]
    in
    ( { model | inFlightRpcs = Dict.insert rpcId RpcPending model.inFlightRpcs }
    , envelope
    )


rpcSqlQuery : String -> String -> List Encode.Value -> Model -> ( Model, Encode.Value )
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
    , envelope
    )


rpcSqlExec : String -> String -> List Encode.Value -> Model -> ( Model, Encode.Value )
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
    , envelope
    )


rpcSqlTransaction : String -> List ( String, List Encode.Value ) -> Model -> ( Model, Encode.Value )
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
    , envelope
    )


rpcResult : String -> Model -> Maybe RpcState
rpcResult rpcId model =
    Dict.get rpcId model.inFlightRpcs


rpcClear : String -> Model -> Model
rpcClear rpcId model =
    { model | inFlightRpcs = Dict.remove rpcId model.inFlightRpcs }
