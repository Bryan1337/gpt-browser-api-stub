import fs from 'fs';

export const createFileIfNotExists = (filePath) => {

	if(!fs.existsSync(filePath)) {

		fs.writeFileSync(filePath, JSON.stringify([], null, 2));
	}
}