import { addContext } from "@/data_handlers/context/addContext";
import {
	CommandData,
	CommandResponse,
	CommandResponseType,
} from "@/util/command";

export const setContextCommand = async (
	commandData: CommandData
): Promise<CommandResponse> => {
	const { text, message } = commandData;

	if (addContext(message.id.remote, text)) {
		return {
			type: CommandResponseType.Text,
			message: "Context added/updated 👌",
		};
	}

	return {
		type: CommandResponseType.Text,
		message: "No context to add 🤔",
	};
};
