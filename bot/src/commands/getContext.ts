import { getContext } from "@/data_handlers/context/getContext";
import {
	CommandData,
	CommandResponse,
	CommandResponseType,
} from "@/util/command";

export const getContextCommand = async (
	commandData: CommandData
): Promise<CommandResponse> => {
	const { message } = commandData;

	const context = getContext(message.id.remote);

	if (context) {
		return {
			type: CommandResponseType.Text,
			message: `Current context is:\n\n${context}`,
		};
	}

	return {
		type: CommandResponseType.Text,
		message: "No context was found 🤔",
	};
};
