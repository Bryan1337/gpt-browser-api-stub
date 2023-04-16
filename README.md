
# Whatsapp bot which responds with actual chatGPT responses

# Bot

## How to set up

Copy the .env.example file to .env and fill in the values

- `ACCESS_TOKEN` you can find this by navigating to https://chat.openai.com/api/auth/session and copying the `accessToken` value from the JSON object.
- `USER_PHONE_ID` the phone number you want to run the whatsapp bot from. When running this for the first time you'll see some QR codes in the console. You can scan these using a couple methods:
	- Using an actual phone which runs whatsapp and has the actual number linked to it
	- Using a virtual environment which you can use to emulate a virtual camera and scan the QR codes using the virtual camera
	- Probably some other methods I'm missing
- `API_URL` The api endpoint. Requires some params such as  `accessToken`, `prompt`, `gptConversationId` and`gptParentMessageId`

## Usage

### Whitelisting

Works on a whitelisting principle. Add (or generate) some keys and add them to .accessKeys/accessKeyMap.json as an array. When adding this bot to a group or using it in a personal conversation, simply quote the bot's number (@`USER_PHONE_ID`) and type !register followed by one of the access keys from the accessKeyMap.json file. This will remove the key from the pool and add the group or personal chat id to the whitelist (You could also manually add the chat id to the whitelist but you'll have to extract the id by checking the logs.).

Registering with invalid keys will result in a "🚫" reaction being given to the response. Normal conversations will not be processed unless a chat or conversation id is whitelisted.

### Responses

Responses are queued if there are multiple requests simultaneously. The bot will react to a message with "💤" if the message is queued following by a "🕤" reaction if the message is being processed. If a message isn't handled within a minute, the message will be timed out. If a message is handled successfully the bot will react with a "✅".

The responses are identical to a chatGPT window (as it practically IS chatGPT) and will keep track of values such as `whatsappIdentifier` (message source), `gptConversationId` (The conversation thread) and the `gptParentMessageId` (the last message chain). The `gptParentMessageId` is updated after each message to make sure messages are treated as responses to the last sent chatGPT response.

Since we're using an external proxy it is possible that 429 status codes (Too many requests) might be returned from a request. In this case the bot will react with a "❌" to the original message and alert the user of the status accordingly.

### Server

...