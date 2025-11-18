import { getConversationsResponse } from "@/client/conversation";
import { getMessageId } from "@/util/message";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import { logError, logInfo } from "@/util/log";

export async function conversationsRequest(
	request: Request,
	response: Response
) {
	try {
		logInfo("Received /conversations request...");

		const newMessageId = getMessageId();
		const parentMessageId = uuidv4();

		const params = {
			body: request.body,
			newMessageId,
			parentMessageId,
		};

		const { chatGptPage } = request.pages;

		const conversationsResponse = await chatGptPage.evaluate(
			getConversationsResponse,
			params
		);

		logInfo(
			"Returning evaluationResponse:",
			JSON.stringify(conversationsResponse, null, 2)
		);

		response.json(conversationsResponse);
	} catch (error) {
		logError((error as Error).message);

		response.json({
			error: (error as Error).message,
		});
	}
}
