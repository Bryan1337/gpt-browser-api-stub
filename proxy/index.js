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

setInterval(() => {

	newPage.evaluate(() => {

		const textField = window.document.querySelector(`[placeholder="Send a message..."]`);

		textField.click('Keepalive...');

		console.log('Clicked text field...')
	})

}, 5000);

await newPage.goto('https://chat.openai.com/chat');

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

server.post('/conversations', async (req, res) => {

	try {

		const newMessageId = uuidv4();

		const evaluationResponse = await newPage.evaluate(async ({ body, newMessageId, }) => {

			const { accessToken, prompt, gptConversationId, gptParentMessageId } = body;

			const response = await fetch('https://chat.openai.com/backend-api/conversation', {
				method: 'POST',
				body: JSON.stringify({
					action: "next",
					parent_message_id: gptParentMessageId,
					conversation_id: gptConversationId,
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
					model: 'text-davinci-002-render-sha',
					timezone_offset_min: -120,
				}),
				headers: {
					'authorization': `Bearer ${accessToken}`,
					'connection': "keep-alive",
					'accept': "text/event-stream",
					'content-type': "application/json",
				}
			})

			console.log({
				response
			})

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

					promptResponse = data.message.content.parts[0];

				} catch (error) {

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
				messageId: newMessageId,
			}

		}, {
			body: req.body,
			newMessageId,
		});

		res.json(evaluationResponse);

	} catch (error) {

		console.log({
			error
		})

		res.status(500).json({
			error: error.message,
		});
	}
});

server.listen(process.env.PORT, () => {

	console.log(`Proxy server running on port ${process.env.PORT}`);
});