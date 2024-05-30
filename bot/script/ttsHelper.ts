

import gtts from 'node-gtts';
import { v4 as uuidv4 } from "uuid";
import fs from 'fs';
import dotenv from 'dotenv';
import { createFileIfNotExists } from './fileHelper';
import { logInfo } from './logHelper';

declare module 'node-gtts' {

}

dotenv.config();

export enum SupportedLanguage {
	AF = "af",
	SQ = "sq",
	AR = "ar",
	HY = "hy",
	CA = "ca",
	ZH = "zh",
	ZH_CN = "zh-cn",
	ZH_TW = "zh-tw",
	ZH_YUE = "zh-yue",
	HR = "hr",
	CS = "cs",
	DA = "da",
	NL = "nl",
	EN = "en",
	EN_AU = "en-au",
	EN_UK = "en-uk",
	EN_US = "en-us",
	EO = "eo",
	FI = "fi",
	FR = "fr",
	DE = "de",
	EL = "el",
	HT = "ht",
	HI = "hi",
	HU = "hu",
	IS = "is",
	ID = "id",
	IT = "it",
	JA = "ja",
	KO = "ko",
	LA = "la",
	LV = "lv",
	MK = "mk",
	NO = "no",
	PL = "pl",
	PT = "pt",
	PT_BR = "pt-br",
	RO = "ro",
	RU = "ru",
	SR = "sr",
	SK = "sk",
	ES = "es",
	ES_ES = "es-es",
	ES_US = "es-us",
	SW = "sw",
	SV = "sv",
	TA = "ta",
	TH = "th",
	TR = "tr",
	VI = "vi",
	C = "cy"
}

interface EnabledAudioEntry {
	id: string;
	language: SupportedLanguage;
}

const enabledAudioPath = `${process.cwd()}${process.env.ENABLED_AUDIO_PATH}`;

createFileIfNotExists(enabledAudioPath);

export const getAudioData = async (id: string) => {

	const enabledAudio = fs.readFileSync(enabledAudioPath);

	const enabledAudioMap: EnabledAudioEntry[] = JSON.parse(enabledAudio.toString());

	const enabledAudioIds = enabledAudioMap.map(enabledAudio => enabledAudio.id);

	const enabledAudioIndex = enabledAudioIds.indexOf(id);

	if (enabledAudioIndex !== -1) {

		return enabledAudioMap[enabledAudioIndex];
	}

	return false;
}

export const enableAudioResponse = async (id: string, language: string) => {

	const sanitizedLanguage = language.toLowerCase() as SupportedLanguage;

	const enabledAudio = fs.readFileSync(enabledAudioPath);

	const enabledAudioMap: EnabledAudioEntry[] = JSON.parse(enabledAudio.toString());

	const enabledAudioIds = enabledAudioMap.map(enabledAudio => enabledAudio.id);

	const enabledAudioIndex = enabledAudioIds.indexOf(id);

	if (enabledAudioIndex === -1) {

		enabledAudioMap.push({
			id,
			language: sanitizedLanguage,
		});

		logInfo('Adding new enabled audio map entry', id, language);

	} else {

		const enabledAudioIndex = enabledAudioMap.findIndex(enabledAudio => enabledAudio.id === id);

		enabledAudioMap[enabledAudioIndex] = {
			id,
			language: sanitizedLanguage,
		};

		logInfo('Updating enabled audio map entry', id, language);
	}

	fs.writeFileSync(enabledAudioPath, JSON.stringify(enabledAudioMap, null, 2));

	return true;
}

export const disableAudioResponse = async (id: string) => {

	const enabledAudio = fs.readFileSync(enabledAudioPath);

	const enabledAudioMap: EnabledAudioEntry[] = JSON.parse(enabledAudio.toString());

	const enabledAudioIds = enabledAudioMap.map(enabledAudio => enabledAudio.id);

	const enabledAudioIndex = enabledAudioIds.indexOf(id);

	if (enabledAudioIndex !== -1) {

		const newEnabledAudio = [...enabledAudioMap].filter(enabledAudio => enabledAudio.id !== id);

		fs.writeFileSync(enabledAudioPath, JSON.stringify(newEnabledAudio, null, 2));

		return true;
	}

	return false;

}

export const getAudioFilePath = async (text: string, language: string) : Promise<string> => {

	const gttsInstance = gtts(language);

	return new Promise((resolve, reject) => {

		try {

			const filepath = `${process.cwd()}/${process.env.AUDIO_FOLDER}/${uuidv4()}.wav`;

			gttsInstance.save(filepath, text, () => {

				resolve(filepath);
			})

		} catch (error) {

			reject(error);
		}
	})
}

export const removeAudioFile = async (filepath: string) => {

	return fs.unlinkSync(filepath);
}