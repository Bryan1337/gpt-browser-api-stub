import whatsapp, { MediaFromURLOptions } from "whatsapp-web.js";

const { Client, LocalAuth, MessageMedia } = whatsapp;

export const getWhatsappClient = () => {
	return new Client({
		authStrategy: new LocalAuth(),
		puppeteer: {
			executablePath: `${process.env.CHROME_DIR}`,
			ignoreHTTPSErrors: true,
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--disable-extensions",
				"--disable-gpu",
				"--disable-accelerated-2d-canvas",
				"--no-first-run",
				"--no-zygote",
				"--disable-dev-shm-usage"
			]
		}
	});
};

export const getMessageMediaFromFilePath = (path: string) => {
	return MessageMedia.fromFilePath(path);
};

export const getMessageMediaFromBase64 = (mimeType: string, data: string) => {
	return new MessageMedia(mimeType, data);
};

export const getMessageMediaFromUrl = async (
	url: string,
	options?: MediaFromURLOptions
) => {
	return await MessageMedia.fromUrl(url, options);
};
