import { CommandHandleData } from "@/util/command";
import { reactQueued, reactTyping } from "@/util/message";
import { addMessageToQueue, QueueItemType } from "@/util/queue";

export async function chatCommand(data: CommandHandleData) {
	const { message } = data;

	await reactQueued(message);
	await reactTyping(message);

	addMessageToQueue(data, QueueItemType.CHAT);
}
