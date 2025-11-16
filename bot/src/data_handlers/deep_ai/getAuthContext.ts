import { DEEP_AI_AUTH_FILE_PATH } from "@/util/file";
import fs from "fs";

interface DeepAIAuthContext {
	sessionId: string;
	csrfToken: string;
	messagesToken: string;
}

export const getAuth = (): DeepAIAuthContext => {
	const [session] = getAuths();
	return session;
};

export const getAuths = (): DeepAIAuthContext[] => {
	const sessions = fs.readFileSync(DEEP_AI_AUTH_FILE_PATH);
	return JSON.parse(sessions.toString());
};
