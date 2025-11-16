import { CommandHandleData, getFormattedCommands } from "@/util/command";

export const helpCommand = async (data: CommandHandleData) => {
	const { message } = data;

	const commands = getFormattedCommands();

	message.react("✅");
	message.reply(`The current commands are: \n\n ${commands}`);
};
