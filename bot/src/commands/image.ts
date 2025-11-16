import { CommandHandleData } from "@/util/command";
import { generateDeepAiImage } from "@/util/deepAi";
import { logError } from "@/util/log";
import { getMessageMediaFromUrl } from "@/util/whatsappWeb";
import { MessageSendOptions } from "whatsapp-web.js";

export const imageCommand = async (commandData: CommandHandleData) => {
	const { text, message } = commandData;

	await message.react("🖼️");

	try {
		const imageUrl = await generateDeepAiImage(text.trim());
		const media = await getMessageMediaFromUrl(imageUrl);

		const messageProps: MessageSendOptions = { media };
		const messageText = `*_"${`${text}`.trim()}"_*`;

		message.react("✅");
		message.reply(messageText, undefined, messageProps);
	} catch (error) {
		logError(error);

		message.react("❌");
		message.reply(`🤖 Something went wrong (${(error as Error).message})`);
	}
};
