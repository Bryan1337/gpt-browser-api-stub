import { Request, Response } from "express";
import { Page } from "puppeteer";
import { logError, logInfo } from "../../scripts/logHelper";
import { getVideoDraftResponse } from "../../browser";

export async function draftVideoRequest(
	request: Request,
	response: Response,
	page: Page
) {
	try {
		const { taskId } = request.query as { taskId: string };

		logInfo("Received draft video command", taskId);

		const draftResponse = await page.evaluate(getVideoDraftResponse, {
			body: { taskId },
			baseUrl: process.env.SORA_BASE_URL as string,
		});

		console.log("draftResponse", draftResponse);

		response.json(draftResponse);
	} catch (error) {
		logError((error as Error).message);

		response.json({
			error: (error as Error).message,
		});
	}
}
