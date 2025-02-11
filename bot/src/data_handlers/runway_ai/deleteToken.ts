import { RUNWAY_AI_KEYS_FILE_PATH } from "@/util/file";
import fs from "fs";

export const deleteToken = async (token: string) => {
	const tokens = fs.readFileSync(RUNWAY_AI_KEYS_FILE_PATH);

	const tokenMap = JSON.parse(tokens.toString());

	const index = tokenMap.indexOf(token);

	if (index > -1) {
		tokenMap.splice(index, 1);

		fs.writeFileSync(RUNWAY_AI_KEYS_FILE_PATH, JSON.stringify(tokenMap));
	}
};
