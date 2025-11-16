import { CommandHandleData } from "@/util/command";
import { saveExternalFile, SORA_AI_VIDEOS_PATH } from "@/util/file";
import { logError } from "@/util/log";
import {
	getLocalDraftVideoResponse,
	getLocalPendingVideoResponse,
	getLocalVideoResponse
} from "@/util/request";
import { pause } from "@/util/time";
import { getMessageMediaFromFilePath } from "@/util/whatsappWeb";
import { Message, MessageSendOptions } from "whatsapp-web.js";

const normalizeProgress = (progress: number | null): number => {
	if (progress === null || isNaN(progress)) {
		return 0;
	}

	const clamped = Math.max(0, Math.min(1, progress));

	return Math.round(clamped * 100 * 100) / 100;
};

const pollVideo = async (taskId: string, message: Message) => {
	const response = await getLocalPendingVideoResponse(taskId);

	if ("task" in response && !response.task) {
		return await getLocalDraftVideoResponse(taskId);
	}

	if ("progress" in response) {
		const progress = normalizeProgress(response.progress);
		message.edit(`🤖 Generating video... (${progress}%)`);

		await pause(10000);

		return await pollVideo(taskId, message);
	}

	throw new Error(response);
};

export const videoCommand = async (data: CommandHandleData) => {
	const { text, message } = data;

	await message.react("🎥");

	if (!text.trim()) {
		message.reply("No video prompt given 🤔");
		return;
	}

	try {
		const { taskId, numVideosRemaining } = await getLocalVideoResponse(
			text
		);

		const sentMessage = await message.reply("🤖 Generating video...");

		const task = await pollVideo(taskId, sentMessage);

		if (task.kind === "sora_content_violation") {
			sentMessage.edit(
				`🤖 Video generation failed: ${task.markdown_reason_str}`
			);

			await message.react("❌");
			return;
		}

		const localFileUrl = await saveExternalFile(
			task.downloadable_url,
			"mp4",
			SORA_AI_VIDEOS_PATH
		);

		message.react("✅");
		sentMessage.edit(
			`🤖 Video generated! ${numVideosRemaining} video generations remaining.`
		);

		const media = getMessageMediaFromFilePath(localFileUrl);
		const messageText = `*_"${`${text}`.trim()}"_*`;
		const messageProps: MessageSendOptions = { media };

		message.reply(messageText, undefined, messageProps);
		message.react("✅");
	} catch (error) {
		logError(error);

		message.react("❌");
		message.reply(`Something went wrong (${(error as Error).message})`);
	}
};
