import { Message } from "whatsapp-web.js";
import { answerCommandResponse, isCommandMessage } from "@/util/command";
import { addMessageToQueue } from "@/util/queue";
import { isRequestMessage } from "@/util/whatsappWeb";
import { logError, logWarning } from "@/util/log";
import { checkWhitelistStatus } from "@/data_handlers/whitelist/checkWhitelistStatus";
import dotenv from "dotenv";
dotenv.config();

export const messageHandler = async (message: Message) => {
	try {
		if (isCommandMessage(message)) {
			const commandResponse = await answerCommandResponse(message);

			if (commandResponse) {
				await message.react("✅");

				return;
			}
		} else if (!checkWhitelistStatus(message.from)) {
			const contact = await message.getContact();

			logWarning(
				"Received message from unregistered user:",
				`(${contact.pushname})`,
				message.from,
				message.body
			);

			await message.reply(
				`🤖 Sorry, you are not allowed to use to use the Boy. Message ${process.env.OWNER_ID} for an access key 😌👌.`
			);

			await message.react("🚫");

			return;
		} else if (isRequestMessage(message)) {
			message.react("💤");

			addMessageToQueue(message);
		} else {
			logWarning("Unknown message", message);
		}
	} catch (error) {
		logError(error);
	}
};
