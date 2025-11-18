import { Request, Response } from "express";
import { getVideoResponse } from "@/client/video";
import { logError, logInfo } from "@/util/log";

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
