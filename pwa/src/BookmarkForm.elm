module BookmarkForm exposing (Model, Msg(..), init, update, view)

import Html exposing (Html, button, datalist, div, input, label, option, text)
import Html.Attributes exposing (attribute, class, placeholder, value)
import Html.Events exposing (onClick, onInput)


type alias Model =
    { newBookmark : { href : String, description : String, tags : String }
    , showAddForm : Bool
    , tagSuggestions : List String
    }


type Msg
    = ToggleAddForm
    | SetNewHref String
    | SetNewDescription String
    | SetNewTags String
    | SetTagSuggestions (List String)
    | TriggerSubmit


init : Model
init =
    { newBookmark = { href = "", description = "", tags = "" }
    , showAddForm = False
    , tagSuggestions = []
    }


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        ToggleAddForm ->
            ( { model | showAddForm = not model.showAddForm }, Cmd.none )

        SetNewHref href ->
            let
                nb =
                    model.newBookmark
            in
            ( { model | newBookmark = { nb | href = href } }, Cmd.none )

        SetNewDescription desc ->
            let
                nb =
                    model.newBookmark
            in
            ( { model | newBookmark = { nb | description = desc } }, Cmd.none )

        SetNewTags tags ->
            let
                nb =
                    model.newBookmark
            in
            ( { model | newBookmark = { nb | tags = tags } }, Cmd.none )

        SetTagSuggestions suggestions ->
            ( { model | tagSuggestions = suggestions }, Cmd.none )

        TriggerSubmit ->
            ( model, Cmd.none )


view : Model -> (Msg -> msg) -> List String -> Html msg
view model toMsg tagSuggestions =
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
            , input [ attribute "id" "new-tags", placeholder "tag1, tag2...", value model.newBookmark.tags, onInput (toMsg << SetNewTags), attribute "data-testid" "new-tags", attribute "list" "tag-suggestions" ] []
            ]
        , datalist [ attribute "id" "tag-suggestions" ]
            (List.map (\tag -> option [ value tag ] []) tagSuggestions)
        , button [ onClick (toMsg TriggerSubmit), attribute "data-testid" "add-button" ] [ text "Add Bookmark" ]
        ]
