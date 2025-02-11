import fs from "fs";
import { ENABLED_AUDIO_FILE_PATH } from "@/util/file";

export const disableAudioResponse = async (id: string) => {
	const enabledAudio = fs.readFileSync(ENABLED_AUDIO_FILE_PATH);
	const enabledAudioMap = JSON.parse(enabledAudio.toString());
	const enabledAudioIds = enabledAudioMap.map(
		(entry: { id: string }) => entry.id
	);
	const enabledAudioIndex = enabledAudioIds.indexOf(id);

	if (enabledAudioIndex !== -1) {
		const newEnabledAudio = [...enabledAudioMap].filter(
			(enabledAudio) => enabledAudio.id !== id
		);

		fs.writeFileSync(
			ENABLED_AUDIO_FILE_PATH,
			JSON.stringify(newEnabledAudio, null, 2)
		);
		return true;
	}
	return false;
};
