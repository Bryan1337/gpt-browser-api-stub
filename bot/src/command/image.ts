import { CommandHandleData } from "@/command";
import { generateDeepAiImage } from "@/util/deepAi";
import { logError } from "@/util/log";
import { reactError, reactImage, reactSuccess, reply, replyWithMedia } from "@/util/message";
import { getMessageMediaFromUrl } from "@/util/whatsappWeb";

export const imageCommand = async (commandData: CommandHandleData) => {
	const { text, message } = commandData;

	await reactImage(message);

	try {
		const imageUrl = await generateDeepAiImage(text.trim());
		const media = await getMessageMediaFromUrl(imageUrl);

		const messageProps = { media };
		const messageText = `*_"${`${text}`.trim()}"_*`;

		reactSuccess(message);
		replyWithMedia(message, messageText, messageProps);
	} catch (error) {
		logError(error);
		reactError(message);
		reply(message, `Something went wrong (${error})`);
	}
};
