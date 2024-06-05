import dotenv from "dotenv";
/** Handle dotenv configs before importing any other modules */
dotenv.config();

import qrcode from "qrcode-terminal";
import { getWhatsappClient } from "./script/whatsappHelper";
import { checkWhitelistStatus } from "./script/whitelistHelper";
import {
	answerCommandResponse,
	isCommandMessage,
} from "./script/commandHelper";
import { addMessageToQueue } from "./script/queueHelper";
import { logInfo, logWarning } from "./script/logHelper";
import { Message } from "whatsapp-web.js";
import { isRequestMessage } from "script/messageHelper";

const client = getWhatsappClient();

client.on("qr", (qr) => {
	qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
	logInfo("Client is ready!");
});

client.on("authenticated", () => {
	logInfo("Authenticated!");
});

client.on("message", async (message: Message) => {
	if (!checkWhitelistStatus(message.from)) {
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
	}

	if (isCommandMessage(message)) {
		const commandResponse = await answerCommandResponse(message);

		if (commandResponse) {
			await message.react("✅");

			return;
		}
	}

	if (isRequestMessage(message)) {
		await message.react("💤");

		await addMessageToQueue(message);
	}
});

client.initialize();
