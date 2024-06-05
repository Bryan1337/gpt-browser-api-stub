import { validateAccessKey } from "./accessKeyHelper";
import { sanitizePrompt } from "./messageHelper";
import { addToWhiteList } from "./whitelistHelper";
import { addContext, clearContext, getContext } from "./contextHelper";
import {
	SupportedLanguage,
	disableAudioResponse,
	enableAudioResponse,
} from "./ttsHelper";
import { getAiImageBase64 } from "./imageHelper";
import {
	getMessageMediaFromBase64,
	getMessageMediaFromUrl,
} from "./whatsappHelper";
import { Message, MessageMedia } from "whatsapp-web.js";
import { getVideo } from "./textToVideoHelper";

interface CommandTextResponse {
	type: CommandResponseType.Text;
	message: string;
}

interface CommandMediaResponse {
	type: CommandResponseType.Media;
	message: string;
	media: MessageMedia;
}

type CommandResponse = CommandTextResponse | CommandMediaResponse;

enum CommandResponseType {
	Text = "text",
	Media = "media",
	Audio = "audio",
	None = "none",
}

interface CommandData {
	message: Message;
	text: string;
}

interface CommandHandle {
	/**
	 * Should start with a "!"
	 */
	command: `!${string}`;
	description: string;
	handler: (commandData: CommandData) => Promise<CommandResponse>;
}

const getCommands = (): Record<string, CommandHandle> => ({
	register: {
		command: "!register",
		description: `Registers a chat/conversation with the bot. Usage:\n \`\`\`!register <registration key>\`\`\``,
		handler: registerCommand,
	},
	context: {
		command: "!context",
		description: `Adds/updates the context for the current chat/conversation. Usage:\n \`\`\`!context <context>\`\`\``,
		handler: contextCommand,
	},
	getContext: {
		command: "!getContext",
		description: `Shows the context for the current chat/conversation. Usage:\n \`\`\`!getContext\`\`\``,
		handler: getContextCommand,
	},
	clearContext: {
		command: "!clearContext",
		description: `Clears the context for the current chat/conversation. Usage:\n \`\`\`!clearContext\`\`\``,
		handler: clearContextCommand,
	},
	help: {
		command: "!help",
		description: `Shows the list of commands. Usage:\n \`\`\`!help\`\`\``,
		handler: helpCommand,
	},
	enableAudio: {
		command: "!enableAudio",
		description: `Enables audio responses. Usage:\n \`\`\`!enableAudio <languagecode> (nl, en, fr etc...)\`\`\`\n Supported languages are: ${Object.keys(
			SupportedLanguage
		).join(", ")}`,
		handler: enableAudioCommand,
	},
	disableAudio: {
		command: "!disableAudio",
		description: `Disables audio responses. Usage:\n \`\`\`!disableAudio\`\`\``,
		handler: disableAudioCommand,
	},
	videoUrl: {
		command: "!videoUrl",
		description: `Sends a video from an image url along with a prompt. Usage:\n \`\`\`!videoUrl <image url> <video prompt>\`\`\``,
		handler: videoUrlCommand,
	},
	video: {
		command: "!video",
		description: `Sends a video. Usage:\n \`\`\`!video <video prompt>\`\`\``,
		handler: videoCommand,
	},
	image: {
		command: "!image",
		description: `Sends an image. Usage:\n \`\`\`!image <image prompt>\`\`\``,
		handler: imageCommand,
	},
	// stopLoop: {
	// 	command: '!stopLoop',
	// 	description: `Stops the bot from talking to itself. Usage:\n \`\`\`!stopLoop\`\`\``,
	// }
});

const helpCommand = async (): Promise<CommandResponse> => {
	const commands = getCommands();

	return {
		type: CommandResponseType.Text,
		message: `The current commands are: \n\n ${Object.values(commands)
			.map((command) => `*${command.command}*\n ${command.description}`)
			.join("\n\n")}`,
	};
};

const registerCommand = async (
	commandData: CommandData
): Promise<CommandResponse> => {
	const { text, message } = commandData;

	const id = message.from;

	if (validateAccessKey(`${text}`.trim())) {
		addToWhiteList(id);

		return {
			type: CommandResponseType.Text,
			message: `Registered 👌`,
		};
	} else {
		return {
			type: CommandResponseType.Text,
			message: `Invalid registration key 🚫`,
		};
	}
};

const contextCommand = async (
	commandData: CommandData
): Promise<CommandResponse> => {
	const { text, message } = commandData;

	if (addContext(message.id.remote, text)) {
		return {
			type: CommandResponseType.Text,
			message: "Context added/updated 👌",
		};
	}

	return {
		type: CommandResponseType.Text,
		message: "No context to add 🤔",
	};
};

const getContextCommand = async (
	commandData: CommandData
): Promise<CommandResponse> => {
	const { message } = commandData;

	const context = getContext(message.id.remote);

	if (context) {
		return {
			type: CommandResponseType.Text,
			message: `Current context is:\n\n${context}`,
		};
	}

	return {
		type: CommandResponseType.Text,
		message: "No context was found 🤔",
	};
};

const clearContextCommand = async (
	commandData: CommandData
): Promise<CommandResponse> => {
	const { message } = commandData;

	if (clearContext(message.id.remote)) {
		return {
			type: CommandResponseType.Text,
			message: "Context cleared 👌",
		};
	}

	return {
		type: CommandResponseType.Text,
		message: "No context was found 🤔",
	};
};

