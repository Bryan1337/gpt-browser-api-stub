import { CommandHandleData } from "@/command";
import { react, reactQueued, reply } from "@/util/message";
import { addMessageToVideoQueue } from "@/queue";
import { getBlocklist } from "@/data_handlers/sora_ai/getBlocklist";

export const videoCommand = async (data: CommandHandleData) => {
	const { message } = data;

	const { remote } = message.id;

	const blocklist = getBlocklist();
	const blockData = blocklist.find((block) => block.id === remote);

	if (blockData) {
		reply(
			message,
			`You've been blocked from making video requests. Reason: "${blockData.reason}"`,
		);

		react(message, blockData.reactEmoji ?? "❌");

		return;
	}

	await reactQueued(message);

	addMessageToVideoQueue(data);
};
