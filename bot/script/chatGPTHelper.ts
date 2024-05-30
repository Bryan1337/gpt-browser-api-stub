import { logInfo } from './logHelper';
import { getContext } from './contextHelper';
import { ConversationDetails, getLocalResponse } from './requestHelper';
import dotenv from 'dotenv';
/** Handle dotenv configs before importing any other modules */
dotenv.config();

export const getChatGPTResponse = async (prompt: string, conversationDetails: ConversationDetails) => {

	const { whatsappIdentifier } = conversationDetails;

	const context = getContext(whatsappIdentifier);

	if (context) {

		logInfo('Using context:', context);

		prompt = `${context}\n ${prompt}`;
	}

	logInfo('Querying prompt:', prompt);

	return await getLocalResponse(prompt, conversationDetails);
}
