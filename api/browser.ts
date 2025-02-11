interface ConversationRequestParams {
	body: {
		prompt: string;
		gptConversationId: string;
	};
	baseUrl: string;
	newMessageId: string;
	parentMessageId: string;
	websocketRequestId: string;
}

export const getConversationsResponse = async ({
	body,
	baseUrl,
	newMessageId,
	parentMessageId,
	websocketRequestId,
}: ConversationRequestParams) => {
	let { prompt, gptConversationId: conversationId } = body;

	try {
		window.isQueueing = true;

		const streamModule = window.streamModule;
		const requestsModule = window.requestsModule;
		const sentinelModule = window.sentinelModule;
		const turnstileModule = window.turnstileModule;

		const sentinelInstance = await sentinelModule();
		const turnstileInstance = turnstileModule();

		const query = await requestsModule({ baseUrl });

		const chatRequirementsRequestToken =
			await sentinelInstance.getRequirementsToken();

		const chatRequirementsResponse = await query.chatRequirementsRequest(
			chatRequirementsRequestToken
		);

		const { token: requirementsResponseToken, proofofwork } =
			chatRequirementsResponse;

		const turnstileToken = await turnstileInstance.getEnforcementToken(
			chatRequirementsResponse,
			chatRequirementsRequestToken
		);

		if (conversationId) {
			const conversationIdResponse =
				await query.chatConversationIdRequest(conversationId);

			conversationId =
				conversationIdResponse?.conversation_id || conversationId;
			parentMessageId =
				conversationIdResponse?.current_node || parentMessageId;
		}

		const enforcementToken = await sentinelInstance.getEnforcementToken(
			proofofwork
		);

		const chatCompletionResponse = await query.chatCompletionRequest({
			requirementsResponseToken,
			turnstileToken,
			enforcementToken,
			conversationId,
			newMessageId,
			prompt,
			parentMessageId,
			websocketRequestId,
		});

		const { response, modelSlug, chatConversationId } = await streamModule(
			chatCompletionResponse
		);

		return {
			promptResponse: response,
			modelSlug,
			chatConversationId: chatConversationId || conversationId,
		};
	} catch (error) {
		console.error(error);

		return {
			chatConversationId: conversationId,
			error,
		};
	} finally {
		window.isQueueing = false;
	}
};
