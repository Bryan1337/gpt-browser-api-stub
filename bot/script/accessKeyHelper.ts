import fs from 'fs';
import { createFileIfNotExists } from './fileHelper';
import dotenv from 'dotenv';

dotenv.config();

const accessKeyMapPath = createFileIfNotExists(`${process.cwd()}${process.env.ACCESS_KEYS_PATH}`);

export const validateAccessKey = (key: string) => {

	const accessKeys = fs.readFileSync(accessKeyMapPath);

	const accessKeyMap = JSON.parse(accessKeys.toString());

	if (accessKeyMap.includes(`${key}`.trim())) {

		const newAccessKeys = [ ...accessKeyMap ].filter(accessKey => accessKey !== key);

		fs.writeFileSync(accessKeyMapPath, JSON.stringify(newAccessKeys, null, 2));

		return true;
	}

	return false;
}