const videoUrlCommand = async (
	commandData: CommandData
): Promise<CommandResponse> => {
	const { text, message } = commandData;

	await message.react("🎥");

	const [fileUrl, ...restOfText] = text.trim().split(" ");

	const videoPrompt = restOfText.join(" ");

	if (!fileUrl?.trim()) {
		return {
			type: CommandResponseType.Text,
			message: "No file url given 🤔",
		};
	}

	if (!videoPrompt.trim()) {
		return {
			type: CommandResponseType.Text,
			message: "No video prompt given 🤔",
		};
	}

	try {
		const videoUrl = await getVideo(videoPrompt, fileUrl);

		const messageMedia = await getMessageMediaFromUrl(videoUrl);

		return {
			type: CommandResponseType.Media,
			media: messageMedia,
			message: `*_"${`${videoPrompt}`.trim()}"_*`,
		};
	} catch (error) {
		return {
			type: CommandResponseType.Text,
			message: `Something went wrong generating a video from an url 😩 (${
				(error as Error).message
			})`,
		};
	}
};

const videoCommand = async (
	commandData: CommandData
): Promise<CommandResponse> => {
	const { text, message } = commandData;

	await message.react("🎥");

	if (!text.trim()) {
		return {
			type: CommandResponseType.Text,
			message: "No video prompt given 🤔",
		};
	}

	try {
		const videoUrl = await getVideo(text);

		const messageMedia = await getMessageMediaFromUrl(videoUrl);

		return {
			type: CommandResponseType.Media,
			media: messageMedia,
			message: `*_"${`${text}`.trim()}"_*`,
		};
	} catch (error) {
		return {
			type: CommandResponseType.Text,
			message: `Something went wrong generating a video 😩 (${
				(error as Error).message
			})`,
		};
	}
};

const imageCommand = async (
	commandData: CommandData
): Promise<CommandResponse> => {
	const { text, message } = commandData;

	await message.react("🖼️");

	let initialMedia;

	if (message.hasMedia) {
		initialMedia = await message.downloadMedia();
	}

	const imageBase64 = await getAiImageBase64(text, initialMedia);

	if ("image" in imageBase64) {
		return {
			type: CommandResponseType.Media,
			media: getMessageMediaFromBase64(
				"image/jpeg",
				imageBase64.image.split(",")[1] as string
			),
			message: `*_"${`${text}`.trim()}"_*`,
		};
	}

	return {
		type: CommandResponseType.Text,
		message:
			imageBase64.error || "Something went wrong generating an image 😩",
	};
};

const enableAudioCommand = async (
	commandData: CommandData
): Promise<CommandResponse> => {
	const { message, text: language } = commandData;

	if (!language) {
		return {
			type: CommandResponseType.Text,
			message: `No language given 🤔. Supported languages are:\n*${Object.values(
				SupportedLanguage
			).join(", ")}*`,
		};
	}

	const isoCode = language.trim();

	if (
		!Object.values(SupportedLanguage).includes(
			`${isoCode}`.toLowerCase() as SupportedLanguage
		)
	) {
		return {
			type: CommandResponseType.Text,
			message: `Language *${`${isoCode}`.toUpperCase()}* is not supported 🚫. Supported languages are:\n*${Object.keys(
				SupportedLanguage
			).join(", ")}*`,
		};
	}

	enableAudioResponse(message.id.remote, isoCode);

	return {
		type: CommandResponseType.Text,
		message: `Audio responses enabled in language *${isoCode.toUpperCase()}* 👌`,
	};
};

const disableAudioCommand = async (
	commandData: CommandData
): Promise<CommandResponse> => {
	const { message } = commandData;

	if (await disableAudioResponse(message.id.remote)) {
		return {
			type: CommandResponseType.Text,
			message: "Audio responses disabled 👌",
		};
	}

	return {
		type: CommandResponseType.Text,
		message: "Audio responses already disabled 🤔",
	};
};

export const answerCommandResponse = async (message: Message) => {
	const commands = getCommands();

	const messageText = sanitizePrompt(message.body);

	const commandHandle = Object.values(commands).find((commandHandle) => {
		return messageText.startsWith(commandHandle.command);
	});

	if (!commandHandle) {
		return false;
	}

	const splitText = messageText.split(commandHandle.command).filter(Boolean);

	const [textWithoutCommand] = splitText as [string];

	const commandData: CommandData = {
		message,
		text: textWithoutCommand,
	};

	const commandResponse: CommandResponse = await commandHandle.handler(
		commandData
	);

	if (commandResponse.type === CommandResponseType.Text) {
		return await message.reply(`🤖 ${commandResponse.message}`);
	}

	if (commandResponse.type === CommandResponseType.Media) {
		return await message.reply(`🤖 ${commandResponse.message}`, undefined, {
			media: commandResponse.media,
		});
	}

	return false;
};

export const isCommandMessage = (message: Message) => {
	const commands = getCommands();

	const text = sanitizePrompt(message.body);

	const commandHandle = Object.values(commands).find((commandHandle) => {
		return text.startsWith(commandHandle.command);
	});

	return Boolean(commandHandle);
};
