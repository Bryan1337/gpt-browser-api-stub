import fs from "fs";
import { v4 as uuidv4 } from "uuid";

export const saveExternalFile = async (
	url: string,
	extension: string,
	path: string
) => {
	const localPath = `${path}/${uuidv4()}.${extension}`;

	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	if (!response.body) {
		throw new Error("No body found in response");
	}

	const buffer = await response.arrayBuffer();

	fs.writeFileSync(localPath, Buffer.from(buffer));

	return localPath;
};

export const createFileIfNotExists = (filePath: string, baseData = []) => {
	if (!fs.existsSync(filePath)) {
		fs.writeFileSync(filePath, JSON.stringify(baseData, null, 2));
	}

	return filePath;
};

export const createFolderIfNotExists = (folderPath: string) => {
	if (!fs.existsSync(folderPath)) {
		fs.mkdirSync(folderPath, { recursive: true }); // Ensure the folder and any parent folders are created
	}

	return folderPath;
};

export const ACCESS_KEYS_FILE_PATH = createFileIfNotExists(
	`${process.cwd()}/output/.access_key/data.json`
);

export const AUDIO_FILES_PATH = createFolderIfNotExists(
	`${process.cwd()}/output/.audio`
);

export const CONTEXT_FILE_PATH = createFileIfNotExists(
	`${process.cwd()}/output/.context/data.json`
);

export const CONVERSATION_FILE_PATH = createFileIfNotExists(
	`${process.cwd()}/output/.conversation/data.json`
);

export const PROMPTS_FILE_PATH = createFileIfNotExists(
	`${process.cwd()}/output/.prompt/data.json`
);

export const WHITELIST_FILE_PATH = createFileIfNotExists(
	`${process.cwd()}/output/.whitelist/data.json`
);

export const ENABLED_AUDIO_FILE_PATH = createFileIfNotExists(
	`${process.cwd()}/output/.enabled_audio/data.json`
);

export const RUNWAY_AI_KEYS_FILE_PATH = createFileIfNotExists(
	`${process.cwd()}/output/.runway_ai/data.json`
);

export const PLAYGROUND_AI_KEYS_FILE_PATH = createFileIfNotExists(
	`${process.cwd()}/output/.playground_ai/data.json`
);

export const SUNO_AI_KEYS_FILE_PATH = createFileIfNotExists(
	`${process.cwd()}/output/.suno_ai/data.json`
);

export const SUNO_AI_VIDEO_FILES_PATH = createFolderIfNotExists(
	`${process.cwd()}/output/.suno_ai_songs`
);

export const HAILUO_AI_VIDEO_FILES_PATH = createFolderIfNotExists(
	`${process.cwd()}/output/.hailuo_ai_videos`
);

export const HAILUO_AI_TOKENS_PATH = createFileIfNotExists(
	`${process.cwd()}/output/.hailuo_ai_tokens/data.json`
);
