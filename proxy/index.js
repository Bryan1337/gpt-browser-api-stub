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

const newPage = await browser.newPage();

let chatUrl = 'https://chat.openai.com/chat';

if(process.env.CONVERSATION_ID) {

	chatUrl = `https://chat.openai.com/c/${process.env.CONVERSATION_ID}`;
}

await newPage.goto(chatUrl);

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

const defaultDelay = 5 * 60e3;

const getRandomInterval = () => {

	return defaultDelay + Math.floor(Math.random() * defaultDelay);
}

let randomInterval = getRandomInterval();

setInterval(async () => {

	await newPage.evaluate(() => {

		// const refreshButton = window.document.querySelector('.btn-neutral') || window.document.querySelector('.btn-primary');
		window.location.reload();
		// refreshButton.click();
	});

	randomInterval = getRandomInterval();

}, randomInterval);

const accessToken = await newPage.evaluate(async () => {

	const response = await fetch('https://chat.openai.com/api/auth/session');

	const jsonResponse = await response.json();

	return jsonResponse.accessToken;
})

server.post('/conversations', async (req, res) => {

	try {

		const newMessageId = uuidv4();

		const newParentMessageId = uuidv4();

		const evaluationResponse = await newPage.evaluate(async ({ body, newMessageId, newParentMessageId, accessToken }) => {

			const { prompt, gptConversationId, gptParentMessageId } = body;

			let parentMessageId = gptParentMessageId || newParentMessageId;

			if (gptConversationId) {

				const conversationResponse = await fetch(`https://chat.openai.com/backend-api/conversation/${gptConversationId}`, {
					method: 'GET',
					headers: {
						'authorization': `Bearer ${accessToken}`,
					}
				});

				const conversationJson = await conversationResponse.json();

				parentMessageId = conversationJson.current_node;
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

			let conversationId = gptConversationId;

			let messageId = newMessageId;

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

					messageId = data.message.id;

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
				messageId,
				conversationId,
			}

		}, {
			body: req.body,
			newMessageId,
			newParentMessageId,
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

	console.log(`Proxy server running on port ${process.env.PORT}`);
});