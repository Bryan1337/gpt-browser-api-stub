import { Page } from "puppeteer";
import { Request, Response } from "express";
import { logError, logInfo } from "../../scripts/logHelper";
import { getVideoResponse } from "../../browser";

export async function videoRequest(
	request: Request,
	response: Response,
	page: Page
) {
	try {
		logInfo("Received video command", request.body);

		const videoResponse = await page.evaluate(getVideoResponse, {
			body: request.body,
			baseUrl: process.env.SORA_BASE_URL as string,
		});

		response.json(videoResponse);
	} catch (error) {
		logError((error as Error).message);

		response.json({
			error: (error as Error).message,
		});
	}
}
