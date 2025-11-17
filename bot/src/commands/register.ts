import { validateAccessKey } from "@/data_handlers/access_key/validateAccessKey";
import { addToWhiteList } from "@/data_handlers/whitelist/addToWhitelist";
import { CommandHandleData } from "@/util/command";
import { reactError, reactSuccess, reply } from "@/util/message";

export const registerCommand = (data: CommandHandleData) => {
	const { text, message } = data;

	const id = message.from;

	if (validateAccessKey(`${text}`.trim())) {
		addToWhiteList(id);

		reactSuccess(message);
		reply(message, `Registered 👌`);
	} else {
		reactError(message);
		reply(message, `Invalid registration key 🚫`);
	}
};
