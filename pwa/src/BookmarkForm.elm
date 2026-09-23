module BookmarkForm exposing (Model, Msg(..), init, update, view)

import Html exposing (Html, button, div, input, label, span, text)
import Html.Attributes exposing (attribute, class, placeholder, value, style)
import Html.Events exposing (onClick, onInput)


type alias Bookmark =
    { href : String
    , description : String
    , tags : List String
    }


type alias Model =
    { newBookmark : Bookmark
    , currentTagQuery : String
    , showAddForm : Bool
    , tagSuggestions : List String
    }


type Msg
    = ToggleAddForm
    | SetNewHref String
    | SetNewDescription String
    | SetCurrentTagQuery String
    | AddTag String
    | RemoveTag Int
    | SetTagSuggestions (List String)
    | TriggerSubmit


init : Model
init =
    { newBookmark = { href = "", description = "", tags = [] }
    , currentTagQuery = ""
    , showAddForm = False
    , tagSuggestions = []
    }


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        ToggleAddForm ->
            ( { model | showAddForm = not model.showAddForm }, Cmd.none )

        SetNewHref href ->
            ( { model | newBookmark = { model.newBookmark | href = href } }, Cmd.none )

        SetNewDescription desc ->
            ( { model | newBookmark = { model.newBookmark | description = desc } }, Cmd.none )

        SetCurrentTagQuery query ->
            ( { model | currentTagQuery = query }, Cmd.none )

        AddTag tag ->
            if tag == "" then
                ( model, Cmd.none )

            else
                let
                    newTags =
                        model.newBookmark.tags ++ [ tag ]

                    nextBookmark =
                        { model.newBookmark | tags = newTags }
                in
                ( { model | newBookmark = nextBookmark, currentTagQuery = "" }, Cmd.none )

        RemoveTag index ->
            let
                newTags =
                    List.take index model.newBookmark.tags
                        ++ List.drop (index + 1) model.newBookmark.tags

                nextBookmark =
                    { model.newBookmark | tags = newTags }
            in
            ( { model | newBookmark = nextBookmark }, Cmd.none )

        SetTagSuggestions suggestions ->
            ( { model | tagSuggestions = suggestions }, Cmd.none )

        TriggerSubmit ->
            ( model, Cmd.none )


view : Model -> (Msg -> msg) -> List String -> Html msg
view model toMsg allSuggestions =
    let
        currentQuery =
            model.currentTagQuery

        filteredSuggestions =
            allSuggestions
                |> List.filter (\tag -> (String.toLowerCase currentQuery) `String.contains` (String.toLowerCase tag))
                |> List.take 10

        viewChip index tag =
            div [ class "tag-chip" ]
                [ span [] [ text tag ]
                , button [ onClick (toMsg << RemoveTag index), class "tag-chip-remove" ] [ text "×" ]
                ]
    in
    div [ class "add-form", attribute "data-testid" "add-form" ]
        [ div [] 
            [ label [ attribute "for" "new-url" ] [ text "URL" ]
            , input [ attribute "id" "new-url", placeholder "https://...", value model.newBookmark.href, onInput (toMsg << SetNewHref), attribute "data-testid" "new-url" ] []
            ]
        , div [] 
            [ label [ attribute "for" "new-title" ] [ text "Title" ]
            , input [ attribute "id" "new-title", placeholder "Page Title", value model.newBookmark.description, onInput (toMsg << SetNewDescription), attribute "data-testid" "new-title" ] []
            ]
        , div [] 
            [ label [ attribute "for" "new-tags" ] [ text "Tags" ]
            , div [ class "tag-input-container" ]
                (List.indexedMap viewChip model.newBookmark.tags ++
                    [ input 
                        [ attribute "id" "new-tags"
                        , placeholder "Add tag..."
                        , value currentQuery
                        , onInput (toMsg << SetCurrentTagQuery)
                        , attribute "data-testid" "new-tags"
                        , style "border" "none"
                        , style "outline" "none"
                        , style "flex" "1"
                        , style "min-width" "100px"
                        ] 
                        []
                    ])
            ]
        , if currentQuery /= "" && not (List.isEmpty filteredSuggestions) then
            div [ class "tag-suggestions-dropdown" ]
                (List.map (\tag -> 
                    div [ onClick (toMsg << AddTag tag), class "tag-suggestion-item" ] [ text tag ]
                ) filteredSuggestions)
          else
            text ""
        , button [ onClick (toMsg TriggerSubmit), attribute "data-testid" "add-button" ] [ text "Add Bookmark" ]
        ]
