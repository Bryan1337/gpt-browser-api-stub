
export const sanitizePrompt = (prompt = '', exclude = null) => {

	const splitMessage = prompt.split(exclude);

	return splitMessage.join(' ').trim();
}