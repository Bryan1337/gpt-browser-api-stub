import dotenv from "dotenv";
dotenv.config();
import { logError } from "./log";

export interface ConversationDetails {
	gptConversationId?: string;
	whatsappIdentifier: string;
}

export const getLocalChatResponse = async (
	prompt: string,
	conversationDetails: ConversationDetails
) => {
	const { gptConversationId } = conversationDetails;

	const response = await fetch(`${process.env.API_URL}/conversations`, {
		method: "POST",
		body: JSON.stringify({
			prompt,
			gptConversationId
		}),
		headers: {
			"content-type": "application/json"
			// 'Authorization': `Bearer ${someServerToken}`,
		}
	});

	const responseJson = await response.json();

	if (responseJson.error) {
		logError(responseJson.error);
		throw new Error(responseJson.error);
	}

	return responseJson;
};

export const getLocalVideoResponse = async (prompt: string) => {
	const response = await fetch(`${process.env.API_URL}/video`, {
		method: "POST",
		body: JSON.stringify({
			prompt
		}),
		headers: {
			"content-type": "application/json"
			// 'Authorization': `Bearer ${someServerToken}`,
		}
	});

	const responseJson = await response.json();

	if (responseJson.error) {
		logError(responseJson.error);
		throw new Error(responseJson.error);
	}

	return responseJson;
};

export const getLocalPendingVideoResponse = async (taskId: string) => {
	const response = await fetch(
		`${process.env.API_URL}/pending?taskId=${taskId}`,
		{
			method: "GET",
			headers: {
				"content-type": "application/json"
			}
		}
	);

	const responseJson = await response.json();

	if (responseJson.error) {
		logError(responseJson.error);
		throw new Error(responseJson.error);
	}

	return responseJson;
};

export const getLocalDraftVideoResponse = async (taskId: string) => {
	const response = await fetch(
		`${process.env.API_URL}/draft?taskId=${taskId}`,
		{
			method: "GET",
			headers: {
				"content-type": "application/json"
			}
		}
	);

	const responseJson = await response.json();

	if (responseJson.error) {
		logError(responseJson.error);
		throw new Error(responseJson.error);
	}

	return responseJson;
};
