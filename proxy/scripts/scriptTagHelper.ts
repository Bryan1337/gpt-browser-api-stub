import { Page } from "puppeteer";

export const addScriptTag = async (page: Page, path: string, id: string) => {

	const hasTag = await page.evaluate(async ({ id }) => {
		return Boolean(document.querySelector(id));
	}, { id })

	if (hasTag) {
		return;
	}

	return await page.addScriptTag({
		path,
		id,
	})
};
