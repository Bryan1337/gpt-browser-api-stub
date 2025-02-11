import {
	CommandData,
	CommandResponse,
	CommandResponseType,
} from "@/util/command";
import { getRunwayAiVideoUrl } from "@/util/runwayAi";
import { getMessageMediaFromUrl } from "@/util/whatsappWeb";

export const videoUrlCommand = async (
	commandData: CommandData
): Promise<CommandResponse> => {
	const { text, message } = commandData;

	await message.react("🎥");

	const [fileUrl, ...restOfText] = text.trim().split(" ");

	const videoPrompt = restOfText.join(" ");

	if (!fileUrl?.trim()) {
		return {
			type: CommandResponseType.Text,
			message: "No file url given 🤔",
		};
	}

	if (!videoPrompt.trim()) {
		return {
			type: CommandResponseType.Text,
			message: "No video prompt given 🤔",
		};
	}

	try {
		const videoUrl = await getRunwayAiVideoUrl(videoPrompt, fileUrl);

		const messageMedia = await getMessageMediaFromUrl(videoUrl);

		return {
			type: CommandResponseType.Media,
			media: messageMedia,
			message: `*_"${`${videoPrompt}`.trim()}"_*`,
		};
	} catch (error) {
		return {
			type: CommandResponseType.Text,
			message: `Something went wrong generating a video from an url 😩 (${
				(error as Error).message
			})`,
		};
	}
};
