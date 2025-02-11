import { clearContext } from "@/data_handlers/context/clearContext";
import {
	CommandData,
	CommandResponse,
	CommandResponseType,
} from "@/util/command";

export const clearContextCommand = async (
	commandData: CommandData
): Promise<CommandResponse> => {
	const { message } = commandData;

	if (clearContext(message.id.remote)) {
		return {
			type: CommandResponseType.Text,
			message: "Context cleared 👌",
		};
	}

	return {
		type: CommandResponseType.Text,
		message: "No context was found 🤔",
	};
};
