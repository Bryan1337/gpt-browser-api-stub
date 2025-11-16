import { Page } from "puppeteer";
import { logError, logInfo } from "../../scripts/logHelper";
import { Request, Response } from "express";
import { getPendingVideoResponse } from "../../browser";

export async function pendingVideoRequest(
	request: Request,
	response: Response,
	page: Page
) {
	try {
		const { taskId } = request.query as { taskId: string };

		logInfo("Received pending video command", taskId);

		const videoResponse = await page.evaluate(getPendingVideoResponse, {
			body: { taskId },
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
