import fs from "fs";

export function getLatestVPNVersionPath(path: string) {
	const items = fs.readdirSync(path, { withFileTypes: true });

	const versionFolder = items.find((item) => item.isDirectory());

	if (!versionFolder) {
		return path;
	}

	return `${path}/${versionFolder.name}`;
}
