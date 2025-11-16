export type RequestsModule = (
	type: RequestsType
) => ReturnType<typeof requestsModule>;

type RequestsType = "chat-gpt" | "sora";

const requestsModule = async (type: RequestsType) => {
	const CHATGPT_BASE_URL = "https://chatgpt.com";
	const SORA_BASE_URL = "https://sora.chatgpt.com";

	enum SoraUrl {
		SESSION = `${SORA_BASE_URL}/api/auth/session`,
		VIDEO_DRAFTS = `${SORA_BASE_URL}/backend/project_y/profile/drafts`,
		USAGE = `${SORA_BASE_URL}/backend/nf/check`,
		CREATE = `${SORA_BASE_URL}/backend/nf/create`,
		PENDING = `${SORA_BASE_URL}/backend/nf/pending`,
	}

	enum ChatGptUrl {
		SESSION = `${CHATGPT_BASE_URL}/api/auth/session`,
		CHAT_REQUIREMENTS = `${CHATGPT_BASE_URL}/backend-api/sentinel/chat-requirements`,
		CONVERSATION = `${CHATGPT_BASE_URL}/backend-api/conversation`,
		CHAT_COMPLETION = `${CHATGPT_BASE_URL}/backend-api/f/conversation`,
	}

	function getSessionUrl() {
		return type === "sora" ? SoraUrl.SESSION : ChatGptUrl.SESSION;
	}

	function getChatCompletionHeaders(data: ChatCompletionData) {
		return {
			accept: "text/event-stream",
			"content-type": "application/json",
			"oai-device-id": "049fa3f2-7680-46b6-9a91-f29b6731bc37",
			"oai-language": "en-US",
			"openai-sentinel-chat-requirements-token":
				data.requirementsResponseToken,
			"openai-sentinel-turnstile-token": data.turnstileToken,
			"openai-sentinel-proof-token": data.enforcementToken,
			"oai-echo-logs": "0,50179,1,50182,0,50505,1,52811",
		};
	}

	function getChatCompletionBodyParams(data: ChatCompletionData) {
		return {
			action: "next",
			messages: [
				{
					id: data.newMessageId,
					author: { role: "user" },
					create_time: new Date().getTime() / 1000,
					content: { content_type: "text", parts: [data.prompt] },
					metadata: {
						selected_github_repos: [],
						selected_all_github_repos: false,
						serialization_metadata: { custom_symbol_offsets: [] },
					},
				},
			],
			conversation_id: data.conversationId,
			parent_message_id: data.parentMessageId,
			model: "auto",
			timezone_offset_min: new Date().getTimezoneOffset(),
			timezone: "Europe/Amsterdam",
			conversation_mode: { kind: "primary_assistant" },
			enable_message_followups: true,
			system_hints: [],
			supports_buffering: true,
			supported_encodings: ["v1"],
			paragen_cot_summary_display_override: "allow",
			force_parallel_switch: "auto",
		};
	}

	function getVideoBodyParams(prompt: string) {
		return {
			kind: "video",
			prompt,
			title: null,
			orientation: "portrait",
			size: "small",
			n_frames: 300,
			inpaint_items: [],
			remix_target_id: null,
			metadata: null,
			cameo_ids: null,
			cameo_replacements: null,
			model: "sy_8",
			style_id: null,
			audio_caption: null,
			audio_transcript: null,
			video_caption: null,
			storyboard_id: null,
		};
	}

	function delay(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async function request(url: string, params: RequestInit) {
		return await fetch(url, params);
	}

	async function jsonRequest(url: string, params: Record<string, unknown>) {
		const response = await request(url, params);
		return await response.json();
	}

	async function get(url: string, params = {}) {
		return jsonRequest(url, { ...params, method: "GET" });
	}

	async function post(url: string, params = {}) {
		return jsonRequest(url, { ...params, method: "POST" });
	}

	async function sessionRequest(): Promise<SessionResponse> {
		const sessionUrl = getSessionUrl();
		return get(`${sessionUrl}?oai-dm=1`);
	}

	async function getAccessToken() {
		const authResponse = await sessionRequest();

		if (!authResponse.accessToken) {
			await delay(2500);
			return await getAccessToken();
		}

		return authResponse.accessToken;
	}

	const accessToken = await getAccessToken();

	async function chatRequirements(
		chatRequirementsRequestToken: string
	): Promise<ChatRequirementsResponse> {
		return post(ChatGptUrl.CHAT_REQUIREMENTS, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
			body: { p: chatRequirementsRequestToken },
		});
	}

	async function chatConversationId(
		conversationId: string
	): Promise<ChatConversationIdResponse> {
		return get(`${ChatGptUrl.CONVERSATION}/${conversationId}`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
		});
	}

	async function chatCompletion(chatCompletionData: ChatCompletionData) {
		return request(ChatGptUrl.CHAT_COMPLETION, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				...getChatCompletionHeaders(chatCompletionData),
			},
			body: JSON.stringify(
				getChatCompletionBodyParams(chatCompletionData)
			),
		});
	}

	async function videoUsageRequest(): Promise<VideoUsageResponse> {
		return get(SoraUrl.USAGE, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
		});
	}

	async function videoDraftRequest(): Promise<VideoDraftsResponse> {
		return get(SoraUrl.VIDEO_DRAFTS, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
		});
	}

	async function videoPendingRequest(): Promise<VideoPendingResponse> {
		return get(SoraUrl.PENDING, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
		});
	}

	async function videoRequest(prompt: string): Promise<VideoResponse> {
		const body = getVideoBodyParams(prompt);
		return post(SoraUrl.CREATE, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});
	}

	return {
		chatCompletion,
		chatConversationId,
		chatRequirements,
		videoUsageRequest,
		videoDraftRequest,
		videoPendingRequest,
		videoRequest,
	};
};

export default requestsModule;
