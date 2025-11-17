import { Page } from "puppeteer";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const BROWSER_SCRIPTS_FOLDER = "browser-scripts";
const EXCLUDES = new Set(["global.d.ts", "types.d.ts"]);

declare global {
	interface Window {
		[key: string]: unknown;
		// Needed for esbuild / bundlers
		// (forces the function name to remain intact)
		// See: https://github.com/evanw/esbuild/issues/2605
		__name?: <T extends (...args: any[]) => any>(cb: T) => T;
	}
}

async function loadScripts(): Promise<Record<string, string>> {
	const dir = path.join(process.cwd(), BROWSER_SCRIPTS_FOLDER);
	const files = fs
		.readdirSync(dir, { withFileTypes: true })
		.filter((file) => file.isFile())
		.map((file) => file.name)
		.filter((file) => !EXCLUDES.has(file));

	const scriptMap: Record<string, string> = {};

	for (const file of files) {
		const filePath = path.join(dir, file);
		const importUrl = pathToFileURL(filePath);
		const mod = await import(importUrl.href);

		const exported = mod?.default ?? mod;
		const baseName = file.split(".")[0];

		const src = exported.toString();
		scriptMap[baseName] = src;
	}

	return scriptMap;
}

export async function importBrowserScripts(page: Page): Promise<void> {
	const scriptMap = await loadScripts();

	await page.evaluate((injectedScripts) => {
		window.__name = <T extends (...args: unknown[]) => unknown>(
			callback: T
		): T => callback;
		for (const scriptName in injectedScripts) {
			if (!!window[scriptName]) {
				continue;
			}

			try {
				const source = injectedScripts[scriptName];
				const evaluated = eval(source);
				window[scriptName] = evaluated;
				console.log(`Injected browser script: ${scriptName}`);
			} catch (error) {
				console.error(`Failed to eval script "${scriptName}":`, error);
			}
		}
	}, scriptMap);
}
