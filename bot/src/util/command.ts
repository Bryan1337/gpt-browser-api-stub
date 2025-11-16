import { sanitize } from "@/util/string";
import { Message, MessageMedia } from "whatsapp-web.js";
import { getSupportedLanguagesString } from "@/util/tts";
import { disableAudioCommand } from "@/commands/disableAudio";
import { imageCommand } from "@/commands/image";
import { videoCommand } from "@/commands/video";
import { enableAudioCommand } from "@/commands/enableAudio";
import { helpCommand } from "@/commands/help";
import { clearContextCommand } from "@/commands/clearContext";
import { getContextCommand } from "@/commands/getContext";
import { setContextCommand } from "@/commands/setContext";
import { registerCommand } from "@/commands/register";
import { logError } from "@/util/log";

export const COMMAND_PREFIX = "!";
export const BOT_PREFIX = "🤖";
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

export type CommandResponse = Promise<
	CommandTextResponse | CommandMediaResponse
>;

export enum CommandResponseType {
	Text = "text",
	Media = "media",
	Audio = "audio",
	None = "none"
}

export interface CommandData {
	command: Command;
	commandKey: `${typeof COMMAND_PREFIX}${string}`;
}

export interface CommandHandleData {
	message: Message;
	text: string;
}

export type CommandHandle = (data: CommandHandleData) => void;

export interface CommandHandler extends Command {
	handle: CommandHandle;
}

type Command = { handle: CommandHandle; description: string };

export const commands: Record<string, Command> = {
	register: {
		handle: registerCommand,
		description: `Registers a chat/conversation with the bot. Usage:\n \`\`\`!register <registration key>\`\`\``
	},
	context: {
		handle: setContextCommand,
		description: `Adds/updates the context for the current chat/conversation. Usage:\n \`\`\`!context <context>\`\`\``
	},
	getContext: {
		handle: getContextCommand,
		description: `Shows the context for the current chat/conversation. Usage:\n \`\`\`!getContext\`\`\``
	},
	clearContext: {
		handle: clearContextCommand,
		description: `Clears the context for the current chat/conversation. Usage:\n \`\`\`!clearContext\`\`\``
	},
	help: {
		handle: helpCommand,
		description: `Shows the list of commands. Usage:\n \`\`\`!help\`\`\``
	},
	enableAudio: {
		handle: enableAudioCommand,
		description: `Enables audio responses. Usage:\n \`\`\`!enableAudio <languagecode> (nl, en, fr etc...)\`\`\`\n Supported languages are: ${getSupportedLanguagesString()}`
	},
	disableAudio: {
		handle: disableAudioCommand,
		description: `Disables audio responses. Usage:\n \`\`\`!disableAudio\`\`\``
	},
	video: {
		handle: videoCommand,
		description: `Sends a video. Usage:\n \`\`\`!video <video prompt>\`\`\``
	},
	image: {
		handle: imageCommand,
		description: `Sends an image. Usage:\n \`\`\`!image <image prompt>\`\`\``
	}
};

function getCommandData(message: Message) {
	const commandKeys = Object.keys(commands);

	const text = sanitize(message.body);

	for (const commandKey of commandKeys) {
		if (text.startsWith(`${COMMAND_PREFIX}${commandKey}`)) {
			const command = commands[commandKey];
			return { command, commandKey: `${COMMAND_PREFIX}${commandKey}` };
		}
	}

	return null;
}

export const answerCommandResponse = async (message: Message) => {
	const commandData = getCommandData(message);
	if (!commandData) {
		return;
	}

	const { commandKey, command } = commandData;

	const text = sanitize(message.body, commandKey);

	try {
		command.handle({ text, message });
	} catch (error) {
		logError(error as string);

		message.reply(`🤖 Something went wrong (${(error as Error).message})`);
	}
};

export const isCommandMessage = (message: Message) => {
	return !!getCommandData(message);
};

export function getFormattedCommands() {
	return Object.entries(commands)
		.map(
			([commandKey, command]) =>
				`*${COMMAND_PREFIX}${commandKey}*\n ${command.description}`
		)
		.join("\n\n");
}
