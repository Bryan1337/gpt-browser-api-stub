import { Message } from "whatsapp-web.js";
import { answerCommandResponse, getCommandData } from "@/util/command";
import { logError, logWarning } from "@/util/log";
import { checkWhitelistStatus } from "@/data_handlers/whitelist/checkWhitelistStatus";
import { reactBlocked, reply } from "@/util/message";

export const messageHandler = async (message: Message) => {
	try {
		const contact = await message.getContact();
		const commandData = getCommandData(message);

		if (!commandData) {
			return;
		}

		const allowed = checkWhitelistStatus(message.from);
		const alwaysAllowed = !!commandData.command.alwaysAllowed;

		if (!allowed && !alwaysAllowed) {
			logWarning(
				"Received message from unregistered user:",
				`(${contact.pushname})`,
				message.from,
				message.body
			);

			reactBlocked(message);
			reply(
				message,
				`Sorry, you are not allowed to use to use the Boy. Message ${process.env.OWNER_ID} for an access key 😌👌.`
			);

			return;
		}

		answerCommandResponse(message);
	} catch (error) {
		logError(error);
	}
};
