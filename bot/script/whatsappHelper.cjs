const { Client, LocalAuth } = require('whatsapp-web.js');

const getWhatsappClient = () => {

	return new Client({
		authStrategy: new LocalAuth()
	});
}

module.exports = {
	getWhatsappClient,
}