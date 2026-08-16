module Rpc exposing (..)

import Dict exposing (Dict)
import Json.Encode as Encode
import Types exposing (RpcState(..))



-- Helper to send an RPC_FETCH command and track it as Pending.


rpcFetch : String -> String -> List ( String, String ) -> String -> Dict String RpcState -> ( Dict String RpcState, Encode.Value )
rpcFetch rpcId path params proxyUrl inFlightRpcs =
    let
        envelope =
            Encode.object
                [ ( "type", Encode.string "RPC_FETCH" )
                , ( "id", Encode.string rpcId )
                , ( "payload"
                  , Encode.object
                        [ ( "proxyUrl", Encode.string proxyUrl )
                        , ( "path", Encode.string path )
                        , ( "params", Encode.object (List.map (\( k, v ) -> ( k, Encode.string v )) params) )
                        ]
                  )
                ]
    in
    ( Dict.insert rpcId RpcPending inFlightRpcs
    , envelope
    )


rpcSqlQuery : String -> String -> List Encode.Value -> Dict String RpcState -> ( Dict String RpcState, Encode.Value )
rpcSqlQuery rpcId sql bind inFlightRpcs =
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
    ( Dict.insert rpcId RpcPending inFlightRpcs
    , envelope
    )


rpcSqlExec : String -> String -> List Encode.Value -> Dict String RpcState -> ( Dict String RpcState, Encode.Value )
rpcSqlExec rpcId sql bind inFlightRpcs =
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
    ( Dict.insert rpcId RpcPending inFlightRpcs
    , envelope
    )


rpcSqlTransaction : String -> List ( String, List Encode.Value ) -> Dict String RpcState -> ( Dict String RpcState, Encode.Value )
rpcSqlTransaction rpcId stmts inFlightRpcs =
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
    ( Dict.insert rpcId RpcPending inFlightRpcs
    , envelope
    )


rpcResult : String -> Dict String RpcState -> Maybe RpcState
rpcResult rpcId inFlightRpcs =
    Dict.get rpcId inFlightRpcs


rpcClear : String -> Dict String RpcState -> Dict String RpcState
rpcClear rpcId inFlightRpcs =
    Dict.remove rpcId inFlightRpcs
