import fs from 'fs';

export const createFileIfNotExists = (filePath: string) => {

	if(!fs.existsSync(filePath)) {

		fs.writeFileSync(filePath, JSON.stringify([], null, 2));
	}

	return filePath;
}