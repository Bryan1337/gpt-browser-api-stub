import { SORA_AI_BLOCKLIST_PATH } from "@/util/file";
import fs from "fs";

interface BlocklistEntry {
	id: string;
	reason: string;
	reactEmoji?: string;
}

export function getBlocklist(): BlocklistEntry[] {
	const blocklist = fs.readFileSync(SORA_AI_BLOCKLIST_PATH);
	return JSON.parse(blocklist.toString());
}
