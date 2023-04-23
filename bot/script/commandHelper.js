import { validateAccessKey } from "./accessKeyHelper.js";
import { sanitizePrompt } from "./messageHelper.js";
import { addToWhiteList } from "./whitelistHelper.js";
import { addContext, clearContext, getContext } from "./contextHelper.js";
import { startLoop, stopLoop } from "./loopHelper.js";
import { disableAudioResponse, enableAudioResponse } from "./ttsHelper.js";


const getCommands = () => ({
	register: {
		command: '!register',
		description: `Registers a chat/conversation with the bot. Usage:\n \`\`\`!register <registration key>\`\`\``,
	},
	context: {
		command: '!context',
		description: `Adds/updates the context for the current chat/conversation. Usage:\n \`\`\`!context <context>\`\`\``,
	},
	getContext: {
		command: '!getContext',
		description: `Shows the context for the current chat/conversation. Usage:\n \`\`\`!getContext\`\`\``,
	},
	clearContext: {
		command: '!clearContext',
		description: `Clears the context for the current chat/conversation. Usage:\n \`\`\`!clearContext\`\`\``,
	},
	help: {
		command: '!help',
		description: `Shows the list of commands. Usage:\n \`\`\`!help\`\`\``,
	},
	enableAudio: {
		command: '!enableAudio',
		description: `Enables audio responses. Usage:\n \`\`\`!enableAudio <languagecode> (nl, en, fr etc...)\`\`\``,
	},
	disableAudio: {
		command: '!disableAudio',
		description: `Disables audio responses. Usage:\n \`\`\`!disableAudio\`\`\``,
	},
	// loop: {
	// 	command: '!loop',
	// 	description: `Makes the bot talk to itself. Usage:\n \`\`\`!loop\`\`\``,
	// },
	// stopLoop: {
	// 	command: '!stopLoop',
	// 	description: `Stops the bot from talking to itself. Usage:\n \`\`\`!stopLoop\`\`\``,
	// }
})

const helpCommand = () => {

	const commands = getCommands();

	return `The current commands are: \n\n ${Object.values(commands).map(command => `*${command.command}*\n ${command.description}`).join('\n\n')}`;
}

/**
 * @param {WAWebJS.Message} message
 */
const registerCommand = (text, id) => {

	const commands = getCommands();

	const splitMessage = text.split(commands.register.command).filter(Boolean);

	const [ registrationKey ] = splitMessage;

	if (validateAccessKey(`${registrationKey}`.trim(), id)) {

		addToWhiteList(id);

		return `Registered 👌`;

	} else {

		return `Invalid registration key 🚫`;
	}
}

const contextCommand = (id, text) => {

	const commands = getCommands();

	const splitMessage = text.split(commands.context.command).filter(Boolean);

	const [context] = splitMessage;

	if(addContext(id, context)) {

		return 'Context added/updated 👌';
	}

	return 'No context to add 🤔';
}

const getContextCommand = (id) => {

	const context = getContext(id);

	if(context) {

		return `Current context is:\n\n${context}`;
	}

	return 'No context was found 🤔';
}

const clearContextCommand = (id) => {

	if(clearContext(id)) {

		return 'Context cleared 👌';
	}

	return 'No context was found 🤔';
}

const loopCommand = (id) => {

	if(startLoop(id)) {

		return 'Loop started 👌';
	}

	return 'Loop already started 🤔';
}

const stopLoopCommand = (id) => {

	if(stopLoop(id)) {

		return 'Loop stopped 👌';
	}

	return 'Loop already stopped 🤔';
}

const enableAudioCommand = (id, text) => {

	const commands = getCommands();

	const splitMessage = text.split(commands.enableAudio.command).filter(Boolean);

	const [language] = splitMessage;

	enableAudioResponse(id, `${language}`.trim());

	return `Audio responses enabled in language *${`${language}`.trim().toUpperCase()}}* 👌`;
}

const disableAudioCommand = (id) => {

	if(disableAudioResponse(id)) {

		return 'Audio responses disabled 👌';
	}

	return 'Audio responses already disabled 🤔';
}

/**
 * @param {WAWebJS.Message} message
 */
export const getCommandResponse = (message) => {

	const commands = getCommands();

	const remoteId = message.id.remote._serialized || message.id.remote;

	const text = sanitizePrompt(message.body);

	if (text.startsWith(commands.register.command)) {

		return registerCommand(text, message.from);
	}

	if (text.startsWith(commands.context.command)) {

		return contextCommand(remoteId, text);
	}

	if (text.startsWith(commands.clearContext.command)) {

		return clearContextCommand(remoteId);
	}

	if (text.startsWith(commands.getContext.command)) {

		return getContextCommand(remoteId);
	}

	if (text.startsWith(commands.help.command)) {

		return helpCommand();
	}

	if(text.startsWith(commands.enableAudio.command)) {

		return enableAudioCommand(remoteId, text);
	}

	if(text.startsWith(commands.disableAudio.command)) {

		return disableAudioCommand(remoteId);
	}

	// if(text.startsWith(commands.loop.command)) {

	// 	return loopCommand(remoteId);
	// }

	// if(text.startsWith(commands.stopLoop.command)) {

	// 	return stopLoopCommand(remoteId);
	// }

	return false;
}