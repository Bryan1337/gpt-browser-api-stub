export type StreamModuleResponseData = {
	modelSlug: string;
	response: string;
	chatConversationId: number | null;
};

export type StreamModuleCall = (
	responseData: Response
) => Promise<StreamModuleResponseData>;

const streamModule: StreamModuleCall = async (responseData) => {
	const streamFinishedIndicator = "[DONE]";

	let promptResponse = "";

	let modelSlug = "";

	let conversationId = null;

	const handleChunk = (chunk: string): void | { error: string } => {
		try {
			if (chunk.substring(5).trim() === streamFinishedIndicator) {
				return;
			}

			const data = JSON.parse(chunk.substring(5));

			modelSlug = data?.message?.metadata?.model_slug || modelSlug;

			if (data.error) {
				return { error: data.error };
			}

			if (data.message.content.parts[0] === promptResponse) {
				return;
			}

			if (data.message?.status === "finished_successfully") {
				return;
			}

			conversationId = data.conversation_id;

			promptResponse = data.message.content.parts[0];
		} catch (error) {
			const chunks = chunk.split("\n\n").filter(Boolean);
			// Sometimes multiple chunks are received at once
			if (chunks.length > 1) {
				for (const chunk of chunks) {
					return handleChunk(chunk);
				}
			}
		}
	};

	const readableStream = responseData.body;

	if (!readableStream) {
		throw new Error("No readable stream found in body data...");
	}

	const decoder = new TextDecoder();

	const readStream = async (
		reader: ReadableStreamDefaultReader
	): Promise<string> => {
		const { done, value } = await reader.read();

		if (done) {
			return promptResponse;
		}

		const chunk = decoder.decode(value, { stream: true });

		const chunkResponse = handleChunk(chunk);

		if (chunkResponse?.error) {
			return chunkResponse.error;
		}

		return await readStream(reader);
	};

	const reader = readableStream.getReader();
	const finalResponse = await readStream(reader);

	return {
		response: finalResponse,
		modelSlug,
		chatConversationId: conversationId,
	};
};

export default streamModule;
