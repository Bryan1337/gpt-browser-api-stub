const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

const getWhatsappClient = () => {

	return new Client({
		authStrategy: new LocalAuth()
	});
}

const getMessageMediaFromFilePath = (path) => {

	return MessageMedia.fromFilePath(path);
}

module.exports = {
	getWhatsappClient,
	getMessageMediaFromFilePath,
}