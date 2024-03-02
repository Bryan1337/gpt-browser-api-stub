import { validateAccessKey } from "./accessKeyHelper.js";
import { sanitizePrompt } from "./messageHelper.js";
import { addToWhiteList } from "./whitelistHelper.js";
import { addContext, clearContext, clearGlobalContext, getContext, getGlobalContext, setGlobalSystemContext, setGlobalUserContext } from "./contextHelper.js";
import { startLoop, stopLoop } from "./loopHelper.js";
import { disableAudioResponse, enableAudioResponse, supportedLanguages } from "./ttsHelper.js";
import { getAiImageBase64 } from "./imageHelper.js";
import { getLocation, getMessageMediaFromBase64, getMessageMediaFromUrl } from "./whatsappHelper.cjs";
import WAWebJS from "whatsapp-web.js";
import { getVideo } from "./textToVideoHelper.js";
import { clearAllConversationDetails } from "./conversationHelper.js";


const getCommands = () => ({
	register: {
		command: '!register',
		description: `Registers a chat/conversation with the bot. Usage:\n \`\`\`!register <registration key>\`\`\``,
		handler: registerCommand,
	},
	context: {
		command: '!context',
		description: `Adds/updates the context for the current chat/conversation. Usage:\n \`\`\`!context <context>\`\`\``,
		handler: contextCommand,
	},
	getContext: {
		command: '!getContext',
		description: `Shows the context for the current chat/conversation. Usage:\n \`\`\`!getContext\`\`\``,
		handler: getContextCommand,
	},
	clearContext: {
		command: '!clearContext',
		description: `Clears the context for the current chat/conversation. Usage:\n \`\`\`!clearContext\`\`\``,
		handler: clearContextCommand,
	},
	help: {
		command: '!help',
		description: `Shows the list of commands. Usage:\n \`\`\`!help\`\`\``,
		handler: helpCommand,
	},
	enableAudio: {
		command: '!enableAudio',
		description: `Enables audio responses. Usage:\n \`\`\`!enableAudio <languagecode> (nl, en, fr etc...)\`\`\`\n Supported languages are: ${supportedLanguages.join(', ')}`,
		handler: enableAudioCommand,
	},
	disableAudio: {
		command: '!disableAudio',
		description: `Disables audio responses. Usage:\n \`\`\`!disableAudio\`\`\``,
		handler: disableAudioCommand,
	},
	videoUrl: {
		command: '!videoUrl',
		description: `Sends a video from an image url along with a prompt. Usage:\n \`\`\`!videoUrl <image url> <video prompt>\`\`\``,
		handler: videoUrlCommand,
	},
	video: {
		command: '!video',
		description: `Sends a video. Usage:\n \`\`\`!video <video prompt>\`\`\``,
		handler: videoCommand,
	},
	image: {
		command: '!image',
		description: `Sends an image. Usage:\n \`\`\`!image <image prompt>\`\`\``,
		handler: imageCommand,
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
const registerCommand = (commandData) => {

	const { text, message } = commandData;

	const id = message.from;

	const commands = getCommands();

	const splitMessage = text.split(commands.register.command).filter(Boolean);

	const [registrationKey] = splitMessage;

	if (validateAccessKey(`${registrationKey}`.trim(), id)) {

		addToWhiteList(id);

		return `Registered 👌`;

	} else {

		return `Invalid registration key 🚫`;
	}
}

const contextCommand = (commandData) => {

	const { text, remoteId } = commandData;

	const commands = getCommands();

	const splitMessage = text.split(commands.context.command).filter(Boolean);

	const [context] = splitMessage;

	if (addContext(remoteId, context)) {

		return 'Context added/updated 👌';
	}

	return 'No context to add 🤔';
}

const getContextCommand = (commandData) => {

	const { remoteId } = commandData;

	const context = getContext(remoteId);

	if (context) {

		return `Current context is:\n\n${context}`;
	}

	return 'No context was found 🤔';
}

const clearContextCommand = (commandData) => {

	const { remoteId } = commandData;

	if (clearContext(remoteId)) {

		return 'Context cleared 👌';
	}

	return 'No context was found 🤔';
}

const loopCommand = (id) => {

	if (startLoop(id)) {

		return 'Loop started 👌';
	}

	return 'Loop already started 🤔';
}

const stopLoopCommand = (id) => {

	if (stopLoop(id)) {

		return 'Loop stopped 👌';
	}

	return 'Loop already stopped 🤔';
}


const videoUrlCommand = async (commandData) => {

	const { text, message } = commandData;

	await message.react('🎥');

	const commands = getCommands();

	const splitMessage = text.split(commands.videoUrl.command).filter(Boolean);

	const [messageText] = splitMessage;

	const [fileUrl, ...restOfText] = messageText.trim().split(' ');

	const videoPrompt = restOfText.join(' ');

	if (!fileUrl.trim()) {

		return 'No file url given 🤔';
	}

	if (!videoPrompt.trim()) {

		return 'No video prompt given 🤔';
	}

	try {

		const videoUrl = await getVideo(videoPrompt, fileUrl);

		const messageMedia = await getMessageMediaFromUrl(videoUrl);

		return {
			type: 'video',
			media: messageMedia,
			caption: `*_"${`${videoPrompt}`.trim()}"_*`,
		}

	} catch (error) {

		return `Something went wrong generating a video from an url 😩 (${error.message})`;
	}
}
/**
 *
 * @param {string} text
 * @param {WAWebJS.Message} message
 * @returns
 */
const videoCommand = async (commandData) => {

	const { text, message } = commandData;

	await message.react('🎥');

	const commands = getCommands();

	const splitMessage = text.split(commands.video.command).filter(Boolean);

	const [videoPrompt] = splitMessage;

	if (!videoPrompt.trim()) {

		return 'No video prompt given 🤔';
	}

	try {

		const videoUrl = await getVideo(videoPrompt);

		const messageMedia = await getMessageMediaFromUrl(videoUrl);

		return {
			type: 'video',
			media: messageMedia,
			caption: `*_"${`${videoPrompt}`.trim()}"_*`,
		}

	} catch (error) {

		return `Something went wrong generating a video 😩 (${error.message})`;
	}
}


/**
 *
 * @param {string} text
 * @param {WAWebJS.Message} message
 * @returns
 */

const imageCommand = async (commandData) => {

	const { text, message } = commandData;

	await message.react('🖼️');

	const commands = getCommands();

	let initialMedia;

	if (message.hasMedia) {

		initialMedia = await message.downloadMedia();
	}

	const splitMessage = text.split(commands.image.command).filter(Boolean);

	const [imagePrompt] = splitMessage;

	const imageBase64 = await getAiImageBase64(imagePrompt, initialMedia);

	if (!imageBase64) {

		return 'Something went wrong generating an image 😩';
	}

	return {
		type: 'image',
		media: getMessageMediaFromBase64('image/jpeg', imageBase64.split(',')[1]),
		caption: `*_"${`${imagePrompt}`.trim()}"_*`,
	};
}

const enableAudioCommand = (commandData) => {

	const { remoteId, text } = commandData;

	const commands = getCommands();

	const splitMessage = text.split(commands.enableAudio.command).filter(Boolean);

	const [language] = splitMessage;

	if(!language) {

		return `No language given 🤔. Supported languages are:\n*${supportedLanguages.join(', ')}*`;
	}

	const isoCode = language.trim();

	if (!supportedLanguages.includes(`${isoCode}`.toLowerCase())) {

		return `Language *${`${isoCode}`.toUpperCase()}* is not supported 🚫. Supported languages are:\n*${supportedLanguages.join(', ')}*`;
	}

	enableAudioResponse(remoteId, isoCode);

	return `Audio responses enabled in language *${isoCode.toUpperCase()}* 👌`;
}

const disableAudioCommand = (commandData) => {

	const { remoteId } = commandData;

	if (disableAudioResponse(remoteId)) {

		return 'Audio responses disabled 👌';
	}

	return 'Audio responses already disabled 🤔';
}

/**
 * @param {WAWebJS.Message} message
 */
export const getCommandResponse = async (message) => {

	const commands = getCommands();

	const remoteId = message.id.remote._serialized || message.id.remote;

	const text = sanitizePrompt(message.body);

	const commandData = {
		remoteId,
		message,
		text,
	}

	for (const commandObject of Object.values(commands)) {

		if (text.startsWith(commandObject.command)) {

			return await commandObject.handler(commandData);
		}
	}

	return false;
}
