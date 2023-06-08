import fs from 'fs';
import { createFileIfNotExists } from './fileHelper.js';
import { logInfo } from './logHelper.js';
import dotenv from 'dotenv';

dotenv.config();


const conversationFilePath = `${process.cwd()}${process.env.CONVERSATIONS_PATH}`;

const promptMapPath = `${process.cwd()}${process.env.PROMPTS_PATH}`;

createFileIfNotExists(conversationFilePath);

createFileIfNotExists(promptMapPath);

export const storePrompt = (displayName, id, prompt, response, requestDuration) => {

	const prompts = fs.readFileSync(promptMapPath);

	const promptMap = JSON.parse(prompts);

	promptMap.push({
		displayName,
		id,
		prompt,
		response,
		time: new Date().getTime(),
		requestDuration,
	})

	fs.writeFileSync(promptMapPath, JSON.stringify(promptMap, null, 2));
}

export const setConversationDetails = (chatId, conversationId) => {

	if(!chatId) {

		return;
	}

	const conversations = fs.readFileSync(conversationFilePath);

	const conversationMap = JSON.parse(conversations);

	if(conversationMap.find(conversation => conversation.whatsappIdentifier === chatId)) {

		const conversationIndex = conversationMap.findIndex(conversation => conversation.whatsappIdentifier === chatId);

		logInfo('Updating conversation map entry');

		conversationMap[conversationIndex] = {
			whatsappIdentifier: chatId,
			gptConversationId: conversationId,
		};

	} else {

		logInfo('Adding new conversation map entry');

		conversationMap.push({
			whatsappIdentifier: chatId,
			gptConversationId: conversationId,
		});

	}

	fs.writeFileSync(conversationFilePath, JSON.stringify(conversationMap, null, 2));
}

export const getConversationDetails = (chatId) => {

	const conversations = fs.readFileSync(conversationFilePath);

	const conversationMap = JSON.parse(conversations);

	return conversationMap.find(conversation => conversation.whatsappIdentifier === chatId) || {};
}