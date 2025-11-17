import { CommandHandleData, getFormattedCommands } from "@/util/command";
import { reactSuccess, reply } from "@/util/message";

export const helpCommand = async (data: CommandHandleData) => {
	const { message } = data;

	const commands = getFormattedCommands();

	reactSuccess(message);
	reply(message, `The current commands are: \n\n ${commands}`);
};
