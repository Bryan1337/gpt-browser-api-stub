import { validateAccessKey } from "@/data_handlers/access_key/validateAccessKey";
import { addToWhiteList } from "@/data_handlers/whitelist/addToWhitelist";
import {
	CommandData,
	CommandResponse,
	CommandResponseType,
} from "@/util/command";

export const registerCommand = async (
	commandData: CommandData
): Promise<CommandResponse> => {
	const { text, message } = commandData;

	const id = message.from;

	if (validateAccessKey(`${text}`.trim())) {
		addToWhiteList(id);

		return {
			type: CommandResponseType.Text,
			message: `Registered 👌`,
		};
	} else {
		return {
			type: CommandResponseType.Text,
			message: `Invalid registration key 🚫`,
		};
	}
};
