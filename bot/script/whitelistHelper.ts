import fs from 'fs';
import { createFileIfNotExists } from './fileHelper.js';
import dotenv from 'dotenv';

dotenv.config();

const whitelistFilePath = `${process.cwd()}${process.env.WHITELIST_PATH}`;

createFileIfNotExists(whitelistFilePath);

export const checkWhitelistStatus = (id: string) => {

	const whitelistedIds = fs.readFileSync(whitelistFilePath);

	const whitelistedIdMap = JSON.parse(whitelistedIds.toString());

	return whitelistedIdMap.includes(id);
}

export const addToWhiteList = (id: string) => {

	const whitelistedIds = fs.readFileSync(whitelistFilePath);

	const whitelistedIdMap = JSON.parse(whitelistedIds.toString());

	if (!whitelistedIdMap.includes(id)) {

		whitelistedIdMap.push(id);

		fs.writeFileSync(whitelistFilePath, JSON.stringify(whitelistedIdMap, null, 2));
	}
}