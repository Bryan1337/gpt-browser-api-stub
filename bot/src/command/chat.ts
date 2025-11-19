import { CommandHandleData } from "@/command";
import { reactQueued, reactTyping } from "@/util/message";
import { addMessageToChatQueue } from "@/queue";

export async function chatCommand(data: CommandHandleData) {
	const { message } = data;

	await reactQueued(message);
	await reactTyping(message);

	addMessageToChatQueue(data);
}
