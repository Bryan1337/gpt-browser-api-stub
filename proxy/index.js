import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { executablePath } from 'puppeteer';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from "uuid";

dotenv.config();

puppeteer.use(StealthPlugin());

const browser = await puppeteer.launch({
	headless: false,
	executablePath: executablePath(),
	userDataDir: process.env.TMP_FOLDER,
	args: ['--auto-open-devtools-for-tabs']
});

const [ newPage ] = await browser.pages();

let chatUrl = 'https://chat.openai.com/chat';

if(process.env.CONVERSATION_ID) {

	chatUrl = `https://chat.openai.com/c/${process.env.CONVERSATION_ID}`;
}

await newPage.goto(chatUrl, { waitUntil: 'networkidle2'});

const server = express();

server.use(express.json());

server.use(cors());

server.use((err, req, res, next) => {

	res.header(
		'Access-Control-Allow-Origin',
		'*'
	);

	res.header(
		'Access-Control-Allow-Methods',
		'GET, POST, OPTIONS, PUT, PATCH, DELETE'
	);

	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept'
	);

	next();
});


const getAccessToken = async () => {

	return await newPage.evaluate(async () => {

		const response = await fetch('https://chat.openai.com/api/auth/session');

		try {

			const jsonResponse = await response.json();

			return jsonResponse.accessToken;

		} catch (error) {

			console.log({
				error
			})

			return false;
		}
	})
}

let accessToken;

let accessTokenFetchAttempt = 1;

const handleAccessToken = async () => {

	console.log(`Attempt ${accessTokenFetchAttempt} to fetch access token...`);

	try {

		accessToken = await getAccessToken();

	if (!accessToken) {

		const timeout = setTimeout(async () => {

			await handleAccessToken();

			clearTimeout(timeout);

			accessTokenFetchAttempt++;

		}, 3000);
	}

	} catch (error) {

		console.warn(error);
	}
}

handleAccessToken();

server.post('/conversations', async (req, res) => {

	try {

		const evaluationResponse = await newPage.evaluate(async ({ body, newMessageId, newParentMessageId, newWebsocketRequestId, accessToken }) => {

			const { prompt, gptConversationId } = body;

			let parentMessageId = newParentMessageId;

			try {

				const conversationResponse = await fetch(`https://chat.openai.com/backend-api/conversation/${gptConversationId}`, {
					method: 'GET',
					headers: {
						'authorization': `Bearer ${accessToken}`,
					}
				});

				const conversationJson = await conversationResponse.json();

				parentMessageId = conversationJson.current_node;

			} catch (error) {

				console.log({
					error
				})
			}

			console.log({
				prompt
			})

			const conversationResponse = await fetch(`https://chat.openai.com/backend-api/conversation`, {
				method: 'POST',
				headers: {
					'authorization': `Bearer ${accessToken}`,
					'accept': 'text/event-stream',
					'content-type': 'application/json',
					'oai-device-id': 'e48838ed-1670-4b27-b740-356990ffe4dc',
					'oai-language': 'en-US'
				},
				body: JSON.stringify({
					"action": "next",
					"messages": [
						{
							"id": newMessageId,
							"author": {
								"role": "user"
							},
							"content": {
								"content_type": "text",
								"parts": [
									prompt
								]
							},
							"metadata": {}
						}
					],
					"conversation_id": gptConversationId,
					"parent_message_id": parentMessageId,
					"model": "text-davinci-002-render-sha",
					"timezone_offset_min": -60,
					"suggestions": [],
					"history_and_training_disabled": false,
					"conversation_mode": {
						"kind": "primary_assistant",
						"plugin_ids": null
					},
					"force_paragen": false,
					"force_rate_limit": false,
					"websocket_request_id": newWebsocketRequestId,
				})
			});

			const conversationJson = await conversationResponse.json();

			const {
				conversation_id,
				expires_at,
				response_id,
				websocket_request_id,
				wss_url,
			} = conversationJson;

			const ws = new WebSocket(wss_url);

			try {

				const responseMessage = await new Promise((resolve, reject) => {

					const failTimeout = setTimeout(() => {

						reject("Request timed out after 30 seconds...");

					}, 30e3);

					let totalMessage = "";

					ws.addEventListener('message', async ({ data }) => {

						const jsonData = JSON.parse(data);

						const { body } = jsonData;

						const responseDataString = atob(body).replace("data: ", "");

						if(responseDataString.trim() === '[DONE]') {

							clearTimeout(failTimeout);

							resolve(totalMessage);

							return;
						}

						const responseDataObject = JSON.parse(responseDataString);

						totalMessage = responseDataObject.message.content.parts[0];
					})
				})

				console.log({
					responseMessage
				})

				return {
					promptResponse: responseMessage,
					conversationId: conversation_id,
				}

			} catch (error) {

				console.log({
					error
				})

				return {
					error,
					conversationId: conversation_id,
				}
			}

		}, {
			body: req.body,
			newMessageId: uuidv4(),
			newParentMessageId: uuidv4(),
			newWebsocketRequestId: uuidv4(),
			accessToken,
		});

		res.json(evaluationResponse);

	} catch (error) {

		console.log({
			error
		})

		res.json({
			error: error.message,
		});
	}
});

server.listen(process.env.PORT, () => {

	console.log(`Passthrough API running on port ${process.env.PORT}`);
});

const getRandomValueBetween = (min, max) => {

	return Math.random() * (max - min) + min;
}

setTimeout(async () => {

	await newPage.evaluate(() => {
		// Reload the page every 5-10 minutes to prevent any tokens from expiring
		window.location.reload();
	});

}, getRandomValueBetween(5 * 60e3, 10 * 60e3))