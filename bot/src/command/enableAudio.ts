import { enableAudioResponse } from "@/data_handlers/enabled_audio/enableAudioResponse";
import { CommandHandleData } from "@/command";
import { getSupportedLanguagesString } from "@/util/tts";
import { reactError, reactSuccess, reply } from "@/util/message";

export const enableAudioCommand = async (data: CommandHandleData) => {
	const { message, text } = data;

	const languagesString = getSupportedLanguagesString();

	if (!text) {
		reactError(message);
		reply(message, `No language given 🤔. Supported languages are:\n*${languagesString}*`);
		return;
	}

	const isoCode = text.trim().toLowerCase();

	if (languagesString.includes(isoCode)) {
		enableAudioResponse(message.id.remote, isoCode);

		reactSuccess(message);
		reply(message, `Audio responses enabled in language *${isoCode.toUpperCase()}* 👌`);
	} else {
		reactError(message);
		reply(
			message,
			`Language *${isoCode}* is not supported 🚫. Supported languages are:\n*${languagesString}*`,
		);
	}
};
