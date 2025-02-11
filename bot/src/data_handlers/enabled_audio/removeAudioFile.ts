import fs from "fs";

export const removeAudioFile = async (filepath: string) => {
	return fs.unlinkSync(filepath);
};
