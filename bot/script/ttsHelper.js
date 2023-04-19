

import gtts from 'node-gtts';
import { v4 as uuidv4 } from "uuid";
import fs from 'fs';
import dotenv from 'dotenv';
import { createFileIfNotExists } from './fileHelper.js';
import { logInfo } from './logHelper.js';

dotenv.config();

const enabledAudioPath = `${process.cwd()}${process.env.ENABLED_AUDIO_PATH}`;

createFileIfNotExists(enabledAudioPath);

export const getAudioData = async (id) => {

	const enabledAudio = fs.readFileSync(enabledAudioPath);

	const enabledAudioMap = JSON.parse(enabledAudio);

	const enabledAudioIds = enabledAudioMap.map(enabledAudio => enabledAudio.id);

	const enabledAudioIndex = enabledAudioIds.indexOf(id);

	if (enabledAudioIndex !== -1) {

		return enabledAudioMap[enabledAudioIndex];
	}

	return false;
}

export const enableAudioResponse = async (id, language) => {

	const enabledAudio = fs.readFileSync(enabledAudioPath);

	const enabledAudioMap = JSON.parse(enabledAudio);

	const enabledAudioIds = enabledAudioMap.map(enabledAudio => enabledAudio.id);

	const enabledAudioIndex = enabledAudioIds.indexOf(id);

	if (enabledAudioIndex === -1) {

		enabledAudioMap.push({
			id,
			language,
		});

		logInfo('Adding new enabled audio map entry', id, language);

	} else {

		const enabledAudioIndex = enabledAudioMap.findIndex(enabledAudio => enabledAudio.id === id);

		enabledAudioMap[enabledAudioIndex] = {
			id,
			language,
		};

		logInfo('Updating enabled audio map entry', id, language);
	}

	fs.writeFileSync(enabledAudioPath, JSON.stringify(enabledAudioMap, null, 2));

	return true;
}

export const disableAudioResponse = async (id) => {

	const enabledAudio = fs.readFileSync(enabledAudioPath);

	const enabledAudioMap = JSON.parse(enabledAudio);

	const enabledAudioIds = enabledAudioMap.map(enabledAudio => enabledAudio.id);

	const enabledAudioIndex = enabledAudioIds.indexOf(id);

	if (enabledAudioIndex !== -1) {

		const newEnabledAudio = [ ...enabledAudioMap ].filter(enabledAudio => enabledAudio.id !== id);

		fs.writeFileSync(enabledAudioPath, JSON.stringify(newEnabledAudio, null, 2));

		return true;
	}

	return false;

}

export const getAudioFilePath = async (text, language) => {

	const gttsInstance = gtts(language);

	return new Promise((resolve, reject) => {

		try {

			const filepath = `${process.cwd()}/${uuidv4()}.wav`;

			gttsInstance.save(filepath, text, () => {

				resolve(filepath);
			})

		} catch (error) {

			reject(error);
		}
	})
}

export const removeAudioFile = async (filepath) => {

	return fs.unlinkSync(filepath);
}