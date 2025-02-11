import fs from "fs";
import { PROMPTS_FILE_PATH } from "@/util/file";

export const storePrompt = (
	displayName: string,
	id: string,
	prompt: string,
	response: string,
	requestDuration: number
) => {
	const prompts = fs.readFileSync(PROMPTS_FILE_PATH);

	const promptMap = JSON.parse(prompts.toString());

	promptMap.push({
		displayName,
		id,
		prompt,
		response,
		time: new Date().getTime(),
		requestDuration,
	});

	fs.writeFileSync(PROMPTS_FILE_PATH, JSON.stringify(promptMap, null, 2));
};
