import fs from "fs";
import { ENABLED_AUDIO_FILE_PATH } from "@/util/file";

export function getAudioLanguage(remoteId: string) {
	const enabledAudio = fs.readFileSync(ENABLED_AUDIO_FILE_PATH);
	const enabledAudioMap = JSON.parse(enabledAudio.toString());

	const enabledAudioIds = enabledAudioMap.map(
		(enabledAudio: { id: string }) => enabledAudio.id
	);

	const enabledAudioIndex = enabledAudioIds.indexOf(remoteId);

	if (enabledAudioIndex !== -1) {
		return enabledAudioMap[enabledAudioIndex];
	}

	return null;
}
