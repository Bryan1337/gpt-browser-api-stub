import { logError } from "@/util/log";
import { edit } from "@/util/message";
import {
	getLocalDraftVideoResponse,
	getLocalPendingVideoResponse
} from "@/util/request";
import { Message } from "whatsapp-web.js";

function isTaskResponse(
	response: Record<string, unknown>
): response is { task: Record<string, unknown> | null } {
	return "task" in response;
}

function isProgressResponse(
	response: Record<string, unknown>
): response is { progress: number | null } {
	return "progress" in response;
}

function normalizeProgress(progress: number | null) {
	if (progress === null || isNaN(progress)) {
		return 0;
	}

	const clamped = Math.max(0, Math.min(1, progress));
	return Math.round(clamped * 100 * 100) / 100;
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

	logError(`Received unknown response:`, response);

	throw new Error(response);
}
