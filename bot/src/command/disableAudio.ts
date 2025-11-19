import { disableAudioResponse } from "@/data_handlers/enabled_audio/disableAudioResponse";
import { CommandHandleData } from "@/command";
import { reactError, reactSuccess, reply } from "@/util/message";

export const disableAudioCommand = async (data: CommandHandleData) => {
	const { message } = data;

	if (await disableAudioResponse(message.id.remote)) {
		reactSuccess(message);
		reply(message, "Audio responses disabled 👌");
	} else {
		reactError(message);
		reply(message, "Audio responses already disabled 🤔");
	}
};
