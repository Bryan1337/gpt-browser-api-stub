import Queue from 'queue';
import { getConversationDetails, setConversationDetails, storePrompt } from './conversationHelper.js';
import { getChatGPTResponse } from './chatGPTHelper.js';
import { sanitizePrompt } from './messageHelper.js';
import { logError, logInfo } from './logHelper.js';
import WAWebJS from 'whatsapp-web.js';

const queue = new Queue({
	concurrency: 1,
	autostart: true,
	timeout: (60 * 2 * 1000)
});

let messageProxy = null;

queue.addEventListener('timeout', async (error) => {

	logInfo('Job timed out...');

	if(messageProxy) {

		await messageProxy.reply(`🤖 Sorry, The request timed out 😫.`);

		await messageProxy.react('❌');
	}

	error.detail.next();
});

queue.start();

/**
 * @param {WAWebJS.Message} message
 */
export const addMessageToQueue = (message) => {

	messageProxy = message;

	queue.push(async (callback) => {

		logInfo('Handling queue item');

		try {

			await message.react('🕤');

			const chat = await message.getChat();

			await chat.sendStateTyping();

			const formattedPrompt = sanitizePrompt(message.body, `@${process.env.USER_PHONE_ID}`);

			const conversationDetails = getConversationDetails(message.from);

			const responseStartTime = Date.now();

			const response = await getChatGPTResponse(formattedPrompt, conversationDetails);

			const responseEndTime = Date.now();

			const requestDuration = (responseEndTime - responseStartTime);

			setConversationDetails(message.from, response.conversationId, response.messageId);

			await message.reply(`🤖 ${response.promptResponse}`);

			await message.react('✅');

			await chat.clearState();

			logInfo(`Request handled in ${requestDuration / 1000} seconds. Response length: ${response?.promptResponse?.length} characters`);

			storePrompt(
				message._data.notifyName,
				message._data.from,
				formattedPrompt,
				response.promptResponse,
				requestDuration,
			);

		} catch (error) {

			logError(error);

			await message.reply(`🤖 ${error.message}`);

			await message.react('❌');
		}

		callback();
	});
}