import { Request, Response } from "express";
import { logError, logInfo } from "../../scripts/logHelper";
import { getVideoResponse } from "../../browser";

export async function videoRequest(request: Request, response: Response) {
	try {
		logInfo("Received video command", request.body);

		const videoResponse = await request.pages.soraPage.evaluate(
			getVideoResponse,
			{ body: request.body }
		);

		response.json(videoResponse);
	} catch (error) {
		logError((error as Error).message);

		response.json({
			error: (error as Error).message,
		});
	}
}
