import { sanitize } from "@/util/string";
import { Message, MessageMedia } from "whatsapp-web.js";
import { SupportedTTSLanguage } from "@/util/tts";
import { disableAudioCommand } from "@/commands/disableAudio";
import { imageCommand } from "@/commands/image";
import { videoCommand } from "@/commands/video";
import { videoUrlCommand } from "@/commands/videoUrl";
import { enableAudioCommand } from "@/commands/enableAudio";
import { helpCommand } from "@/commands/help";
import { clearContextCommand } from "@/commands/clearContext";
import { getContextCommand } from "@/commands/getContext";
import { setContextCommand } from "@/commands/setContext";
import { registerCommand } from "@/commands/register";
import { songCommand } from "@/commands/song";
import { songCreditsCommand } from "@/commands/songCredits";
import { logError } from "@/util/log";

export interface CommandTextResponse {
	type: CommandResponseType.Text;
	message: string;
	originMessage?: Message;
}

export interface CommandMediaResponse {
	type: CommandResponseType.Media;
	message: string;
	media: MessageMedia;
	originMessage?: Message;
}

export type CommandResponse = CommandTextResponse | CommandMediaResponse;

export enum CommandResponseType {
	Text = "text",
	Media = "media",
	Audio = "audio",
	None = "none",
}

export interface CommandData {
	message: Message;
	text: string;
}

export interface Command {
	/**
	 * Should start with a "!"
	 */
	command: `!${string}`;
	description: string;
}

export type CommandHandle = (
	commandData: CommandData
) => Promise<CommandResponse>;

export interface CommandHandler extends Command {
	handle: CommandHandle;
}

const createCommandHandle = (
	command: Command,
	handle: CommandHandle
): CommandHandler => {
	return { ...command, handle };
};

export const answerCommandResponse = async (message: Message) => {
	const messageText = sanitize(message.body);
	const commandHandle = Object.values(commandHandles).find(
		(commandHandle) => {
			return messageText.startsWith(commandHandle.command);
		}
	);

	if (!commandHandle) {
		return false;
	}

	const splitText = messageText.split(commandHandle.command).filter(Boolean);

	const [textWithoutCommand] = splitText as [string];

	const commandData: CommandData = {
		message,
		text: textWithoutCommand,
	};

	try {
		const commandResponse: CommandResponse = await commandHandle.handle(
			commandData
		);

		if (commandResponse.type === CommandResponseType.Text) {
			return await message.reply(`🤖 ${commandResponse.message}`);
		}

		if (commandResponse.type === CommandResponseType.Media) {
			return await message.reply(
				`🤖 ${commandResponse.message}`,
				undefined,
				{
					media: commandResponse.media,
				}
			);
		}

		throw new Error(`Invalid commandResponse type`);
	} catch (error) {
		logError(error as string);
	}

	return false;
};

export const commands = {
	register: {
		command: "!register",
		description: `Registers a chat/conversation with the bot. Usage:\n \`\`\`!register <registration key>\`\`\``,
	},
	setContext: {
		command: "!context",
		description: `Adds/updates the context for the current chat/conversation. Usage:\n \`\`\`!context <context>\`\`\``,
	},
	getContext: {
		command: "!getContext",
		description: `Shows the context for the current chat/conversation. Usage:\n \`\`\`!getContext\`\`\``,
	},
	clearContext: {
		command: "!clearContext",
		description: `Clears the context for the current chat/conversation. Usage:\n \`\`\`!clearContext\`\`\``,
	},
	help: {
		command: "!help",
		description: `Shows the list of commands. Usage:\n \`\`\`!help\`\`\``,
	},
	enableAudio: {
		command: "!enableAudio",
		description: `Enables audio responses. Usage:\n \`\`\`!enableAudio <languagecode> (nl, en, fr etc...)\`\`\`\n Supported languages are: ${Object.keys(
			SupportedTTSLanguage
		).join(", ")}`,
	},
	disableAudio: {
		command: "!disableAudio",
		description: `Disables audio responses. Usage:\n \`\`\`!disableAudio\`\`\``,
	},
	videoUrl: {
		command: "!videoUrl",
		description: `Sends a video from an image url along with a prompt. Usage:\n \`\`\`!videoUrl <image url> <video prompt>\`\`\``,
	},
	video: {
		command: "!video",
		description: `Sends a video. Usage:\n \`\`\`!video <video prompt>\`\`\``,
	},
	image: {
		command: "!image",
		description: `Sends an image. Usage:\n \`\`\`!image <image prompt>\`\`\``,
	},
	songCredits: {
		command: "!songCredits",
		description: `Checks how many credits are remaining for all Suno AI sessions. Usage:\n \`\`\`!songCredits\`\`\``,
	},
	song: {
		command: "!song",
		description: `Generates a song using Suno AI based on given prompt. Usage:\n \`\`\`!song <song prompt>\`\`\``,
	},
} as const;

const commandHandles = {
	register: createCommandHandle(commands.register, registerCommand),
	setContext: createCommandHandle(commands.setContext, setContextCommand),
	getContext: createCommandHandle(commands.getContext, getContextCommand),
	clearContext: createCommandHandle(
		commands.clearContext,
		clearContextCommand
	),
	help: createCommandHandle(commands.help, helpCommand),
	enableAudio: createCommandHandle(commands.enableAudio, enableAudioCommand),
	disableAudio: createCommandHandle(
		commands.disableAudio,
		disableAudioCommand
	),
	videoUrl: createCommandHandle(commands.videoUrl, videoUrlCommand),
	video: createCommandHandle(commands.video, videoCommand),
	image: createCommandHandle(commands.image, imageCommand),
	songCredits: createCommandHandle(commands.songCredits, songCreditsCommand),
	song: createCommandHandle(commands.song, songCommand),
};

export const isCommandMessage = (message: Message) => {
	const text = sanitize(message.body);
	const commandHandle = Object.values(commandHandles).find(
		(commandHandle) => {
			return text.startsWith(commandHandle.command);
		}
	);

	return Boolean(commandHandle);
};
