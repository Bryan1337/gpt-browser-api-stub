import fs from "fs";
import { ACCESS_KEYS_FILE_PATH } from "@/util/file";

export const validateAccessKey = (key: string) => {
	const accessKeys = fs.readFileSync(ACCESS_KEYS_FILE_PATH);
	const accessKeyMap = JSON.parse(accessKeys.toString());

	if (accessKeyMap.includes(`${key}`.trim())) {
		const newAccessKeys = [...accessKeyMap].filter(
			(accessKey) => accessKey !== key
		);

		fs.writeFileSync(
			ACCESS_KEYS_FILE_PATH,
			JSON.stringify(newAccessKeys, null, 2)
		);
		return true;
	}
	return false;
};
