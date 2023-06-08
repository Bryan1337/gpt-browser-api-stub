
# Whatsapp bot which responds with actual chatGPT responses

# Bot

## How to set up

Copy the .env.example file to .env and fill in the values

- `ACCESS_TOKEN` you can find this by navigating to https://chat.openai.com/api/auth/session and copying the `accessToken` value from the JSON object.
- `USER_PHONE_ID` the phone number you want to run the whatsapp bot from. When running this for the first time you'll see some QR codes in the console. You can scan these using a couple methods:
	- Using an actual phone which runs whatsapp and has the actual number linked to it
	- Using a virtual environment which you can use to emulate a virtual camera and scan the QR codes using the virtual camera
- `API_URL` The api endpoint. Requires some params such as  `accessToken`, `prompt` and `gptConversationId`

## Usage

### Whitelisting

Works on a whitelisting principle. Add (or generate) some keys and add them to .accessKeys/accessKeyMap.json as an array. When adding this bot to a group or using it in a personal conversation, simply quote the bot's number (@`USER_PHONE_ID`) and type !register followed by one of the access keys from the accessKeyMap.json file. This will remove the key from the pool and add the group or personal chat id to the whitelist (You could also manually add the chat id to the whitelist but you'll have to extract the id by checking the logs.).

Registering with invalid keys will result in a "🚫" reaction being given to the response. Normal conversations will not be processed unless a chat or conversation id is whitelisted.

### Responses

Responses are queued if there are multiple requests simultaneously. The bot will react to a message with "💤" if the message is queued following by a "🕤" reaction if the message is being processed. If a message isn't handled within a minute, the message will be timed out. If a message is handled successfully the bot will react with a "✅".

The responses are identical to a chatGPT window (as it practically IS chatGPT) and will keep track of conversations based on a `gptConversationId` to make sure each group or conversation retains their own message chain.

Use !help to get a list of all the commands. You can enable/disable certain commands by adjusting the `getCommands()` function in `commandHelper.js`

### Features

Following is a global list of all features:

- Whitelist support
- Conversation tracking
- Conversation contexts
- Audio responses
- Image responses (You'll have to supply your own playgroundai.com API key)
- Video responses (You'll have to supply your own runwayml.com API key(s))
- Looped conversations (Wouldn't recommend turning this on. ChatGPT will start talking to itself and responses will get less and less verbose over time.)
# Server

## Usage

### Puppeteer

The server works as a mock chatGPT session where chromium runs puppeteer and accessess the chatGPT backend API using the javascript console. The reason this works is because we're sending requests from the `chat.openai.com` domain.

### Authentication

Initially you'll have to log in using a `chat.openai.com` account but after that re-logging in should only be required once the server isn't running for some amount of time (should be around ~ 30 mins).