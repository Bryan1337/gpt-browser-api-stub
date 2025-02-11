import { enableAudioResponse } from "@/data_handlers/enabled_audio/enableAudioResponse";
import {
	CommandData,
	CommandResponse,
	CommandResponseType,
} from "@/util/command";
import { SupportedTTSLanguage } from "@/util/tts";

export const enableAudioCommand = async (
	commandData: CommandData
): Promise<CommandResponse> => {
	const { message, text: language } = commandData;

	if (!language) {
		return {
			type: CommandResponseType.Text,
			message: `No language given 🤔. Supported languages are:\n*${Object.values(
				SupportedTTSLanguage
			).join(", ")}*`,
		};
	}

	const isoCode = language.trim();

	if (
		!Object.values(SupportedTTSLanguage).includes(
			`${isoCode}`.toLowerCase() as SupportedTTSLanguage
		)
	) {
		return {
			type: CommandResponseType.Text,
			message: `Language *${`${isoCode}`.toUpperCase()}* is not supported 🚫. Supported languages are:\n*${Object.keys(
				SupportedTTSLanguage
			).join(", ")}*`,
		};
	}

	enableAudioResponse(message.id.remote, isoCode);

	return {
		type: CommandResponseType.Text,
		message: `Audio responses enabled in language *${isoCode.toUpperCase()}* 👌`,
	};
};
