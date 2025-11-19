import { edit } from "@/util/message";
import { normalizeProgress } from "@/util/number";
import { getLocalDraftVideoResponse, getLocalPendingVideoResponse } from "@/util/request";
import { Message } from "whatsapp-web.js";

function isTaskResponse(
	response: Record<string, unknown>,
): response is { task: Record<string, unknown> | null } {
	return "task" in response;
}

function isProgressResponse(
	response: Record<string, unknown>,
): response is { progress: number | null } {
	return "progress" in response;
}

export async function requestVideo(taskId: string, message: Message) {
	const response = await getLocalPendingVideoResponse(taskId);

	if (isTaskResponse(response) && !response.task) {
		return await getLocalDraftVideoResponse(taskId);
	}

	if (isProgressResponse(response)) {
		const progress = normalizeProgress(response.progress);
		await edit(message, `Generating video... (${progress}%)`);
		return null;
	}

	return response;
}
