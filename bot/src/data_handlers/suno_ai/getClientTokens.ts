import { SUNO_AI_KEYS_FILE_PATH } from "@/util/file";
import fs from "fs";

export const getSessionTokens = (): string[] => {
	const sessions = fs.readFileSync(SUNO_AI_KEYS_FILE_PATH);
	return JSON.parse(sessions.toString());
};
