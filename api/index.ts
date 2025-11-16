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

const [chatGPTPage] = await browser.pages();
const soraPage = await browser.newPage();

const chatGPTUrl = "https://chatgpt.com/chat";
const soraUrl = "https://sora.chatgpt.com/explore";

await chatGPTPage.goto(chatGPTUrl, { waitUntil: "networkidle2" });
importBrowserScripts(chatGPTPage);
soraPage.goto(soraUrl);

server.use((req, res, next) => {
	importBrowserScripts(chatGPTPage);
	importBrowserScripts(soraPage);
	// inject pages in req/res?
	next();
});

server.post("/conversations", async (req, res) =>
	conversationsRequest(req, res, chatGPTPage)
);
server.post("/video", async (req, res) => videoRequest(req, res, soraPage));
server.get("/pending", async (req, res) =>
	pendingVideoRequest(req, res, soraPage)
);
server.get("/draft", async (req, res) => draftVideoRequest(req, res, soraPage));

server.listen(process.env.PORT, () => {
	log(`Passthrough API running on port ${process.env.PORT}`);
});
