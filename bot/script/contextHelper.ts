import { createFileIfNotExists } from "./fileHelper";
import { logInfo } from "./logHelper";
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const contextMapFilePath = createFileIfNotExists(`${process.cwd()}${process.env.CONTEXTS_PATH}`);

interface ContextEntry {
	id: string;
	context: string;
}

export const addContext = (id: string, context: string) => {

	if(!context || !id) {

		return false;
	}

	const contexts = fs.readFileSync(contextMapFilePath);

	const contextMap: ContextEntry[] = JSON.parse(contexts.toString());

	const contextIds = contextMap.map(context => context.id);

	const contextIndex = contextIds.indexOf(id);

	if (contextIndex === -1) {

		contextMap.push({
			id,
			context,
		});

		logInfo('Adding new context map entry', id, context);

	} else {

		const contextIndex = contextMap.findIndex(context => context.id === id);

		contextMap[contextIndex] = {
			id,
			context,
		};

		logInfo('Updating context map entry', id, context);
	}

	fs.writeFileSync(contextMapFilePath, JSON.stringify(contextMap, null, 2));

	return true;
}

export const clearContext = (id: string) => {

	const contexts = fs.readFileSync(contextMapFilePath);

	const contextMap: ContextEntry[] = JSON.parse(contexts.toString());

	const contextIds = contextMap.map(context => context.id);

	const contextIndex = contextIds.indexOf(id);

	if (contextIndex === -1) {

		return false

	} else {

		contextMap.splice(contextIndex, 1);

		fs.writeFileSync(contextMapFilePath, JSON.stringify(contextMap, null, 2));

		return true;
	}
}

export const getContext = (id: string) => {

	const contexts = fs.readFileSync(contextMapFilePath);

	const contextMap: ContextEntry[] = JSON.parse(contexts.toString());

	const contextIds = contextMap.map(context => context.id);

	const contextIndex = contextIds.indexOf(id);

	if (contextIndex === -1) {

		return null;

	} else {

		return (contextMap[contextIndex] as ContextEntry).context;
	}
}


export const getGlobalContext = async () => {

	const response = await fetch(`${process.env.API_URL}/system-messages`, {
		method: 'GET',
		headers: {
			'content-type': "application/json",
		}
	});

	const responseJson = await response.json();

	console.log({
		req: 'getGlobalContext',
		responseJson,
	})

	if (responseJson.error) {

		if (responseJson.code === 429) {

			throw new Error(`Sorry, Too many requests, try again in a bit 😅.`);
		}

		throw new Error(responseJson.error);
	}

	return responseJson;
}