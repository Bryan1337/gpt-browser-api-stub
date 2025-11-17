import { importBrowserScripts } from "./scripts/browserScriptImportHelper";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { executablePath } from "puppeteer";
import dotenv from "dotenv";
import { log } from "./scripts/logHelper";
import { getServer } from "./scripts/serverHelper";
import { conversationsRequest } from "./request/post/conversations";
import { videoRequest } from "./request/post/video";
import { pendingVideoRequest } from "./request/get/pendingVideo";
import { draftVideoRequest } from "./request/get/draftVideo";

dotenv.config();

const server = getServer();

puppeteer.use(StealthPlugin());

const browser = await puppeteer.launch({
	headless: false,
	executablePath: executablePath(),
	userDataDir: process.env.TMP_FOLDER,
	devtools: true,
	args: [`--load-extension=${process.env.VPN_EXTENSION_PATH}`],
});

const [chatGptPage] = await browser.pages();
const soraPage = await browser.newPage();

const chatGptUrl = "https://chatgpt.com/chat";
const soraUrl = "https://sora.chatgpt.com/explore";

chatGptPage.goto(chatGptUrl);
soraPage.goto(soraUrl);

setTimeout(async () => {
	await importBrowserScripts(chatGptPage);
}, 5000);

server.use(async (request, response, next) => {
	await importBrowserScripts(chatGptPage);
	await importBrowserScripts(soraPage);
	request.pages = { chatGptPage, soraPage };
	next();
});

enum Route {
	CONVERSATIONS = "/conversations",
	VIDEO = "/video",
	PENDING = "/pending",
	DRAFT = "/draft",
}

server.post(Route.CONVERSATIONS, conversationsRequest);
server.post(Route.VIDEO, videoRequest);

server.get(Route.PENDING, pendingVideoRequest);
server.get(Route.DRAFT, draftVideoRequest);

server.listen(process.env.PORT, () => {
	log(`Passthrough API running on port ${process.env.PORT}`);
});
