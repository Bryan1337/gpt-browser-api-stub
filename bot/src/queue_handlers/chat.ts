import { getConversationDetails } from "@/data_handlers/conversation/getConversationDetails";
import { setConversationDetails } from "@/data_handlers/conversation/setConversationDetails";
import { hasAudioEnabled } from "@/data_handlers/enabled_audio/getAudioData";
import { getAudioLanguage } from "@/data_handlers/enabled_audio/getAudioLanguage";
import { removeAudioFile } from "@/data_handlers/enabled_audio/removeAudioFile";
import { storePrompt } from "@/data_handlers/prompt/storePrompt";
import { getChatGPTResponse } from "@/util/chatGPT";
import { CommandHandleData } from "@/util/command";
import { logError, logInfo } from "@/util/log";
import {
	reactError,
	reactPending,
	reactSuccess,
	reply,
	replyWithMessageMedia
} from "@/util/message";
import { getTTSAudioFilePath } from "@/util/tts";
import { getMessageMediaFromFilePath } from "@/util/whatsappWeb";

export const handleChatQueueItem = async (
	commandData: CommandHandleData,
	attempt = 1,
	maxAttempts = 10,
	delayBetweenAttempts = 5e3
) => {
	const { message, text } = commandData;
	const { remote } = message.id;

	const responseStartTime = Date.now();

	try {
		await reactPending(message);

		const chat = await message.getChat();
		const contact = await message.getContact();

		const conversationDetails = getConversationDetails(remote);
		const promptWithSender = `[${contact.pushname}]: ${text}`;

		const response = await getChatGPTResponse(
			promptWithSender,
			conversationDetails
		);

		setConversationDetails(remote, response.chatConversationId);

		const audioEnabled = await hasAudioEnabled(remote);

		if (audioEnabled) {
			const language = getAudioLanguage(remote);
			const audio = await getTTSAudioFilePath(response.answer, language);
			const audioReply = getMessageMediaFromFilePath(audio);

			await replyWithMessageMedia(message, audioReply);
			await removeAudioFile(audio);
		} else {
			logInfo(`Received response from model: ${response.modelSlug}`);

			const finalResponseMessage = response.error ?? response.answer;

			await reply(
				message,
				`(${response.modelSlug})\n\n${finalResponseMessage}`
			);
		}

		const responseEndTime = Date.now();
		const requestDuration = responseEndTime - responseStartTime;

		await reactSuccess(message);
		await chat.clearState();

		const requestDurationInSeconds = requestDuration / 1000;
		const responseLength = response.answer.length;

		logInfo(
			`Request handled in ${requestDurationInSeconds} seconds. Response length: ${responseLength} characters.`
		);

		storePrompt(
			contact.pushname,
			remote,
			text,
			response.answer,
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
					await handleChatQueueItem(
						commandData,
						attempt + 1,
						maxAttempts,
						delayBetweenAttempts
					);

					resolve(true);
				}, delayBetweenAttempts);
			});

			return;
		}

		reactError(message);
		reply(message, `Something went wrong (${error})`);
	}
};
