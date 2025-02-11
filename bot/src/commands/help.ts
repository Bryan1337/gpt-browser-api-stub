import { CommandResponse, CommandResponseType, commands } from "@/util/command";

export const helpCommand = async (): Promise<CommandResponse> => {
	return {
		type: CommandResponseType.Text,
		message: `The current commands are: \n\n ${Object.values(commands)
			.map((command) => `*${command.command}*\n ${command.description}`)
			.join("\n\n")}`,
	};
};
