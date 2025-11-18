interface ConversationRequestParams {
	body: {
		prompt: string;
		gptConversationId: string;
	};
	newMessageId: string;
	parentMessageId: string;
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
		const { stream, conversationRequest, sentinel, turnstile } =
			window.gptBoyUtils;

		const streamUtil = stream();
		const sentinelUtil = sentinel();
		const turnstileUtil = turnstile();
		const requestUtil = await conversationRequest();

		const chatRequirementsRequestToken =
			await sentinelUtil.getRequirementsToken();

		const chatRequirementsResponse = await requestUtil.chatRequirements(
			chatRequirementsRequestToken
		);

		const { token: requirementsResponseToken, proofofwork } =
			chatRequirementsResponse;

		const turnstileToken = await turnstileUtil.getEnforcementToken(
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
			const conversationIdResponse = await requestUtil.chatConversationId(
				conversationId
			);

			if (conversationIdResponse.current_node) {
				chatCompletionParams.parentMessageId =
					conversationIdResponse.current_node;
			}
		}

		const enforcementToken = await sentinelUtil.getEnforcementToken(
			proofofwork
		);

		const chatCompletionRequestParams = {
			...chatCompletionParams,
			enforcementToken,
		};

		let chatCompletionResponse = await requestUtil.chatCompletion(
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

			chatCompletionResponse = await requestUtil.chatCompletion(
				chatCompletionRequestParamsWithoutConversationId
			);
		}

		if (tooManyRequests) {
			throw new Error("Too many requests.");
		}

		const { answer, modelSlug, chatConversationId } =
			await streamUtil.parseResponse(chatCompletionResponse);

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
