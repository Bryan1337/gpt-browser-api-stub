import whatsapp from 'whatsapp-web.js';
import dotenv from 'dotenv';

const { Client, LocalAuth, MessageMedia } = whatsapp;

dotenv.config();

export const getWhatsappClient = () => {

	return new Client({
		authStrategy: new LocalAuth(),
		webVersionCache: {
			type: 'remote',
			remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
		},
		puppeteer: {
			executablePath: `${process.env.CHROME_DIR}`,
		},
	});
}

export const getMessageMediaFromFilePath = (path: string) => {

	return MessageMedia.fromFilePath(path);
}

export const getMessageMediaFromBase64 = (mimeType: string, data: string) => {

	return new MessageMedia(mimeType, data);
}

export const getMessageMediaFromUrl = async (url: string) => {

	return await MessageMedia.fromUrl(url);
}

