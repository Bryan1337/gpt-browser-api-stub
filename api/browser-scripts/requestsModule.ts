interface RequestsModuleRequestProps {
	method: "POST" | "GET";
	headers: Record<string, string>;
	body: Record<string, string>;
}

type RequestsModuleRequest = (props: any) => Promise<any>;

type RequestsModule = Record<string, RequestsModuleRequest>;

interface RequestsModuleProps {
	baseUrl: string;
}

enum ResponseCodes {
	OK = 200,
	CONVERSATION_TOO_LONG = 413,
	TOO_MANY_REQUESTS = 429,
}

interface ChatCompletionData {
	requirementsResponseToken: string;
	turnstileToken: string;
	enforcementToken: string;
	conversationId: string;
	newMessageId: string;
	prompt: string;
	parentMessageId: string;
	websocketRequestId: string;
}

export type RequestsModuleCall = (
	props: RequestsModuleProps
) => Promise<RequestsModule>;

const requestsModule: RequestsModuleCall = async ({ baseUrl }) => {
	let accessToken: string | undefined;

	const getRequestParams = (
		params: Partial<RequestsModuleRequestProps> = {}
	) => ({
		method: params.method,
		headers: {
			...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
			...(params.headers || {}),
		},
		...(params.method === "POST"
			? {
					body: JSON.stringify({
						...(params.body || {}),
					}),
			  }
			: {}),
	});

	const baseRequest = async (
		route: string,
		params: Record<string, unknown>
	) => {
		const requestParams = getRequestParams(params);
		return await fetch(`${baseUrl}${route}`, requestParams);
	};

	const baseJsonRequest = async (
		route: string,
		params: Record<string, unknown>
	) => {
		const response = await baseRequest(route, params);
		return await response.json();
	};

	const baseGetRequest = async (route: string, params = {}) => {
		return baseJsonRequest(route, {
			...params,
			method: "GET",
		});
	};

	const basePostRequest = async (route: string, params = {}) => {
		return baseJsonRequest(route, {
			...params,
			method: "POST",
		});
	};

	const chatAuthRequest = async () => {
		const authResponse = await baseGetRequest(`/api/auth/session?oai-dm=1`);
		accessToken = authResponse.accessToken;
	};

	const chatRequirementsRequest = async (
		chatRequirementsRequestToken: string
	) => {
		return basePostRequest(`/backend-api/sentinel/chat-requirements`, {
			body: {
				p: chatRequirementsRequestToken,
			},
		});
	};

	const chatConversationIdRequest = async (conversationId: string) => {
		return baseGetRequest(`/backend-api/conversation/${conversationId}`);
	};

	const getChatCompletionParams = (
		chatCompletionData: ChatCompletionData
	) => {
		const {
			requirementsResponseToken,
			turnstileToken,
			enforcementToken,
			conversationId,
			newMessageId,
			prompt,
			parentMessageId,
			websocketRequestId,
		} = chatCompletionData;

		return {
			method: "POST",
			headers: {
				accept: "text/event-stream",
				"content-type": "application/json",
				"oai-device-id": "049fa3f2-7680-46b6-9a91-f29b6731bc37",
				"oai-language": "en-US",
				"openai-sentinel-chat-requirements-token":
					requirementsResponseToken,
				/** @todo Add arkose module */
				// "openai-sentinel-arkose-token": null,
				"openai-sentinel-turnstile-token": turnstileToken,
				"openai-sentinel-proof-token": enforcementToken,
				// "openai-sentinel-token": null,
				"oai-echo-logs": [
					0, 11714, 1, 11718, 0, 43698, 1, 44766, 1, 47114, 0, 48230,
				].join(","),
			},
			body: {
				action: "next",
				conversation_id: conversationId,
				conversation_mode: {
					kind: "primary_assistant",
				},
				conversation_origin: null,
				force_nulligen: false,
				force_paragen: false,
				force_paragen_model_slug: "",
				force_rate_limit: false,
				force_use_sse: true,
				history_and_training_disabled: false,
				messages: [
					{
						author: {
							role: "user",
						},
						content: {
							content_type: "text",
							parts: [prompt],
						},
						create_time: new Date().getTime() / 1000,
						id: newMessageId,
						metadata: {},
					},
				],
				model: "auto",
				parent_message_id: parentMessageId,
				reset_rate_limits: false,
				suggestions: [],
				system_hints: [],
				timezone_offset_min: new Date().getTimezoneOffset(),
				websocket_request_id: websocketRequestId,
			},
		};
	};

	const chatCompletionRequest = async (
		chatCompletionData: ChatCompletionData
	) => {
		const params = getChatCompletionParams(chatCompletionData);

		const chatCompletionResponse = await baseRequest(
			`/backend-api/conversation`,
			params
		);

		if (
			chatCompletionResponse.status ===
			ResponseCodes.CONVERSATION_TOO_LONG
		) {
			const newChatCompletionData: Partial<ChatCompletionData> = {
				...chatCompletionData,
			};
			delete newChatCompletionData.conversationId;

			return await chatCompletionRequest(chatCompletionData);
		}

		if (chatCompletionResponse.status === ResponseCodes.TOO_MANY_REQUESTS) {
			throw new Error("Too many requests 😫");
		}

		return chatCompletionResponse;
	};

	await chatAuthRequest();

	return {
		chatCompletionRequest,
		chatConversationIdRequest,
		chatRequirementsRequest,
	};
};

export default requestsModule;
