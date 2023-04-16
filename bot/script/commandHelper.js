import { validateAccessKey } from "./accessKeyHelper.js";
import { sanitizePrompt } from "./messageHelper.js";
import { addToWhiteList } from "./whitelistHelper.js";
import { addContext, clearContext, getContext } from "./contextHelper.js";


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
	}
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

/**
 * @param {WAWebJS.Message} message
 */
export const getCommandResponse = (message) => {

	const commands = getCommands();

	const text = sanitizePrompt(message.body);

	if (text.startsWith(commands.register.command)) {

		return registerCommand(text, message.from);
	}

	if (text.startsWith(commands.context.command)) {

		return contextCommand(message.from, text);
	}

	if (text.startsWith(commands.clearContext.command)) {

		return clearContextCommand(message.from);
	}

	if (text.startsWith(commands.getContext.command)) {

		return getContextCommand(message.from);
	}

	if (text.startsWith(commands.help.command)) {

		return helpCommand();
	}

	return false;
}