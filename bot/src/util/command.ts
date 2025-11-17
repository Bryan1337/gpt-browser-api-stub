import { sanitize } from "@/util/string";
import { Message } from "whatsapp-web.js";
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
import { chatCommand } from "@/commands/chat";
import { reply } from "@/util/message";

export interface CommandHandleData {
	message: Message;
	text: string;
}

export type CommandHandle = (data: CommandHandleData) => void;

type Command = {
	handle: CommandHandle;
	description: string;
	alias?: string;
	commandAlias?: string;
	alwaysAllowed?: boolean;
};

type CommandKey =
	| "chat"
	| "help"
	| "register"
	| "context"
	| "getContext"
	| "clearContext"
	| "enableAudio"
	| "disableAudio"
	| "image"
	| "video";

export const commands: Record<CommandKey, Command> = {
	chat: {
		alias: "@me",
		commandAlias: `@${process.env.USER_WHATSAPP_ID}`,
		handle: chatCommand,
		description: `@me for ChatGPT responses`
	},
	help: {
		handle: helpCommand,
		description: `Shows the list of commands. Usage:\n \`\`\`!help\`\`\``,
		alwaysAllowed: true
	},
	register: {
		handle: registerCommand,
		description: `Registers a chat/conversation with the bot. Usage:\n \`\`\`!register <registration key>\`\`\``,
		alwaysAllowed: true
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
	enableAudio: {
		handle: enableAudioCommand,
		description: `Enables audio responses. Usage:\n \`\`\`!enableAudio <languagecode> (nl, en, fr etc...)\`\`\`\n Supported languages are: ${getSupportedLanguagesString()}`
	},
	disableAudio: {
		handle: disableAudioCommand,
		description: `Disables audio responses. Usage:\n \`\`\`!disableAudio\`\`\``
	},
	image: {
		handle: imageCommand,
		description: `Sends an image. Usage:\n \`\`\`!image <image prompt>\`\`\``
	},
	video: {
		handle: videoCommand,
		description: `Sends a video. Usage:\n \`\`\`!video <video prompt>\`\`\``
	}
};

export function getCommandData(message: Message) {
	const commandKeys = Object.keys(commands) as CommandKey[];
	const text = sanitize(message.body);

	for (const commandKey of commandKeys) {
		const command = commands[commandKey];
		const commandText =
			command.commandAlias ||
			`${process.env.COMMAND_PREFIX}${commandKey}`;

		if (text.startsWith(commandText)) {
			const command = commands[commandKey];
			return {
				command,
				commandKey: `${process.env.COMMAND_PREFIX}${commandKey}`
			};
		}
	}

	return null;
}

export async function answerCommandResponse(message: Message) {
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
		reply(message, `Something went wrong (${error})`);
	}
}

export function getFormattedCommands() {
	return Object.entries(commands)
		.map(([commandKey, command]) => {
			const commandText =
				command.alias || `${process.env.COMMAND_PREFIX}${commandKey}`;

			return `*${commandText}*\n ${command.description}`;
		})
		.join("\n\n");
}
