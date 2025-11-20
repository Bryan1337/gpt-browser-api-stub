import { Request, Response } from "express";
import { logError, logInfo } from "@/util/log";
import { getVideoCreditsResponse } from "@/client/video";

export async function videoCreditsRequest(request: Request, response: Response) {
	try {
		logInfo("Received video credits command");

		const videoResponse = await request.pages.soraPage.evaluate(getVideoCreditsResponse);

		response.json(videoResponse);
	} catch (error) {
		logError((error as Error).message);

		response.json({
			error: (error as Error).message,
		});
	}
}
