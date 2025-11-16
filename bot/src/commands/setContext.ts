import { addContext } from "@/data_handlers/context/addContext";
import { CommandHandleData } from "@/util/command";

export const setContextCommand = async (data: CommandHandleData) => {
	const { text, message } = data;

	if (addContext(message.id.remote, text)) {
		message.reply("Context added/updated 👌");
		message.react("✅");
	} else {
		message.reply("No context to add 🤔");
		message.react("❌");
	}
};
