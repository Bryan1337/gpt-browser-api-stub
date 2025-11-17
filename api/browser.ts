import { Page } from "puppeteer";
import { RequestsModule } from "./browser-scripts/requestsModule";
import { SentinelModule } from "./browser-scripts/sentinelModule";
import { StreamModule } from "./browser-scripts/streamModule";
import { TurnstileModule } from "./browser-scripts/turnstileModule";

interface ConversationRequestParams {
	body: {
		prompt: string;
		gptConversationId: string;
	};
	newMessageId: string;
	parentMessageId: string;
}

declare global {
	interface Performance {
		memory: {
			jsHeapSizeLimit: number;
			totalJSHeapSize: number;
			usedJSHeapSize: number;
		};
	}
	interface Window {
		streamModule: StreamModule;
		requestsModule: RequestsModule;
		sentinelModule: SentinelModule;
		turnstileModule: TurnstileModule;
	}

	namespace Express {
		interface Request {
			pages: {
				soraPage: Page;
				chatGptPage: Page;
			};
		}
	}
}

enum ResponseCode {
	OK = 200,
	CONVERSATION_TOO_LONG = 413,
	TOO_MANY_REQUESTS = 429,
}

export const getConversationsResponse = async ({
	body,
	newMessageId,
	parentMessageId,
}: ConversationRequestParams) => {
	let { prompt, gptConversationId: conversationId } = body;

	try {
		const {
			streamModule,
			requestsModule,
			sentinelModule,
			turnstileModule,
		} = window;

		const stream = streamModule();
		const sentinel = sentinelModule();
		const turnstile = turnstileModule();
		const request = await requestsModule("chat-gpt");

		const chatRequirementsRequestToken =
			await sentinel.getRequirementsToken();

		const chatRequirementsResponse = await request.chatRequirements(
			chatRequirementsRequestToken
		);

		const { token: requirementsResponseToken, proofofwork } =
			chatRequirementsResponse;

		const turnstileToken = await turnstile.getEnforcementToken(
			chatRequirementsResponse,
			chatRequirementsRequestToken
		);

		const chatCompletionParams = {
			requirementsResponseToken,
			turnstileToken,
			conversationId,
			newMessageId,
			prompt,
			parentMessageId,
		};

		if (conversationId) {
			const conversationIdResponse = await request.chatConversationId(
				conversationId
			);

			if (conversationIdResponse.current_node) {
				chatCompletionParams.parentMessageId =
					conversationIdResponse.current_node;
			}
		}

		const enforcementToken = await sentinel.getEnforcementToken(
			proofofwork
		);

		const chatCompletionRequestParams = {
			...chatCompletionParams,
			enforcementToken,
		};

		let chatCompletionResponse = await request.chatCompletion(
			chatCompletionRequestParams
		);

		const conversationTooLong =
			chatCompletionResponse.status ===
			ResponseCode.CONVERSATION_TOO_LONG;
		const tooManyRequests =
			chatCompletionResponse.status === ResponseCode.TOO_MANY_REQUESTS;

		if (conversationTooLong) {
			const {
				conversationId: _,
				...chatCompletionRequestParamsWithoutConversationId
			} = chatCompletionRequestParams;

			chatCompletionResponse = await request.chatCompletion(
				chatCompletionRequestParamsWithoutConversationId
			);
		}

		if (tooManyRequests) {
			throw new Error("Too many requests.");
		}

		const { answer, modelSlug, chatConversationId } =
			await stream.parseResponse(chatCompletionResponse);

		console.log(answer, modelSlug, chatConversationId);

		return {
			answer,
			modelSlug,
			chatConversationId: chatConversationId || conversationId,
		};
	} catch (error) {
		console.error(error);

		return {
			chatConversationId: conversationId,
			error,
		};
	}
};

export const getVideoResponse = async ({
	body,
}: {
	body: { prompt: string };
}) => {
	function formatSeconds(seconds: number) {
		const days = Math.floor(seconds / 86400);
		seconds %= 86400;

		const hours = Math.floor(seconds / 3600);
		seconds %= 3600;

		const minutes = Math.floor(seconds / 60);
		seconds = Math.floor(seconds % 60);

		const parts = [];

		if (days > 0) {
			parts.push(`${days} day${days !== 1 ? "s" : ""}`);
		}
		if (hours > 0) {
			parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
		}
		if (minutes > 0) {
			parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
		}
		if (seconds > 0 || parts.length === 0) {
			parts.push(`${seconds} second${seconds !== 1 ? "s" : ""}`);
		}

		return parts.join(", ");
	}

	try {
		const { prompt } = body;

		const requestsModule = window.requestsModule;
		const request = await requestsModule("sora");

		const usageResponse = await request.videoUsageRequest();

		const numVideosRemaining =
			usageResponse.rate_limit_and_credit_balance
				.estimated_num_videos_remaining ?? 0;

		if (usageResponse.rate_limit_and_credit_balance.rate_limit_reached) {
			const resetInSeconds =
				usageResponse.rate_limit_and_credit_balance
					.access_resets_in_seconds ?? 0;

			const timeRemaining = formatSeconds(resetInSeconds);

			return {
				error: `No video generations left. Reset occurs in ${timeRemaining}.`,
			};
		}

		const videoResponse = await request.videoRequest(prompt);

		return {
			taskId: videoResponse.id,
			numVideosRemaining: numVideosRemaining - 1,
		};
	} catch (error) {
		return { error };
	}
};

export const getPendingVideoResponse = async ({
	body,
}: {
	body: { taskId: string };
}) => {
	const { taskId } = body;

	const requestsModule = window.requestsModule;
	const request = await requestsModule("sora");

	const pendingResponse = await request.videoPendingRequest();

	console.log({ pendingResponse });

	if (!Array.isArray(pendingResponse)) {
		return {
			error: pendingResponse,
		};
	}

	const pendingTask = (pendingResponse ?? []).find(
		(task: any) => task.id === taskId
	);

	if (!pendingTask) {
		return {
			task: null,
		};
	}

	return {
		progress: pendingTask.progress_pct,
	};
};

export const getVideoDraftResponse = async ({
	body,
}: {
	body: { taskId: string };
}) => {
	try {
		const { taskId } = body;

		const fetchDraft = async () => {
			const requestsModule = window.requestsModule;
			const request = await requestsModule("sora");

			return await request.videoDraftRequest();
		};

		let draft;
		let attempt = 1;
		const maxAttempts = 10;

		const pause = async (amountOfMs: number) => {
			return await new Promise((resolve) =>
				setTimeout(resolve, amountOfMs)
			);
		};

		while (!draft && attempt < maxAttempts) {
			const drafts = await fetchDraft();

			await pause(2500);
			draft = drafts.items.find((item) => item.task_id === taskId);
			attempt++;
		}

		if (!draft) {
			return {
				error: `Unable to find draft after ${maxAttempts} attempts.`,
			};
		}

		return draft;
	} catch (error) {
		console.log(error);
		return { error };
	}
};
