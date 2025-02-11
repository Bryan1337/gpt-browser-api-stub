import fs from "fs";
import { RUNWAY_AI_KEYS_FILE_PATH } from "@/util/file";

export const getToken = async () => {
	const tokens = fs.readFileSync(RUNWAY_AI_KEYS_FILE_PATH);

	const tokenMap = JSON.parse(tokens.toString());

	const [token] = tokenMap;

	if (!token) {
		throw new Error("No tokens available");
	}

	return token;
};
