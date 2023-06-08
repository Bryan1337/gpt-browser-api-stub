const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const dotenv = require('dotenv');

dotenv.config();


const getWhatsappClient = () => {

	return new Client({
		authStrategy: new LocalAuth(),
		puppeteer: {
			executablePath: `${process.env.CHROME_DIR}`,
		}
	});
}

const getMessageMediaFromFilePath = (path) => {

	return MessageMedia.fromFilePath(path);
}

const getMessageMediaFromBase64 = (mimeType, data) => {

	return new MessageMedia(mimeType, data);
}

const getMessageMediaFromUrl = async (url) => {

	return await MessageMedia.fromUrl(url);
}

module.exports = {
	getWhatsappClient,
	getMessageMediaFromFilePath,
	getMessageMediaFromBase64,
	getMessageMediaFromUrl,
}

