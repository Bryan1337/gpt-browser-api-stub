import { createFileIfNotExists } from "./fileHelper.js";
import { logInfo } from "./logHelper.js";
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const contextMapFilePath = `${process.cwd()}${process.env.CONTEXTS_PATH}`;

createFileIfNotExists(contextMapFilePath);

export const addContext = (id, context) => {

	if(!context || !id) {

		return false;
	}

	const contexts = fs.readFileSync(contextMapFilePath);

	const contextMap = JSON.parse(contexts);

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

export const clearContext = (id) => {

	const contexts = fs.readFileSync(contextMapFilePath);

	const contextMap = JSON.parse(contexts);

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

export const getContext = (id) => {

	const contexts = fs.readFileSync(contextMapFilePath);

	const contextMap = JSON.parse(contexts);

	const contextIds = contextMap.map(context => context.id);

	const contextIndex = contextIds.indexOf(id);

	if (contextIndex === -1) {

		return null;

	} else {

		return contextMap[contextIndex].context;
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

export const setGlobalUserContext = async (userContext) => {

	const globalContext = await getGlobalContext();

	const response = await fetch(`${process.env.API_URL}/system-messages`, {
		method: 'POST',
		headers: {
			'content-type': "application/json",
		},
		body: JSON.stringify({
			aboutUserMessage: userContext,
			aboutModelMessage: globalContext.about_model_message,
		})
	});

	const responseJson = await response.json();

	console.log({
		req: 'setGlobalUserContext',
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

export const setGlobalSystemContext = async (modelContext) => {

	const globalContext = await getGlobalContext();

	const response = await fetch(`${process.env.API_URL}/system-messages`, {
		method: 'POST',
		headers: {
			'content-type': "application/json",
		},
		body: JSON.stringify({
			aboutUserMessage: globalContext.about_user_message,
			aboutModelMessage: modelContext
		})
	});

	const responseJson = await response.json();

	console.log({
		req: 'setGlobalSystemContext',
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

export const clearGlobalContext = async () => {

	const response = await fetch(`${process.env.API_URL}/system-messages`, {
		method: 'POST',
		headers: {
			'content-type': "application/json",
		},
		body: JSON.stringify({
			aboutUserMessage: "",
			aboutModelMessage: "",
		})
	});

	const responseJson = await response.json();

	console.log({
		req: 'clearGlobalContext',
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