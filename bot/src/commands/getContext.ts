import { getContext } from "@/data_handlers/context/getContext";
import { CommandHandleData } from "@/util/command";

export const getContextCommand = async (data: CommandHandleData) => {
	const { message } = data;

	const context = getContext(message.id.remote);

	if (context) {
		message.react("✅");
		message.reply(`Current context is:\n\n${context}`);
	} else {
		message.react("❌");
		message.reply("No context was found 🤔");
	}
};
