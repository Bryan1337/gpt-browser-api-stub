import { Message } from "whatsapp-web.js";
import { logError, logWarning } from "@/util/log";
import { checkWhitelistStatus } from "@/data_handlers/whitelist/checkWhitelistStatus";
import { reactBlocked, reply } from "@/util/message";
import { answerCommandResponse, getCommandData } from "@/command";

export const messageHandler = async (message: Message) => {
	try {
		const contact = await message.getContact();
		const commandData = getCommandData(message);

		if (!commandData) {
			return;
		}

		const allowed = checkWhitelistStatus(message.from);
		const alwaysAllowed = !!commandData.command.alwaysAllowed;

		if (allowed || alwaysAllowed) {
			answerCommandResponse(message);
		} else {
			logWarning(
				"Received message from unregistered user:",
				`(${contact.pushname})`,
				message.from,
				message.body,
			);

			reactBlocked(message);

			const blockedMessage = "Sorry, you are not allowed to use to use the Boy.";

			if (!process.env.OWNER_ID) {
				reply(message, blockedMessage);
			} else {
				reply(
					message,
					`${blockedMessage} Message ${process.env.OWNER_ID} for an access key 😌👌.`,
				);
			}
		}
	} catch (error) {
		logError(error);
	}
};
