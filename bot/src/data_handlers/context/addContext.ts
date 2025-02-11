import fs from "fs";
import { CONTEXT_FILE_PATH } from "@/util/file";
import { logInfo } from "@/util/log";

interface ContextEntry {
	id: string;
	context: string;
}

export const addContext = (id: string, context: string) => {
	if (!context || !id) {
		return false;
	}

	const contexts = fs.readFileSync(CONTEXT_FILE_PATH);
	const contextMap: ContextEntry[] = JSON.parse(contexts.toString());
	const contextIds = contextMap.map((context) => context.id);
	const contextIndex = contextIds.indexOf(id);

	if (contextIndex === -1) {
		contextMap.push({
			id,
			context,
		});

		logInfo("Adding new context map entry", id, context);
	} else {
		const contextIndex = contextMap.findIndex(
			(context) => context.id === id
		);

		contextMap[contextIndex] = {
			id,
			context,
		};

		logInfo("Updating context map entry", id, context);
	}

	fs.writeFileSync(CONTEXT_FILE_PATH, JSON.stringify(contextMap, null, 2));

	return true;
};
