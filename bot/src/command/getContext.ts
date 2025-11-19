import { getContext } from "@/data_handlers/context/getContext";
import { CommandHandleData } from "@/command";
import { reactError, reactSuccess, reply } from "@/util/message";

export const getContextCommand = async (data: CommandHandleData) => {
	const { message } = data;
	const context = getContext(message.id.remote);

	if (context) {
		reactSuccess(message);
		reply(message, `Current context is:\n\n${context}`);
	} else {
		reactError(message);
		reply(message, "No context was found 🤔");
	}
};
