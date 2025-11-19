import gtts from "node-gtts";
import { v4 as uuidv4 } from "uuid";
import { AUDIO_FILES_PATH } from "@/util/file";

export enum SupportedTTSLanguage {
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
	C = "cy",
}

export const getTTSAudioFilePath = async (text: string, language: string): Promise<string> => {
	const gttsInstance = gtts(language);

	return new Promise((resolve, reject) => {
		try {
			const filepath = `${AUDIO_FILES_PATH}/${uuidv4()}.wav`;

			gttsInstance.save(filepath, text, () => {
				resolve(filepath);
			});
		} catch (error) {
			reject(error);
		}
	});
};

export function getSupportedLanguagesString() {
	return Object.values(SupportedTTSLanguage).join(", ");
}
