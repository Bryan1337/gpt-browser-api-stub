import fs from "fs";
import { WHITELIST_FILE_PATH } from "@/util/file";

export const addToWhiteList = (id: string) => {
	const whitelistedIds = fs.readFileSync(WHITELIST_FILE_PATH);
	const whitelistedIdMap = JSON.parse(whitelistedIds.toString());

	if (!whitelistedIdMap.includes(id)) {
		whitelistedIdMap.push(id);
		fs.writeFileSync(
			WHITELIST_FILE_PATH,
			JSON.stringify(whitelistedIdMap, null, 2)
		);
		return true;
	}
	return false;
};
