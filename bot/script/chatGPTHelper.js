import { logInfo } from './logHelper.js';
import { getContext } from './contextHelper.js';
import { getLocalResponse } from './requestHelper.js';
import dotenv from 'dotenv';
/** Handle dotenv configs before importing any other modules */
dotenv.config();

export const getChatGPTResponse = async (prompt, conversationDetails = {}) => {

	const { whatsappIdentifier } = conversationDetails;

	const context = getContext(whatsappIdentifier);

	if (context) {

		logInfo('Using context:', context);

		prompt = `${context}\n ${prompt}`;
	}

	logInfo('Querying prompt:', prompt);

	return await getLocalResponse(prompt, conversationDetails);
}
