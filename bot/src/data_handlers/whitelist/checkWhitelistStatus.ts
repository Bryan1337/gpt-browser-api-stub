import fs from "fs";
import { WHITELIST_FILE_PATH } from "@/util/file";

export const checkWhitelistStatus = (id: string) => {
	const whitelistedIds = fs.readFileSync(WHITELIST_FILE_PATH);
	const whitelistedIdMap = JSON.parse(whitelistedIds.toString());
	return whitelistedIdMap.includes(id);
};
