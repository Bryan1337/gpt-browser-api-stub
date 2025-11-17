import Queue, { QueueWorkerCallback } from "queue";
import dotenv from "dotenv";
dotenv.config();
import { Message } from "whatsapp-web.js";
import { logInfo } from "@/util/log";
import { reactError, reply } from "@/util/message";
import { CommandHandleData } from "@/util/command";
import { handleChatQueueItem } from "@/queue_handlers/chat";
import { handleVideoQueueItem } from "@/queue_handlers/video";

const chatQueue = new Queue({
	concurrency: 2,
	autostart: true,
	timeout: 60 * 5 * 1000
});

const videoQueue = new Queue({
	concurrency: 2,
	autostart: true,
	timeout: 60 * 5 * 1000
});

const chatJobMap: WeakMap<Function, Message> = new WeakMap();
const videoJobMap: WeakMap<Function, Message> = new WeakMap();

const maxChatAttempts = 10;
const delayBetweenAttempts = 5e3;

chatQueue.addEventListener("timeout", (error) => {
	logInfo("Chat job timed out...", error);

	const { job } = error.detail;

	const message = chatJobMap.get(job);

	if (message) {
		reply(message, `Something went wrong, The request timed out.`);
		reactError(message);
		chatJobMap.delete(job);
	}

	error.detail.next();
});

videoQueue.addEventListener("timeout", (error) => {
	logInfo("Video job timed out...", error);

	const { job } = error.detail;

	const message = videoJobMap.get(job);

	if (message) {
		reply(message, `Something went wrong, The video request timed out.`);
		reactError(message);
	}

	error.detail.next();
});

videoQueue.start();
chatQueue.start();

export const addMessageToVideoQueue = async (
	commandData: CommandHandleData
) => {
	const videoJob = async (callback: QueueWorkerCallback | undefined) => {
		await handleVideoQueueItem(commandData, delayBetweenAttempts);
		callback?.();
		videoJobMap.delete(videoJob);
	};

	videoQueue.push(videoJob);
	videoJobMap.set(videoJob, commandData.message);
};

export const addMessageToChatQueue = async (commandData: CommandHandleData) => {
	const chatJob = async (callback: QueueWorkerCallback | undefined) => {
		await handleChatQueueItem(
			commandData,
			1,
			maxChatAttempts,
			delayBetweenAttempts
		);
		callback?.();
		chatJobMap.delete(chatJob);
	};

	chatQueue.push(chatJob);
	chatJobMap.set(chatJob, commandData.message);
};
