import dotenv from 'dotenv';
/** Handle dotenv configs before importing any other modules */
dotenv.config();

import qrcode from 'qrcode-terminal';
import { getWhatsappClient } from './script/whatsappHelper.cjs';
import { checkWhitelistStatus } from './script/whitelistHelper.js';
import { getCommandResponse } from './script/commandHelper.js';
import { addMessageToQueue } from './script/queueHelper.js';
import { logInfo, logWarning } from './script/logHelper.js';

const client = getWhatsappClient();

client.on('qr', (qr) => {

	qrcode.generate(qr, { small: true });
});

client.on('ready', () => {

	logInfo('Client is ready!');
});

client.on('authenticated', () => {

	logInfo('Authenticated!');
});

client.on('message', async message => {

	const commandResponse = getCommandResponse(message);

	if (Boolean(commandResponse)) {

		await message.reply(`🤖 ${commandResponse}`);

		await message.react('✅');

		return;
	}

	if (message.body.includes(`@${process.env.USER_PHONE_ID}`)) {

		await message.react('💤');

		if (!checkWhitelistStatus(message.from)) {

			logWarning('Received message from unregistered user:', message.from, message.body)

			await message.reply(`🤖 Sorry, you are not allowed to use to use the Boy. @31611596195 for an access key 😌👌.`);

			await message.react('🚫');

			return;
		}

		await addMessageToQueue(message);
	}
});

client.initialize();