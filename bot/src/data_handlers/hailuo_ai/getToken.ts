import fs from "fs";
import { HAILUO_AI_TOKENS_PATH } from "@/util/file";

export const getToken = async () => {
	const tokens = fs.readFileSync(HAILUO_AI_TOKENS_PATH);

	const tokenMap = JSON.parse(tokens.toString());

	const [token] = tokenMap;

	if (!token) {
		throw new Error("No tokens available");
	}

	return token;
};
