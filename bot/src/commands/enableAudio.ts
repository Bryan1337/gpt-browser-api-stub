import { enableAudioResponse } from "@/data_handlers/enabled_audio/enableAudioResponse";
import { CommandHandleData } from "@/util/command";
import { getSupportedLanguagesString } from "@/util/tts";

export const enableAudioCommand = async (data: CommandHandleData) => {
	const { message, text } = data;

	const languagesString = getSupportedLanguagesString();

	if (!text) {
		message.react("❌");
		message.reply(
			`No language given 🤔. Supported languages are:\n*${languagesString}*`
		);
		return;
	}

	const isoCode = text.trim().toLowerCase();

	if (languagesString.includes(isoCode)) {
		enableAudioResponse(message.id.remote, isoCode);

		message.react("✅");
		message.reply(
			`Audio responses enabled in language *${isoCode.toUpperCase()}* 👌`
		);
	} else {
		message.react("❌");
		message.reply(
			`Language *${isoCode}* is not supported 🚫. Supported languages are:\n*${languagesString}*`
		);
	}
};
