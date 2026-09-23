module BookmarkForm exposing (Bookmark, Model, Msg(..), init, update, view)

import Html exposing (Html, button, datalist, div, input, label, option, span, text)
import Html.Attributes exposing (attribute, class, placeholder, type_, value)
import Html.Events exposing (onClick, onInput)


type alias Bookmark =
    { href : String
    , description : String
    , tags : String
    }


type alias Model =
    { newBookmark : Bookmark
    , showAddForm : Bool
    , tagSuggestions : List String
    }


type Msg
    = ToggleAddForm
    | SetNewHref String
    | SetNewDescription String
    | SetNewTags String
    | AppendTag String
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
                current =
                    model.newBookmark
            in
            ( { model | newBookmark = { current | href = href } }, Cmd.none )

        SetNewDescription desc ->
            let
                current =
                    model.newBookmark
            in
            ( { model | newBookmark = { current | description = desc } }, Cmd.none )

        SetNewTags tags ->
            let
                current =
                    model.newBookmark
            in
            ( { model | newBookmark = { current | tags = tags } }, Cmd.none )

        AppendTag tag ->
            let
                current =
                    model.newBookmark

                raw =
                    current.tags

                hasTrailingSpace =
                    String.endsWith " " raw

                words =
                    String.words raw

                newTags =
                    if hasTrailingSpace || List.isEmpty words then
                        if List.member tag words then
                            raw

                        else if raw == "" then
                            tag ++ " "

                        else
                            String.trimRight raw ++ " " ++ tag ++ " "

                    else
                        let
                            prefix =
                                List.take (List.length words - 1) words
                        in
                        if List.member tag prefix then
                            String.join " " prefix ++ " "

                        else
                            String.join " " (prefix ++ [ tag ]) ++ " "
            in
            ( { model | newBookmark = { current | tags = newTags } }, Cmd.none )

        SetTagSuggestions suggestions ->
            ( { model | tagSuggestions = suggestions }, Cmd.none )

        TriggerSubmit ->
            ( model, Cmd.none )


view : Model -> (Msg -> msg) -> List String -> Html msg
view model toMsg allSuggestions =
    let
        words =
            String.words model.newBookmark.tags

        activeWord =
            if String.endsWith " " model.newBookmark.tags then
                ""

            else
                words
                    |> List.reverse
                    |> List.head
                    |> Maybe.withDefault ""

        filteredSuggestions =
            if activeWord == "" then
                []

            else
                allSuggestions
                    |> List.filter (\tag -> String.contains (String.toLower activeWord) (String.toLower tag))
                    |> List.take 10

        prefixText =
            if activeWord == "" then
                ""

            else
                let
                    raw =
                        model.newBookmark.tags

                    activeLen =
                        String.length activeWord

                    totalLen =
                        String.length raw
                in
                String.left (totalLen - activeLen) raw
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
            , div [ class "tags-input-chamber" ]
                [ input
                    [ attribute "id" "new-tags"
                    , placeholder "tag1 tag2..."
                    , value model.newBookmark.tags
                    , onInput (toMsg << SetNewTags)
                    , attribute "data-testid" "new-tags"
                    ]
                    []
                , datalist [ attribute "id" "tag-suggestions" ]
                    (List.map (\tag -> option [ value tag ] []) allSuggestions)
                , if not (List.isEmpty filteredSuggestions) then
                    div [ class "tag-suggestions-anchor" ]
                        [ span [ class "tag-prefix-spacer" ] [ text prefixText ]
                        , div [ class "tag-suggestions-dropdown", attribute "data-testid" "tag-suggestions-cloud" ]
                            (List.map (\tag ->
                                button
                                    [ type_ "button"
                                    , onClick (toMsg (AppendTag tag))
                                    , class "tag-suggestion-item"
                                    ]
                                    [ text tag ]
                            ) filteredSuggestions)
                        ]

                  else
                    text ""
                ]
            ]
        , button [ onClick (toMsg TriggerSubmit), attribute "data-testid" "add-button" ] [ text "Add Bookmark" ]
        ]
