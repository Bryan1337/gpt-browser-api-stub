import { getConversationDetails, setConversationDetails, storePrompt } from './conversationHelper.js';
import { getChatGPTResponse } from './chatGPTHelper.js';
import { sanitizePrompt } from './messageHelper.js';
import { logError, logInfo } from './logHelper.js';
import WAWebJS from 'whatsapp-web.js';
import { isLooping } from './loopHelper.js';
import { getAudioData, getAudioFilePath } from './ttsHelper.js';
import { getMessageMediaFromFilePath } from './whatsappHelper.cjs';
import Queue from 'queue';

const queue = new Queue({
	concurrency: 1,
	autostart: true,
	timeout: (60 * 2 * 1000),
});

const maxAttempts = 3;
const itemAttemptDelay = 3000;

let messageProxy = null;

queue.addEventListener('timeout', async (error) => {

	logInfo('Job timed out...');

	if (messageProxy) {

		await messageProxy.reply(`🤖 Sorry, The request timed out 😫.`);

		await messageProxy.react('❌');
	}

	error.detail.next();
});

queue.start();

/**
 * @param {WAWebJS.Message} message
 */
const handleQueueItem = async (message, attempt = 1) => {

	logInfo('Handling queue item');

	try {

		const remoteId = message.id.remote._serialized || message.id.remote;

		const chat = await message.getChat();

		await chat.sendStateTyping();

		const formattedPrompt = sanitizePrompt(message.body, `@${process.env.USER_PHONE_ID}`);

		const conversationDetails = getConversationDetails(remoteId);

		const responseStartTime = Date.now();

		const response = await getChatGPTResponse(formattedPrompt, conversationDetails);

		const responseEndTime = Date.now();

		const requestDuration = (responseEndTime - responseStartTime);

		setConversationDetails(remoteId, response.conversationId, response.messageId);

		const audioData = await getAudioData(remoteId);

		let reply = `🤖 ${response.promptResponse}`;

		if (audioData) {

			const audio = await getAudioFilePath(response.promptResponse, audioData.language);

			reply = getMessageMediaFromFilePath(audio);
		}

		await message.reply(reply);

		await message.react('✅');

		await chat.clearState();

		logInfo(`Request handled in ${requestDuration / 1000} seconds. Response length: ${response?.promptResponse?.length} characters`);

		storePrompt(
			message._data.notifyName,
			remoteId,
			formattedPrompt,
			response.promptResponse,
			requestDuration,
		);

		// if (isLooping(remoteId)) {

		// 	newMessage.body = response.promptResponse;

		// 	await addMessageToQueue(newMessage);
		// }

	} catch (error) {

		logError(`Error handling queue item (attempt ${attempt})`, error);

		if(attempt < maxAttempts) {

			await new Promise((resolve) => {

				setTimeout(async () => {

					await handleQueueItem(message, attempt + 1);

					resolve();

				}, itemAttemptDelay);
			})

			return;
		}

		await message.reply(`🤖 Oops, something went wrong 😫 (${maxAttempts} attempts).`);

		await message.react('❌');
	}
}

/**
 * @param {WAWebJS.Message} message
 */
export const addMessageToQueue = (message) => {

	messageProxy = message;

	queue.push(async (callback) => {

		await message.react('🕤');

		await handleQueueItem(message);

		callback();
	});
}