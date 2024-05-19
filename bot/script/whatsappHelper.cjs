const { Client, LocalAuth, Location, MessageMedia } = require('whatsapp-web.js');
const dotenv = require('dotenv');

dotenv.config();

const getLocation = (latitude, longitude, description) => {

	return new Location(latitude, longitude, description);
}

const getWhatsappClient = () => {

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
	getLocation,
	getWhatsappClient,
	getMessageMediaFromFilePath,
	getMessageMediaFromBase64,
	getMessageMediaFromUrl,
}

