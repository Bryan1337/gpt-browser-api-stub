import { Request, Response } from "express";
import { logError, logInfo } from "@/util/log";
import { getPendingVideoResponse } from "@/client/video";

export async function pendingVideoRequest(
	request: Request,
	response: Response
) {
	try {
		const { taskId } = request.query as { taskId: string };

		logInfo("Received pending video command", taskId);

		const videoResponse = await request.pages.soraPage.evaluate(
			getPendingVideoResponse,
			{ body: { taskId } }
		);

		response.json(videoResponse);
	} catch (error) {
		logError((error as Error).message);

		response.json({
			error: (error as Error).message,
		});
	}
}
