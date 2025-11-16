import { clearContext } from "@/data_handlers/context/clearContext";
import { CommandHandleData } from "@/util/command";

export const clearContextCommand = async (data: CommandHandleData) => {
	const { message } = data;

	if (clearContext(message.id.remote)) {
		message.react("✅");
		message.reply("Context cleared 👌");
	} else {
		message.react("❌");
		message.reply("No context was found 🤔");
	}
};
