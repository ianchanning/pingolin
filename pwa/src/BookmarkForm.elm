module BookmarkForm exposing (Model, Msg(..), init, update, view)

import Html exposing (Html, button, datalist, div, input, option, text)
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
        [ input [ placeholder "URL", value model.newBookmark.href, onInput (toMsg << SetNewHref), attribute "data-testid" "new-url" ] []
        , input [ placeholder "Title", value model.newBookmark.description, onInput (toMsg << SetNewDescription), attribute "data-testid" "new-title" ] []
        , input [ placeholder "Tags", value model.newBookmark.tags, onInput (toMsg << SetNewTags), attribute "data-testid" "new-tags", attribute "list" "tag-suggestions" ] []
        , datalist [ attribute "id" "tag-suggestions" ]
            (List.map (\tag -> option [ value tag ] []) tagSuggestions)
        , button [ onClick (toMsg TriggerSubmit), attribute "data-testid" "add-button" ] [ text "Add Bookmark" ]
        ]
