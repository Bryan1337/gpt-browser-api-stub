import { RequestsModuleCall } from "./browser-scripts/requestsModule";
import { SentinelModuleCall } from "./browser-scripts/sentinelModule";
import { StreamModuleCall } from "./browser-scripts/streamModule";
import { TurnstileModuleCall } from "./browser-scripts/turnstileModule";
import { importBrowserScripts } from "./scripts/browserScriptImportHelper";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { executablePath } from "puppeteer";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { getRandomValueBetween } from "./scripts/valueHelper";
import { log, logError, logInfo, logWarning } from "./scripts/logHelper";
import { getServer } from "./scripts/serverHelper";
import { getMessageId } from "./util/message";
import { getConversationsResponse } from "browser";
declare global {
	interface Window {
		isQueueing: boolean;
		streamModule: StreamModuleCall;
		requestsModule: RequestsModuleCall;
		sentinelModule: SentinelModuleCall;
		turnstileModule: TurnstileModuleCall;
	}
}

dotenv.config();

puppeteer.use(StealthPlugin());

const browser = await puppeteer.launch({
	headless: false,
	executablePath: executablePath(),
	userDataDir: process.env.TMP_FOLDER,
	devtools: true,
	args: [],
});

const [newPage] = await browser.pages();

newPage.setViewport({ width: 1920, height: 1080 });

let chatUrl = `${process.env.BASE_URL}/chat`;

if (process.env.CONVERSATION_ID) {
	chatUrl = `${process.env.BASE_URL}/`;
}

await newPage.goto(chatUrl, { waitUntil: "networkidle2" });

await importBrowserScripts(newPage);

const server = getServer();

server.post("/conversations", async (req, res) => {
	try {
		log("Received /conversations request...");

		await importBrowserScripts(newPage);

		const newMessageId = getMessageId();
		const parentMessageId = uuidv4();
		const websocketRequestId = uuidv4();

		const params = {
			body: req.body,
			baseUrl: process.env.BASE_URL as string,
			newMessageId,
			parentMessageId,
			websocketRequestId,
		};

		const conversationsResponse = await newPage.evaluate(
			getConversationsResponse,
			params
		);

		logInfo(
			"Returning evaluationResponse:",
			JSON.stringify(conversationsResponse, null, 2)
		);

		res.json(conversationsResponse);
	} catch (error) {
		logError((error as Error).message);

		res.json({
			error: (error as Error).message,
		});
	}
});

server.listen(process.env.PORT, () => {
	log(`Passthrough API running on port ${process.env.PORT}`);
});

setInterval(async () => {
	log("Reloading page to prevent token timeout...");

	const didReload = await newPage.evaluate(() => {
		if (window.isQueueing) {
			return false;
		}

		/**
		 * Reload the page every 10-15 minutes to prevent any tokens from expiring
		 */
		window.location.reload();
		return true;
	});

	if (!didReload) {
		logWarning("Reload prevented due to request in progress...");
	}
}, getRandomValueBetween(10 * 60e3, 15 * 60e3));
