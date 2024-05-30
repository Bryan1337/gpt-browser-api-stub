import fs from 'fs';
import { createFileIfNotExists } from './fileHelper';
import { logInfo } from './logHelper';
import dotenv from 'dotenv';
import { ConversationDetails } from './requestHelper.js';

dotenv.config();


const conversationFilePath = createFileIfNotExists(`${process.cwd()}${process.env.CONVERSATIONS_PATH}`);

const promptMapPath = createFileIfNotExists(`${process.cwd()}${process.env.PROMPTS_PATH}`);

export const storePrompt = (displayName: string, id: string, prompt: string, response: string, requestDuration: number) => {

	const prompts = fs.readFileSync(promptMapPath);

	const promptMap = JSON.parse(prompts.toString());

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



export const setConversationDetails = (chatId: string, conversationId: string) => {

	if(!chatId) {

		return;
	}

	const conversations = fs.readFileSync(conversationFilePath);

	const conversationMap: ConversationDetails[] = JSON.parse(conversations.toString());

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

export const getConversationDetails = (chatId: string) => {

	const conversations = fs.readFileSync(conversationFilePath);

	const conversationMap: ConversationDetails[] = JSON.parse(conversations.toString());

	return conversationMap.find(conversation => conversation.whatsappIdentifier === chatId) || {
		whatsappIdentifier: chatId,
	};
}

export const clearAllConversationDetails = () => {

	fs.writeFileSync(conversationFilePath, JSON.stringify([], null, 2));
}