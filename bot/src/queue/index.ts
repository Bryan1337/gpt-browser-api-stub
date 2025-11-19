import Queue, { QueueWorkerCallback } from "queue";
import { Message } from "whatsapp-web.js";
import { logInfo } from "@/util/log";
import { reactError, reply } from "@/util/message";
import { handleChatQueueJob } from "@/queue/job/chat";
import { handleVideoQueueJob } from "@/queue/job/video";
import { CommandHandleData } from "@/command";

const chatQueue = new Queue({
	concurrency: 2,
	autostart: true,
	timeout: 60 * 5 * 1000,
});

const videoQueue = new Queue({
	concurrency: 2,
	autostart: true,
	timeout: 60 * 5 * 1000,
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

export async function addMessageToVideoQueue(commandData: CommandHandleData) {
	const videoJob = async (callback: QueueWorkerCallback | undefined) => {
		await handleVideoQueueJob(commandData, delayBetweenAttempts);
		callback?.();
		videoJobMap.delete(videoJob);
	};

	videoQueue.push(videoJob);
	videoJobMap.set(videoJob, commandData.message);
}

export async function addMessageToChatQueue(commandData: CommandHandleData) {
	const chatJob = async (callback: QueueWorkerCallback | undefined) => {
		await handleChatQueueJob(commandData, 1, maxChatAttempts, delayBetweenAttempts);
		callback?.();
		chatJobMap.delete(chatJob);
	};

	chatQueue.push(chatJob);
	chatJobMap.set(chatJob, commandData.message);
}
