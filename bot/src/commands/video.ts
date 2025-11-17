import { CommandHandleData } from "@/util/command";
import { reactQueued } from "@/util/message";
import { addMessageToVideoQueue } from "@/util/queue";

export const videoCommand = async (data: CommandHandleData) => {
	const { message } = data;

	await reactQueued(message);

	addMessageToVideoQueue(data);
};
