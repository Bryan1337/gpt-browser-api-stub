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

	const baseRequest = async (route: string, params) => {
		const requestParams = getRequestParams(params);
		return await fetch(`${baseUrl}${route}`, requestParams);
	};

	const baseJsonRequest = async (route: string, params) => {
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

	const chatRequirementsRequest = async ({
		chatRequirementsRequestToken,
	}) => {
		return basePostRequest(`/backend-api/sentinel/chat-requirements`, {
			body: {
				p: chatRequirementsRequestToken,
			},
		});
	};

	const chatConversationIdRequest = async ({ conversationId }) => {
		return baseGetRequest(`/backend-api/conversation/${conversationId}`);
	};

	const chatCompletionRequest = async (chatCompletionData) => {
		const {
			requirementsResponseToken,
			enforcementToken,
			conversationId,
			newMessageId,
			prompt,
			parentMessageId,
			websocketRequestId,
		} = chatCompletionData;
		const chatCompletionResponse = await baseRequest(
			`/backend-api/conversation`,
			{
				method: "POST",
				headers: {
					accept: "text/event-stream",
					"content-type": "application/json",
					"oai-device-id": "4843d7c1-b375-426e-9580-117518da0be6",
					"oai-language": "en-US",
					"openai-sentinel-chat-requirements-token":
						requirementsResponseToken,
					"openai-sentinel-proof-token": enforcementToken,
					"oai-echo-logs": [
						0, 11714, 1, 11718, 0, 43698, 1, 44766, 1, 47114, 0,
						48230,
					].join(","),
				},
				body: {
					action: "next",
					conversation_id: conversationId,
					conversation_mode: {
						kind: "primary_assistant",
					},
					force_nulligen: false,
					force_paragen: false,
					force_paragen_model_slug: "",
					force_rate_limit: false,
					history_and_training_disabled: false,
					messages: [
						{
							id: newMessageId,
							author: {
								role: "user",
							},
							content: {
								content_type: "text",
								parts: [prompt],
							},
							metadata: {},
						},
					],
					model: "auto",
					parent_message_id: parentMessageId,
					reset_rate_limits: false,
					suggestions: [],
					timezone_offset_min: new Date().getTimezoneOffset(),
					websocket_request_id: websocketRequestId,
				},
			}
		);

		if (
			chatCompletionResponse.status ===
			ResponseCodes.CONVERSATION_TOO_LONG
		) {
			delete chatCompletionData.conversationId;
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
