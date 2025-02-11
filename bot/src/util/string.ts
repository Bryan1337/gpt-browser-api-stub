export const sanitize = (prompt: string = "", exclude: string = " ") => {
	const splitMessage = prompt.split(exclude);

	return splitMessage.join(" ").trim();
};
