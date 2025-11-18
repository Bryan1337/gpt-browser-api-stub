import { Page } from "puppeteer";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const EXCLUDES = new Set(["global.d.ts", "index.ts"]);

async function loadScripts() {
	const directory = dirname(fileURLToPath(import.meta.url));

	const files = fs
		.readdirSync(directory, { withFileTypes: true })
		.filter((file) => file.isFile())
		.map((file) => file.name)
		.filter((file) => !EXCLUDES.has(file));

	const scriptMap: Record<string, string> = {};

	for (const file of files) {
		const filePath = path.join(directory, file);
		const importUrl = pathToFileURL(filePath);
		const mod = await import(importUrl.href);

		const exported = mod?.default ?? mod;
		const baseName = file.split(".")[0];

		const src = exported.toString();
		scriptMap[baseName] = src;
	}

	return scriptMap;
}

export async function importBrowserScripts(page: Page) {
	const scriptMap = await loadScripts();

	await page.evaluate((injectedScripts) => {
		window.__name = <T extends (...args: unknown[]) => unknown>(
			callback: T
		): T => callback;
		for (const scriptName in injectedScripts) {
			if (window.gptBoyUtils && scriptName in window.gptBoyUtils) {
				continue;
			}

			try {
				const source = injectedScripts[scriptName];
				const evaluated = eval(source);

				window.gptBoyUtils = {
					...window.gptBoyUtils,
					[scriptName]: evaluated,
				};

				console.log(`Injected browser script: ${scriptName}`);
			} catch (error) {
				console.error(`Failed to eval script "${scriptName}":`, error);
			}
		}
	}, scriptMap);
}
