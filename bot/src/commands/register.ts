import { validateAccessKey } from "@/data_handlers/access_key/validateAccessKey";
import { addToWhiteList } from "@/data_handlers/whitelist/addToWhitelist";
import { CommandHandleData } from "@/util/command";

export const registerCommand = (data: CommandHandleData) => {
	const { text, message } = data;

	const id = message.from;

	if (validateAccessKey(`${text}`.trim())) {
		addToWhiteList(id);

		message.react("✅");
		message.reply(`Registered 👌`);
	} else {
		message.react("❌");
		message.reply(`Invalid registration key 🚫`);
	}
};
