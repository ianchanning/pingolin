module Auth exposing (Model, Msg(..), init, update, view)

import Html exposing (Html, button, div, input, label, text)
import Html.Attributes exposing (attribute, class, placeholder, value)
import Html.Events exposing (onClick, onInput)


type alias Model =
    { token : String
    , proxyUrl : String
    , showLoginForm : Bool
    }


type Msg
    = SetToken String
    | SetProxy String
    | ToggleLoginForm
    | TriggerStartSync


init : ( String, String, Bool ) -> Model
init ( token, proxyUrl, showLoginForm ) =
    { token = token
    , proxyUrl = proxyUrl
    , showLoginForm = showLoginForm
    }


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        SetToken token ->
            ( { model | token = token }, Cmd.none )

        SetProxy proxy ->
            ( { model | proxyUrl = proxy }, Cmd.none )

        ToggleLoginForm ->
            ( { model | showLoginForm = not model.showLoginForm }, Cmd.none )

        TriggerStartSync ->
            ( model, Cmd.none )


view : Model -> (Msg -> msg) -> String -> Html msg
view model toMsg version =
    div [ class "ritual-controls", attribute "data-testid" "login-container" ]
        [ div [] 
            [ label [ attribute "for" "auth-token" ] [ text "Auth Token" ]
            , input [ attribute "id" "auth-token", placeholder "user:HEX", value model.token, onInput (toMsg << SetToken), attribute "data-testid" "auth-token" ] []
            ]
        , div [] 
            [ label [ attribute "for" "proxy-url" ] [ text "Proxy URL" ]
            , input [ attribute "id" "proxy-url", placeholder "https://...", value model.proxyUrl, onInput (toMsg << SetProxy) ] []
            ]
        , button [ onClick (toMsg TriggerStartSync), attribute "data-testid" "sync-button" ] [ text "Initialize Sync" ]
        , div [ class "version-tag" ] [ text ("v" ++ version) ]
        ]
