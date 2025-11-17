import {
	Message,
	MessageContent,
	MessageMedia,
	MessageSendOptions
} from "whatsapp-web.js";

export function reply(message: Message, text: string) {
	return message.reply(`${process.env.BOT_PREFIX} ${text}`);
}

export function edit(message: Message, text: string) {
	return message.edit(`${process.env.BOT_PREFIX} ${text}`);
}

export function replyWithMedia(
	message: Message,
	text: MessageContent,
	messageSendOptions: MessageSendOptions
) {
	return message.reply(
		`${process.env.BOT_PREFIX} ${text}`,
		undefined,
		messageSendOptions
	);
}

export function replyWithMessageMedia(message: Message, audio: MessageMedia) {
	return message.reply(audio);
}

export function react(message: Message, emoji: string) {
	return message.react(emoji);
}

export function reactSuccess(message: Message) {
	return react(message, "✅");
}

export function reactError(message: Message) {
	return react(message, "❌");
}

export function reactBlocked(message: Message) {
	return react(message, "🚫");
}

export function reactQueued(message: Message) {
	return react(message, "💤");
}

export function reactPending(message: Message) {
	return react(message, "🕤");
}

export function reactImage(message: Message) {
	return react(message, "🖼️");
}

export function reactVideo(message: Message) {
	return react(message, "🎥");
}

export async function reactTyping(message: Message) {
	const chat = await message.getChat();
	await chat.sendStateTyping();
}
