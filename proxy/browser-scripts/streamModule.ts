
export type StreamModuleCall = (responseData: Response) => Promise<string>;

const streamModule: StreamModuleCall = async (responseData) => {

	const streamFinishedIndicator = '[DONE]';

	let promptResponse = '';

	const handleChunk = (chunk) => {

		try {

			if (chunk.substring(5).trim() === streamFinishedIndicator) {

				return;
			}

			const data = JSON.parse(chunk.substring(5));

			if (data.message.content.parts[0] === promptResponse) {
				return;
			}

			promptResponse = data.message.content.parts[0];

		} catch (error) {

			const chunks = chunk.split('\n\n').filter(Boolean);
			// Sometimes multiple chunks are received at once
			if (chunks.length > 1) {

				for (const chunk of chunks) {

					handleChunk(chunk);
				}
			}
		}
	}

	const readableStream = responseData.body;

	if(!readableStream) {

		return null;
	}

	const decoder = new TextDecoder();

	const readStream = async (reader) => {

		const { done, value } = await reader.read();

		if (done) {

			return promptResponse;
		}

		const chunk = decoder.decode(value, { stream: true });

		handleChunk(chunk);

		return await readStream(reader);
	};

	const reader = readableStream.getReader();
	const finalResponse = await readStream(reader);

	return finalResponse;
}

export default streamModule