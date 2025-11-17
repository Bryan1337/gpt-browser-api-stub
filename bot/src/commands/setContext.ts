import { addContext } from "@/data_handlers/context/addContext";
import { CommandHandleData } from "@/util/command";
import { reactError, reactSuccess, reply } from "@/util/message";

export const setContextCommand = async (data: CommandHandleData) => {
	const { text, message } = data;

	if (addContext(message.id.remote, text)) {
		reply(message, "Context added/updated 👌");
		reactSuccess(message);
	} else {
		reactError(message);
		reply(message, "No context to add 🤔");
	}
};
