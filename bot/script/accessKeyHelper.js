import fs from 'fs';
import { createFileIfNotExists } from './fileHelper.js';
import dotenv from 'dotenv';

dotenv.config();


const accessKeyMapPath = `${process.cwd()}${process.env.ACCESS_KEYS_PATH}`;

createFileIfNotExists(accessKeyMapPath);

export const validateAccessKey = (key) => {

	const accessKeys = fs.readFileSync(accessKeyMapPath);

	const accessKeyMap = JSON.parse(accessKeys);

	if (accessKeyMap.includes(`${key}`.trim())) {

		const newAccessKeys = [ ...accessKeyMap ].filter(accessKey => accessKey !== key);

		fs.writeFileSync(accessKeyMapPath, JSON.stringify(newAccessKeys, null, 2));

		return true;
	}

	return false;
}