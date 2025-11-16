import { Page } from "puppeteer";
import fs from "fs";
import path from "path";

const BROWSER_SCRIPTS_FOLDER = "browser-scripts";
const files = fs.readdirSync(
	path.relative(process.cwd(), BROWSER_SCRIPTS_FOLDER)
);
const scriptMap: Record<string, string> = {};
const excludes = ["global.d.ts", "types.d.ts"];

for (const file of files) {
	const fileMeta = await import(`../${BROWSER_SCRIPTS_FOLDER}/${file}`);
	const [fileName] = file.split(".");
	if (excludes.includes(file)) {
		continue;
	}
	scriptMap[fileName] = fileMeta.default.toString();
}

export const importBrowserScripts = async (page: Page) => {
	await page.evaluate(
		async ({ scriptMap }) => {
			/**
			 * https://github.com/evanw/esbuild/issues/2605
			 */
			window["__name"] = (callback: (...args: any) => any) => callback;
			for (const scriptName in scriptMap) {
				if (scriptName in window) {
					continue;
				}
				console.log(`Injecting script: ${scriptName}`);
				window[scriptName] = eval(scriptMap[scriptName]);
			}
		},
		{ scriptMap }
	);
};
