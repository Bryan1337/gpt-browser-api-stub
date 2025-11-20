import dotenv from "dotenv";

dotenv.config();

import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { executablePath, Page } from "puppeteer";
import { conversationsRequest } from "@/request/post/conversations";
import { videoRequest } from "@/request/post/video";
import { pendingVideoRequest } from "@/request/get/pendingVideo";
import { draftVideoRequest } from "@/request/get/draftVideo";
import { getServer } from "@/util/server";
import { log } from "@/util/log";
import { importBrowserScripts } from "@/browser-util";
import { TimeUtil } from "@/browser-util/time";
import { StreamUtil } from "@/browser-util/stream";
import { SentinelUtil } from "@/browser-util/sentinel";
import { TurnstileUtil } from "@/browser-util/turnstile";
import { RequestUtil } from "@/browser-util/request";
import { VideoRequestUtil } from "@/browser-util/videoRequest";
import { HashWasmUtil } from "@/browser-util/hashWasm";
import { ConversationRequestUtil } from "@/browser-util/conversationRequest";
import { videoCreditsRequest } from "@/request/get/videoCredits";

export interface GPTBoyUtils {
	time: TimeUtil;
	stream: StreamUtil;
	sentinel: SentinelUtil;
	hashWasm: HashWasmUtil;
	turnstile: TurnstileUtil;
	request: RequestUtil;
	videoRequest: VideoRequestUtil;
	conversationRequest: ConversationRequestUtil;
}

declare global {
	interface Performance {
		memory: {
			jsHeapSizeLimit: number;
			totalJSHeapSize: number;
			usedJSHeapSize: number;
		};
	}
	interface Window {
		gptBoyUtils: GPTBoyUtils;
		// Needed for esbuild / bundlers
		// (forces the function name to remain intact)
		// See: https://github.com/evanw/esbuild/issues/2605
		__name?: <T extends (...args: unknown[]) => unknown>(cb: T) => T;
	}

	namespace Express {
		interface Request {
			pages: {
				soraPage: Page;
				chatGptPage: Page;
			};
		}
	}
}

const server = getServer();
const hasVPN = !!process.env.VPN_EXTENSION_PATH;
const vpnArgs = hasVPN ? [`--load-extension=${process.env.VPN_EXTENSION_PATH}`] : [];

puppeteer.use(StealthPlugin());

const browser = await puppeteer.launch({
	headless: false,
	executablePath: executablePath(),
	userDataDir: process.env.TMP_FOLDER,
	devtools: true,
	args: vpnArgs,
});

const [chatGptPage] = await browser.pages();
const soraPage = await browser.newPage();

const chatGptUrl = "https://chatgpt.com/chat";
const soraUrl = "https://sora.chatgpt.com/explore";

chatGptPage.goto(chatGptUrl);
soraPage.goto(soraUrl);

server.use(async (request, _, next) => {
	await importBrowserScripts(chatGptPage);
	await importBrowserScripts(soraPage);
	request.pages = { chatGptPage, soraPage };
	next();
});

enum Route {
	CONVERSATIONS = "/conversations",
	VIDEO = "/video",
	VIDEO_CREDITS = "/video-credits",
	PENDING = "/pending",
	DRAFT = "/draft",
}

server.post(Route.CONVERSATIONS, conversationsRequest);
server.post(Route.VIDEO, videoRequest);
server.get(Route.VIDEO_CREDITS, videoCreditsRequest);

server.get(Route.PENDING, pendingVideoRequest);
server.get(Route.DRAFT, draftVideoRequest);

server.listen(process.env.PORT, () => {
	log(`Passthrough API running on port ${process.env.PORT}`);
});
