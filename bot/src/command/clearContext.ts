import { clearContext } from "@/data_handlers/context/clearContext";
import { CommandHandleData } from "@/command";
import { reactError, reactSuccess, reply } from "@/util/message";

export const clearContextCommand = async (data: CommandHandleData) => {
	const { message } = data;

	if (clearContext(message.id.remote)) {
		reactSuccess(message);
		reply(message, "Context cleared 👌");
	} else {
		reactError(message);
		reply(message, "Context cleared 👌");
	}
};
