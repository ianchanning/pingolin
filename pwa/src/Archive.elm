module Archive exposing (Model, Msg(..), init, update, view)

import Html exposing (Html, a, div, h3, label, text)
import Html.Attributes exposing (attribute, class, href, style, target)
import Html.Events exposing (preventDefaultOn)
import Json.Decode as Decode
import Types exposing (Bookmark, SyncStatus(..))


type alias Model =
    { query : String
    , bookmarks : List Bookmark
    , scrollTop : Int
    , viewportHeight : Int
    }


type Msg
    = SetQuery String
    | OnScroll Int
    | OnResize Int


init : String -> Model
init query =
    { query = query
    , bookmarks = []
    , scrollTop = 0
    , viewportHeight = 800
    }


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        SetQuery query ->
            ( { model | query = query, scrollTop = 0 }, Cmd.none )

        OnScroll top ->
            ( { model | scrollTop = top }, Cmd.none )

        OnResize height ->
            ( { model | viewportHeight = height }, Cmd.none )


rowHeight : Int
rowHeight =
    120


bufferItems : Int
bufferItems =
    5


view : Model -> (Msg -> msg) -> Html msg
view model toMsg =
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
            (List.map (viewIndexedBookmark toMsg) visibleBookmarks)
        ]


viewIndexedBookmark : (Msg -> msg) -> ( Int, Bookmark ) -> Html msg
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
            (label [] [ text "Tags: " ] :: List.intersperse (text ", ") (List.map (viewTag toMsg) b.tags))
        ]


viewTag : (Msg -> msg) -> String -> Html msg
viewTag toMsg tag =
    a
        [ href ("?q=#" ++ tag)
        , preventDefaultOn "click" (Decode.succeed ( toMsg (SetQuery ("#" ++ tag)), True ))
        ]
        [ text tag ]
