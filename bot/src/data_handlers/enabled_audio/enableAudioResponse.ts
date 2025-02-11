import { SupportedTTSLanguage } from "@/util/tts";
import fs from "fs";
import { ENABLED_AUDIO_FILE_PATH } from "@/util/file";
import { logInfo } from "@/util/log";

export const enableAudioResponse = async (id: string, language: string) => {
	const sanitizedLanguage = language.toLowerCase() as SupportedTTSLanguage;

	const enabledAudio = fs.readFileSync(ENABLED_AUDIO_FILE_PATH);

	const enabledAudioMap = JSON.parse(enabledAudio.toString());

	const enabledAudioIds = enabledAudioMap.map(
		(enabledAudio: { id: string }) => enabledAudio.id
	);

	const enabledAudioIndex = enabledAudioIds.indexOf(id);

	if (enabledAudioIndex === -1) {
		enabledAudioMap.push({
			id,
			language: sanitizedLanguage,
		});

		logInfo("Adding new enabled audio map entry", id, language);
	} else {
		const enabledAudioIndex = enabledAudioMap.findIndex(
			(enabledAudio: { id: string }) => enabledAudio.id === id
		);

		enabledAudioMap[enabledAudioIndex] = {
			id,
			language: sanitizedLanguage,
		};

		logInfo("Updating enabled audio map entry", id, language);
	}

	fs.writeFileSync(
		ENABLED_AUDIO_FILE_PATH,
		JSON.stringify(enabledAudioMap, null, 2)
	);

	return true;
};
