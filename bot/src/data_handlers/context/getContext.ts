import fs from "fs";
import { CONTEXT_FILE_PATH } from "@/util/file";

interface ContextEntry {
	id: string;
	context: string;
}

export const getContext = (id: string) => {
	const contexts = fs.readFileSync(CONTEXT_FILE_PATH);
	const contextMap: ContextEntry[] = JSON.parse(contexts.toString());
	const contextIds = contextMap.map((context) => context.id);
	const contextIndex = contextIds.indexOf(id);

	if (contextIndex === -1) {
		return null;
	} else {
		return (contextMap[contextIndex] as ContextEntry).context;
	}
};
