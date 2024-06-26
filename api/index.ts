import { RequestsModuleCall } from './browser-scripts/requestsModule';
import { SentinelModuleCall } from './browser-scripts/sentinelModule';
import { StreamModuleCall } from './browser-scripts/streamModule';
import { importBrowserScripts } from './scripts/browserScriptImportHelper';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { executablePath } from 'puppeteer';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from "uuid";
import { getRandomValueBetween } from './scripts/valueHelper';
import { log, logError, logWarning } from './scripts/logHelper';
import { getServer } from './scripts/serverHelper';

declare global {
	interface Window {
		isQueueing: boolean;
		streamModule: StreamModuleCall;
		requestsModule: RequestsModuleCall;
		sentinelModule: SentinelModuleCall;
	}
}

dotenv.config();

puppeteer.use(StealthPlugin());

const browser = await puppeteer.launch({
	headless: false,
	executablePath: executablePath(),
	userDataDir: process.env.TMP_FOLDER,
	devtools: true,
	args: []
});

const [ newPage ] = await browser.pages();

let chatUrl = `${process.env.BASE_URL}/chat`;

if(process.env.CONVERSATION_ID) {
	chatUrl = `${process.env.BASE_URL}/`;
}

await newPage.goto(chatUrl, { waitUntil: 'networkidle2' });

await importBrowserScripts(newPage);

const server = getServer();

server.post('/conversations', async (req, res) => {

	try {

		log('Received /conversations request...');

		await importBrowserScripts(newPage);

		const newMessageId = uuidv4().split('').map((c: string, i: number) => i <= 2 ? 'a' : c).join('');
		const parentMessageId = uuidv4();
		const websocketRequestId = uuidv4();

		const evaluationResponse = await newPage.evaluate(async ({ body, baseUrl, newMessageId, parentMessageId, websocketRequestId }) => {

			const { prompt, gptConversationId: conversationId } = body;

			try {

				window.isQueueing = true;

				const streamModule = window.streamModule;
				const requestsModule = window.requestsModule;
				const sentinelModule = window.sentinelModule;

				const sentinelInstance = await sentinelModule();

				const query = await requestsModule({ baseUrl });

				const chatRequirementsRequestToken = await sentinelInstance.getRequirementsToken();

				const { token: requirementsResponseToken, proofofwork } = await query.chatRequirementsRequest({
					chatRequirementsRequestToken,
				});

				const conversationIdResponse = await query.chatConversationIdRequest({
					conversationId
				});

				parentMessageId = conversationIdResponse?.current_node || parentMessageId;

				const enforcementToken = await sentinelInstance.getEnforcementToken(proofofwork);

				const chatCompletionResponse = await query.chatCompletionRequest({
					requirementsResponseToken,
					enforcementToken,
					conversationId,
					newMessageId,
					prompt,
					parentMessageId,
					websocketRequestId,
				});

				const { response, modelSlug, chatConversationId } = await streamModule(chatCompletionResponse);

				return {
					promptResponse: response,
					modelSlug,
					chatConversationId,
				};

			} catch (error) {

				console.error(error);

				return {
					conversationId,
					error
				};

			} finally {

				window['isQueueing'] = false;
			}

		}, {
			body: req.body,
			baseUrl: process.env.BASE_URL as string,
			newMessageId,
			parentMessageId,
			websocketRequestId,
		});

		res.json(evaluationResponse);

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

	log('Reloading page to prevent token timeout...');

	const didReload = await newPage.evaluate(() => {
		if (window.isQueueing) {
			return false;
		}

		/**
		 * Reload the page every 5-10 minutes to prevent any tokens from expiring
		 */
		window.location.reload();
		return true;
	});

	if(!didReload) {

		logWarning('Reload prevented due to request in progress...');
	}

}, getRandomValueBetween(5 * 60e3, 10 * 60e3))