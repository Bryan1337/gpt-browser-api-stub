import {
	getConversationDetails,
	setConversationDetails,
	storePrompt,
} from "./conversationHelper";
import { getChatGPTResponse } from "./chatGPTHelper";
import { sanitizePrompt } from "./messageHelper";
import { logError, logInfo } from "./logHelper";
import { getAudioData, getAudioFilePath, removeAudioFile } from "./ttsHelper";
import { getMessageMediaFromFilePath } from "./whatsappHelper";
import Queue from "queue";
import { Message, MessageSendOptions } from "whatsapp-web.js";

const queue = new Queue({
	concurrency: 1,
	autostart: true,
	timeout: 60 * 2 * 1000,
});

const maxAttempts = 5;
const itemAttemptDelay = 3000;

let messageProxy: Message | null = null;

queue.addEventListener("timeout", (error) => {
	logInfo("Job timed out...");

	if (messageProxy) {
		messageProxy.reply(`🤖 Sorry, The request timed out 😫.`);

		messageProxy.react("❌");
	}

	error.detail.next();
});

queue.start();

const handleQueueItem = async (message: Message, attempt = 1) => {
	logInfo("Handling queue item");

	let modelEmoji = "🤖";

	try {
		const remoteId = message.id.remote;

		const chat = await message.getChat();

		await chat.sendStateTyping();

		const formattedPrompt = sanitizePrompt(
			message.body,
			`@${process.env.USER_PHONE_ID}`
		);

		const conversationDetails = getConversationDetails(remoteId);

		const responseStartTime = Date.now();

		const [
			response,
			// responseImageBase64Data
		] = await Promise.all([
			getChatGPTResponse(formattedPrompt, conversationDetails),
			// getAiImageBase64(formattedPrompt)
		]);

		setConversationDetails(remoteId, response.chatConversationId);

		const audioData = await getAudioData(remoteId);

		if (audioData) {
			const audio = await getAudioFilePath(
				response.promptResponse,
				audioData.language
			);

			const audioReply = getMessageMediaFromFilePath(audio);

			await message.reply(audioReply);

			await removeAudioFile(audio);
		} else {
			let messageProps: MessageSendOptions = {};

			// if (responseImageBase64Data.image) {

			// 	const messageMedia = getMessageMediaFromBase64('image/jpeg', responseImageBase64Data.image.split(',')[1]);

			// 	messageProps.media = messageMedia
			// }

			if (response.modelSlug === "gpt-4o") {
				modelEmoji = "👾";
			}

			await message.reply(
				`${modelEmoji} ${response.promptResponse}`,
				undefined,
				messageProps
			);
		}

		const responseEndTime = Date.now();

		const requestDuration = responseEndTime - responseStartTime;

		await message.react("✅");

		await chat.clearState();

		logInfo(
			`Request handled in ${
				requestDuration / 1000
			} seconds. Response length: ${
				response?.promptResponse?.length
			} characters`
		);

		const contact = await message.getContact();

		storePrompt(
			contact.pushname,
			remoteId,
			formattedPrompt,
			response.promptResponse,
			requestDuration
		);
	} catch (error) {
		logError(
			`Error handling queue item (attempt ${attempt})`,
			error as string
		);

		if (attempt < maxAttempts) {
			await new Promise((resolve) => {
				setTimeout(async () => {
					await handleQueueItem(message, attempt + 1);

					resolve(true);
				}, itemAttemptDelay);
			});

			return;
		}

		await message.reply(
			`${modelEmoji} Oops, something went wrong 😫 (${maxAttempts} attempts).`
		);

		await message.react("❌");
	}
};

export const addMessageToQueue = (message: Message) => {
	messageProxy = message;

	queue.push(async (callback) => {
		await message.react("🕤");

		await handleQueueItem(message);

		callback?.();
	});
};
