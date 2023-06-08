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

	accessToken = await getAccessToken();

	if (!accessToken) {

		setTimeout(async () => {

			await handleAccessToken();

			accessTokenFetchAttempt++;

		}, 3000);
	}
}

handleAccessToken();

server.post('/conversations', async (req, res) => {

	try {

		const evaluationResponse = await newPage.evaluate(async ({ body, newMessageId, newParentMessageId, accessToken }) => {

			const { prompt, gptConversationId } = body;

			let parentMessageId = newParentMessageId;

			if (gptConversationId) {

				try {

					const conversationResponse = await fetch(`https://chat.openai.com/backend-api/conversation/${gptConversationId}`, {
						method: 'GET',
						headers: {
							'authorization': `Bearer ${accessToken}`,
						}
					});

					if (conversationResponse.status === 403) {

						window.location.reload();

						return {
							error: 'Forbidden',
							code: 403,
						}
					}

					if(conversationResponse.status === 401) {

						window.location.reload();

						return;
					}

					const conversationJson = await conversationResponse.json();

					parentMessageId = conversationJson.current_node;


				} catch (error) {

					console.log({
						error
					})
				}
			}

			const response = await fetch('https://chat.openai.com/backend-api/conversation', {
				method: 'POST',
				body: JSON.stringify({
					action: "next",
					messages: [
						{
							id: newMessageId,
							author: {
								role: 'user'
							},
							content: {
								content_type: 'text',
								parts: [prompt]
							}
						}
					],
					conversation_id: gptConversationId,
					parent_message_id: parentMessageId,
					model: 'text-davinci-002-render-sha',
					timezone_offset_min: -120,
					variant_purpose: 'none',
				}),
				headers: {
					'authorization': `Bearer ${accessToken}`,
					'connection': "keep-alive",
					'accept': "text/event-stream",
					'content-type': "application/json",
				}
			})

			if(response.status === 403) {

				window.location.reload();

				return {
					error: 'Forbidden',
					code: 403,
				}
			}

			if (response.status === 413) {

				return {
					error: 'Conversation too long',
					code: 413,
				}
			}

			if(response.status === 429) {

				return {
					error: 'Too many requests',
					code: 429,
				}
			}

			let conversationId = gptConversationId;

			let promptResponse = '';

			const handleChunk = (chunk) => {

				try {

					if (chunk.substring(5).trim() === '[DONE]') {

						return;
					}

					const data = JSON.parse(chunk.substring(5));

					if (data.message.content.parts[0] === promptResponse) {

						return;
					}

					conversationId = data.conversation_id;

					promptResponse = data.message.content.parts[0];

				} catch (error) {

					console.log({
						error
					})

					const chunks = chunk.split('\n\n').filter(Boolean);
					// Sometimes multiple chunks are received at once
					if (chunks.length > 1) {

						for (const chunk of chunks) {

							handleChunk(chunk);
						}
					}
				}
			}

			const readableStream = response.body;
			// Create a TextDecoder to decode the received data
			const decoder = new TextDecoder();
			// Define a function to handle reading from the stream
			const readStream = async (reader) => {

				const { done, value } = await reader.read();

				if (done) {

					return promptResponse;
				}

				// Decode the received chunk of data and do something with it
				const chunk = decoder.decode(value, { stream: true });

				handleChunk(chunk);

				// Continue reading from the stream
				return await readStream(reader);
			};

			// Create a reader for the stream
			const reader = readableStream.getReader();
			// Start reading from the stream

			const finalResponse = await readStream(reader);

			return {
				promptResponse: finalResponse,
				conversationId,
			}

		}, {
			body: req.body,
			newMessageId: uuidv4(),
			newParentMessageId: uuidv4(),
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