import { Message } from "whatsapp-web.js";

export const sanitizePrompt = (prompt: string = "", exclude: string = " ") => {
	const splitMessage = prompt.split(exclude);

	return splitMessage.join(" ").trim();
};

export const isRequestMessage = (message: Message) => {
	return message.body.includes(`@${process.env.USER_PHONE_ID}`);
};
