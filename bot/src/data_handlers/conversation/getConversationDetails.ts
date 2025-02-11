import fs from "fs";
import { CONVERSATION_FILE_PATH } from "@/util/file.js";
import { ConversationDetails } from "@/util/request";

export const getConversationDetails = (chatId: string) => {
	const conversations = fs.readFileSync(CONVERSATION_FILE_PATH);

	const conversationMap: ConversationDetails[] = JSON.parse(
		conversations.toString()
	);

	return (
		conversationMap.find(
			(conversation) => conversation.whatsappIdentifier === chatId
		) || {
			whatsappIdentifier: chatId,
		}
	);
};
