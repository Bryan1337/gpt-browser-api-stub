import dotenv from "dotenv";
/** Handle dotenv configs before importing any other modules */
dotenv.config();

export interface ConversationDetails {
	gptConversationId?: string;
	whatsappIdentifier: string;
}

export const getLocalResponse = async (
	prompt: string,
	conversationDetails: ConversationDetails
) => {
	const { gptConversationId } = conversationDetails;

	const response = await fetch(`${process.env.API_URL}`, {
		method: "POST",
		body: JSON.stringify({
			prompt,
			gptConversationId,
		}),
		headers: {
			"content-type": "application/json",
			// 'Authorization': `Bearer ${someServerToken}`,
		},
	});

	const responseJson = await response.json();

	if (responseJson.error) {
		throw new Error(responseJson.error);
	}

	return responseJson;
};
