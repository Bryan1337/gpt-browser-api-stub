import fs from "fs";
import { CONVERSATION_FILE_PATH } from "@/util/file";
import { logInfo } from "@/util/log";
import { ConversationDetails } from "@/util/request";

export const setConversationDetails = (
	chatId: string,
	conversationId: string
) => {
	if (!chatId) {
		return;
	}

	const conversations = fs.readFileSync(CONVERSATION_FILE_PATH);

	const conversationMap: ConversationDetails[] = JSON.parse(
		conversations.toString()
	);

	if (
		conversationMap.find(
			(conversation) => conversation.whatsappIdentifier === chatId
		)
	) {
		const conversationIndex = conversationMap.findIndex(
			(conversation) => conversation.whatsappIdentifier === chatId
		);

		logInfo("Updating conversation map entry");

		conversationMap[conversationIndex] = {
			whatsappIdentifier: chatId,
			gptConversationId: conversationId,
		};
	} else {
		logInfo("Adding new conversation map entry");

		conversationMap.push({
			whatsappIdentifier: chatId,
			gptConversationId: conversationId,
		});
	}

	fs.writeFileSync(
		CONVERSATION_FILE_PATH,
		JSON.stringify(conversationMap, null, 2)
	);
};
