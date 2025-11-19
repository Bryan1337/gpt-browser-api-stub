import { CommandHandleData } from "@/util/command";
import { saveExternalFile, SORA_AI_VIDEOS_PATH } from "@/util/file";
import { logError } from "@/util/log";
import { edit, reactError, reactSuccess, reactVideo, reply, replyWithMedia } from "@/util/message";
import { getLocalVideoResponse } from "@/util/request";
import { pause } from "@/util/time";
import { requestVideo } from "@/util/video";
import { getMessageMediaFromFilePath } from "@/util/whatsappWeb";

export async function handleVideoQueueJob(
	commandData: CommandHandleData,
	delayBetweenAttempts: number,
) {
	const { text, message } = commandData;

	await reactVideo(message);

	if (!text.trim()) {
		reply(message, "No video prompt given 🤔");
		return;
	}

	const sentMessage = await reply(message, "Generating video...");

	const localVideoResponse = await getLocalVideoResponse(text);

	if (localVideoResponse.error) {
		logError(localVideoResponse.error);
		reactError(message);
		edit(sentMessage, localVideoResponse.error);

		return;
	}

	const { taskId, numVideosRemaining } = localVideoResponse;

	while (true) {
		try {
			const task = await requestVideo(taskId, sentMessage);

			if (task && task.kind === "sora_content_violation") {
				edit(sentMessage, `Video generation failed: ${task.markdown_reason_str}`);

				reactError(message);

				break;
			}

			if (!task) {
				await pause(delayBetweenAttempts);

				continue;
			}

			if (task.error) {
				logError(task.error);
				reply(sentMessage, task.error);

				return;
			}

			const localFileUrl = await saveExternalFile(
				task.downloadable_url,
				"mp4",
				SORA_AI_VIDEOS_PATH,
			);

			reactSuccess(message);
			edit(
				sentMessage,
				`Video generated! ${numVideosRemaining} video generations remaining.`,
			);

			const media = getMessageMediaFromFilePath(localFileUrl);
			const messageText = `*_"${`${text}`.trim()}"_*`;
			const messageProps = { media };

			replyWithMedia(message, messageText, messageProps);
			reactSuccess(message);

			break;
		} catch (error) {
			logError(error);

			await pause(delayBetweenAttempts);

			continue;
		}
	}
}
