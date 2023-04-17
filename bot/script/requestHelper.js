import { v4 as uuidv4 } from "uuid";
import dotenv from 'dotenv';
/** Handle dotenv configs before importing any other modules */
dotenv.config();

export const getResponse = async (prompt, conversationDetails) => {

	const { gptConversationId, gptParentMessageId } = conversationDetails;

	const newMessageId = uuidv4();

	const response = await fetch(process.env.REVERSE_PROXY_URL, {
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
			'authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
			'connection': "keep-alive",
			'accept': "text/event-stream",
			'content-type': "application/json",
		}
	})

	console.log({
		response
	})

	if (response.status === 413) {

		console.log({
			response
		})

		throw new Error(`Sorry, conversation too long, tell someone to clear it 😅.`);
	}

	if (response.status === 429) {

		console.log({
			response
		})

		throw new Error(`Sorry, Too many requests, try again in a bit 😅.`);
	}

	let promptResponse = '';

	let conversationId = gptConversationId;

	const handleChunk = (chunk) => {

		try {

			if (chunk.substring(5).trim() === '[DONE]') {

				return;
			}

			const data = JSON.parse(chunk.substring(5));

			conversationId = data.conversation_id;

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
		conversationId,
		promptResponse: finalResponse,
		messageId: newMessageId,
	}
}