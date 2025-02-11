import { CONVERSATION_FILE_PATH } from "@/util/file";
import fs from "fs";

export const clearAllConversationDetails = () => {
	fs.writeFileSync(CONVERSATION_FILE_PATH, JSON.stringify([], null, 2));
};
