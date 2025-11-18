export type ConversationRequestUtil = typeof conversationRequestUtil;

interface ChatCompletionData {
	requirementsResponseToken: string;
	turnstileToken: string;
	enforcementToken: string;
	conversationId?: string;
	newMessageId: string;
	prompt: string;
	parentMessageId: string;
}

const conversationRequestUtil = async () => {
	const { get, post, request, getAccessToken } =
		await window.gptBoyUtils.request();

	const BASE_URL = "https://chatgpt.com";

	enum Url {
		SESSION = `${BASE_URL}/api/auth/session`,
		CHAT_REQUIREMENTS = `${BASE_URL}/backend-api/sentinel/chat-requirements`,
		CONVERSATION = `${BASE_URL}/backend-api/conversation`,
		CHAT_COMPLETION = `${BASE_URL}/backend-api/f/conversation`,
	}

	const accessToken = await getAccessToken(Url.SESSION);

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

	async function chatRequirements(
		chatRequirementsRequestToken: string
	): Promise<ChatGPTResponse.ChatRequirements> {
		return post(Url.CHAT_REQUIREMENTS, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
			body: { p: chatRequirementsRequestToken },
		});
	}

	async function chatConversationId(
		conversationId: string
	): Promise<ChatGPTResponse.ChatConversationId> {
		return get(`${Url.CONVERSATION}/${conversationId}`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
		});
	}

	async function chatCompletion(chatCompletionData: ChatCompletionData) {
		return request(Url.CHAT_COMPLETION, {
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

	return {
		chatCompletion,
		chatConversationId,
		chatRequirements,
	};
};

export default conversationRequestUtil;
