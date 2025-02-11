import { getToken } from "@/data_handlers/hailuo_ai/getToken";
import {
	CommandData,
	CommandResponse,
	CommandResponseType,
} from "@/util/command";
import { HAILUO_AI_VIDEO_FILES_PATH, saveExternalFile } from "@/util/file";
import { generateVideo, getRenewalToken, pollVideoId } from "@/util/hailuoAi";
import { logInfo, logWarning } from "@/util/log";
import { getDurationText, pause } from "@/util/time";
import {
	getMessageMediaFromFilePath,
	getMessageMediaFromUrl,
} from "@/util/whatsappWeb";

export const videoCommand = async (
	commandData: CommandData
): Promise<CommandResponse> => {
	const { text, message } = commandData;

	await message.react("🎥");

	if (!text.trim()) {
		return {
			type: CommandResponseType.Text,
			message: "No video prompt given 🤔",
		};
	}

	try {
		const startTime = new Date();

		const baseToken = await getToken();

		if (!baseToken) {
			throw new Error(`No Hailuo AI tokens available`);
		}

		const renewalTokenJson = await getRenewalToken(baseToken);

		if (!renewalTokenJson.data.token) {
			throw new Error(renewalTokenJson);
		}

		const renewalToken = renewalTokenJson.data.token;

		const generateVideoJson = await generateVideo(text, renewalToken);

		if (generateVideoJson.statusInfo.code === 1000060) {
			throw new Error(`This content has been flagged`);
		}

		const videoId = generateVideoJson?.data.id;

		if (!videoId) {
			throw new Error(generateVideoJson);
		}

		const progressMessage = await message.reply(
			`🤖 Generating video. This may take a while (0%)`
		);

		while (true) {
			const pollVideoJson = await pollVideoId(videoId, renewalToken);

			if (pollVideoJson.statusInfo.code === 1000060) {
				throw new Error(`This content has been flagged`);
			}

			const videos = pollVideoJson?.data.videos ?? [];

			const [video] = videos;

			if (!video.videoURL) {
				logWarning(`Video generating... (${video.percent}%)`);

				await progressMessage.edit(
					`🤖 Generating video. This may take a while (${video.percent}%)`
				);
			}

			if (video.videoURL) {
				getMessageMediaFromUrl(video.videoURL);

				const localFileUrl = await saveExternalFile(
					video.videoURL,
					"mp4",
					HAILUO_AI_VIDEO_FILES_PATH
				);

				logInfo(`Retrieved video URL (${video.videoURL})`);

				const endTime = new Date();

				const duration = getDurationText(startTime, endTime);

				progressMessage.edit(`🤖 Video generated in ${duration} 👌`);

				return {
					type: CommandResponseType.Media,
					media: getMessageMediaFromFilePath(localFileUrl),
					message: `*_"${`${text}`.trim()}"_*`,
					originMessage: progressMessage,
				};
			}

			logInfo("Waiting 10 seconds...");

			await pause(10000);
		}
	} catch (error) {
		return {
			type: CommandResponseType.Text,
			message: `Something went wrong (${(error as Error).message})`,
		};
	}
};
