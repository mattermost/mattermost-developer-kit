package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/signal"
	"strings"

	"github.com/mattermost/mattermost-server/model"
)

type Config struct {
	Name                *string `json:"name"`                  // Integration name
	MattermostUrl       *string `json:"mattermost_url"`        // URL of the Mattermost server
	PersonalAccessToken *string `json:"personal_access_token"` // Token for accessing the REST API
	BotName             *string `json:"bot_name"`              // Name to use when posting
	BotIconUrl          *string `json:"bot_icon_url"`          // Icon to use when posting
	TeamName            *string `json:"team_name"`             // Name of team the integration will interact with
	ChannelName         *string `json:"channel_name"`          // Name of channel to log messages in
}

var config *Config
var client *model.Client4
var webSocketClient *model.WebSocketClient
var loggingChannel *model.Channel

// Documentation for the Go driver can be found
// at https://godoc.org/github.com/mattermost/mattermost-server/model#Client4
func main() {
	LoadConfig()

	fmt.Println(*config.Name)

	SetupGracefulShutdown()

	// Set up API client
	client = model.NewAPIv4Client(*config.MattermostUrl)
	client.AuthToken = *config.PersonalAccessToken
	client.AuthType = model.HEADER_BEARER

	// Test to see if the Mattermost server is up and running
	MakeSureServerIsRunning()

	// Using the channel and team names in the config, get our logging channel
	GetLoggingChannel()

	// Log a message to the logging channel
	SendMsgToLoggingChannel("_"+*config.Name+" has **started** running_", "")

	// Start listening to events via the websocket
	webSocketUrl := ""

	if strings.HasPrefix(*config.MattermostUrl, "http://") {
		webSocketUrl = "ws://" + strings.Replace(*config.MattermostUrl, "http://", "", 1)
	} else if strings.HasPrefix(*config.MattermostUrl, "https://") {
		webSocketUrl = "wss://" + strings.Replace(*config.MattermostUrl, "https://", "", 1)
	}

	webSocketClient, err := model.NewWebSocketClient4(webSocketUrl, client.AuthToken)
	if err != nil {
		fmt.Println("We failed to connect to the web socket")
		PrintAppError(err)
	}

	webSocketClient.Listen()

	go func() {
		for {
			// Add other events/channels here
			select {
			case resp := <-webSocketClient.EventChannel:
				HandleWebSocketResponse(resp)
			}
		}
	}()

	// Block forever
	select {}
}

func LoadConfig() {
	configFile, err := os.Open("config.json")
	if err != nil {
		fmt.Println("There was a problem loading the config file: " + err.Error())
		os.Exit(1)
	}

	config = &Config{}
	jsonParser := json.NewDecoder(configFile)
	if err = jsonParser.Decode(config); err != nil {
		fmt.Println("There was a problem parsing the config file: " + err.Error())
		os.Exit(1)
	}

	if config.MattermostUrl == nil || *config.MattermostUrl == "" {
		fmt.Println("Please set mattermost_url in the config")
		os.Exit(1)
	}

	if config.PersonalAccessToken == nil || *config.PersonalAccessToken == "" {
		fmt.Println("Please set personal_access_token in the config")
		os.Exit(1)
	}
}

func MakeSureServerIsRunning() {
	if props, resp := client.GetOldClientConfig(""); resp.Error != nil {
		fmt.Println("There was a problem pinging the Mattermost server.  Are you sure it's running?")
		PrintAppError(resp.Error)
		os.Exit(1)
	} else {
		fmt.Println("Server detected and is running version " + props["Version"])
	}
}

func GetLoggingChannel() {
	if channel, resp := client.GetChannelByNameForTeamName(*config.ChannelName, *config.TeamName, ""); resp.Error != nil {
		fmt.Println("Failed to get logging channel, did you set team_name and channel_name in the config?")
		PrintAppError(resp.Error)
	} else {
		loggingChannel = channel
	}
}

func SendMsgToLoggingChannel(msg string, replyToId string) {
	post := &model.Post{}
	post.ChannelId = loggingChannel.Id
	post.Message = msg
	post.RootId = replyToId
	post.Props = map[string]interface{}{
		"override_username": *config.BotName,
		"override_icon_url": *config.BotIconUrl,
		"from_webhook":      "true", // Marks the post as a BOT post
	}

	if _, resp := client.CreatePost(post); resp.Error != nil {
		fmt.Println("Failed to send a message to the logging channel")
		PrintAppError(resp.Error)
	}
}

func HandleWebSocketResponse(event *model.WebSocketEvent) {
	// Add handling of WebSocket events here, other event types can be found here
	// https://github.com/mattermost/mattermost-server/blob/master/model/websocket_message.go#L11
	switch eventType := event.Event; eventType {
	case model.WEBSOCKET_EVENT_POSTED:
		post := model.PostFromJson(strings.NewReader(event.Data["post"].(string)))
		fmt.Println("Received post, user_id=" + post.UserId + " channel_id=" + post.ChannelId + " message=" + post.Message)
	}
}

func PrintAppError(err *model.AppError) {
	fmt.Println("\tError Details:")
	fmt.Println("\t\t" + err.Message)
	fmt.Println("\t\t" + err.Id)
	fmt.Println("\t\t" + err.DetailedError)
}

func SetupGracefulShutdown() {
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	go func() {
		for _ = range c {
			if webSocketClient != nil {
				webSocketClient.Close()
			}

			SendMsgToLoggingChannel("_"+*config.Name+" has **stopped** running_", "")
			os.Exit(0)
		}
	}()
}
