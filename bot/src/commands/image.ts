import {
	CommandData,
	CommandResponse,
	CommandResponseType,
} from "@/util/command";
import { getPlaygroundAiImageBase64 } from "@/util/playgroundAi";
import { getMessageMediaFromBase64 } from "@/util/whatsappWeb";

export const imageCommand = async (
	commandData: CommandData
): Promise<CommandResponse> => {
	const { text, message } = commandData;

	await message.react("🖼️");

	let initialMedia;

	if (message.hasMedia) {
		initialMedia = await message.downloadMedia();
	}

	const imageBase64 = await getPlaygroundAiImageBase64(text, initialMedia);

	if ("image" in imageBase64) {
		return {
			type: CommandResponseType.Media,
			media: getMessageMediaFromBase64(
				"image/jpeg",
				imageBase64.image.split(",")[1] as string
			),
			message: `*_"${`${text}`.trim()}"_*`,
		};
	}

	return {
		type: CommandResponseType.Text,
		message:
			imageBase64.error || "Something went wrong generating an image 😩",
	};
};
