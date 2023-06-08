import { v4 as uuidv4 } from "uuid";
import dotenv from 'dotenv';
/** Handle dotenv configs before importing any other modules */
dotenv.config();

export const getLocalResponse = async ( prompt, conversationDetails ) => {

	const { gptConversationId } = conversationDetails;

	const response = await fetch(process.env.API_URL, {
		method: 'POST',
		body: JSON.stringify({
			prompt,
			accessToken: process.env.ACCESS_TOKEN,
			gptConversationId,
		}),
		headers: {
			'content-type': "application/json",
		}
	});

	const responseJson = await response.json();

	if (responseJson.error) {

		if (responseJson.code === 413) {

			throw new Error(`Sorry, conversation too long, tell someone to clear it 😅.`);
		}

		if (responseJson.code === 429) {

			throw new Error(`Sorry, Too many requests, try again in a bit 😅.`);
		}

		throw new Error(responseJson.error);
	}

	return responseJson;
}