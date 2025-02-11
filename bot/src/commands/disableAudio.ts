import { disableAudioResponse } from "@/data_handlers/enabled_audio/disableAudioResponse";
import {
	CommandData,
	CommandResponse,
	CommandResponseType,
} from "@/util/command";

export const disableAudioCommand = async (
	commandData: CommandData
): Promise<CommandResponse> => {
	const { message } = commandData;

	if (await disableAudioResponse(message.id.remote)) {
		return {
			type: CommandResponseType.Text,
			message: "Audio responses disabled 👌",
		};
	}

	return {
		type: CommandResponseType.Text,
		message: "Audio responses already disabled 🤔",
	};
};
