import { logInfo } from './logHelper.js';
import { getContext } from './contextHelper.js';

export const getChatGPTResponse = async (prompt, conversationDetails = {}) => {

	const { gptConversationId, gptParentMessageId, whatsappIdentifier } = conversationDetails;

	const context = getContext(whatsappIdentifier);

	if (context) {

		logInfo('Using context:', context);

		prompt = `${context}\n ${prompt}`;
	}

	logInfo('Querying prompt:', prompt);

	const response = await fetch(process.env.API_URL, {
		method: 'POST',
		body: JSON.stringify({
			accessToken: process.env.ACCESS_TOKEN,
			gptConversationId,
			gptParentMessageId,
			prompt,
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	})

	const responseData = await response.json();

	if(responseData.error) {

		logInfo('Error:', responseData.error);

		throw new Error(responseData.error);
	}

	return responseData;
}