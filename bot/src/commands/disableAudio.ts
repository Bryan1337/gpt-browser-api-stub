import { disableAudioResponse } from "@/data_handlers/enabled_audio/disableAudioResponse";
import { CommandHandleData } from "@/util/command";

export const disableAudioCommand = async (data: CommandHandleData) => {
	const { message } = data;

	if (await disableAudioResponse(message.id.remote)) {
		message.react("✅");
		message.reply("Audio responses disabled 👌");
	} else {
		message.react("❌");
		message.reply("Audio responses already disabled 🤔");
	}
};
