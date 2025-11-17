import Queue from "queue";
import dotenv from "dotenv";
dotenv.config();
import { Message } from "whatsapp-web.js";
import { logInfo, logWarning } from "@/util/log";
import { reactError, reply } from "@/util/message";
import { CommandHandleData } from "@/util/command";
import { handleChatQueueItem } from "@/queue_handlers/chat";
import { handleVideoQueueItem } from "@/queue_handlers/video";

const queue = new Queue({
	concurrency: 1,
	autostart: true,
	timeout: 60 * 5 * 1000
});

const maxChatAttempts = 10;
const delayBetweenAttempts = 5e3;

let messageProxy: Message | null = null;

queue.addEventListener("timeout", (error) => {
	logInfo("Job timed out...");

	if (messageProxy) {
		reply(messageProxy, `Sorry, The request timed out 😫.`);
		reactError(messageProxy);
	}

	error.detail.next();
});

queue.start();

export enum QueueItemType {
	VIDEO = "video",
	CHAT = "chat"
}

const handleQueueItem = async (
	commandData: CommandHandleData,
	type: QueueItemType
) => {
	switch (type) {
		case QueueItemType.VIDEO:
			return await handleVideoQueueItem(
				commandData,
				delayBetweenAttempts
			);
		case QueueItemType.CHAT:
			return await handleChatQueueItem(
				commandData,
				1,
				maxChatAttempts,
				delayBetweenAttempts
			);
		default:
			logWarning(`Unknown queue item type requested: ${type}`);
	}
};

export const addMessageToQueue = async (
	commandData: CommandHandleData,
	type: QueueItemType
) => {
	messageProxy = commandData.message;

	queue.push(async (callback) => {
		await handleQueueItem(commandData, type);
		callback?.();
	});
};
