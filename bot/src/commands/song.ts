import {
	CommandData,
	CommandResponse,
	CommandResponseType,
} from "@/util/command";
import {
	getClient,
	getClientSessionTouch,
	getClientTokens,
	getCredits,
	getGenerateV2,
	pollClipIds,
} from "@/util/sunoAi";
import { sanitize } from "@/util/string";
import { getMessageMediaFromFilePath } from "@/util/whatsappWeb";
import { logError, logInfo, logWarning } from "@/util/log";
import { pause } from "@/util/time";

import { saveExternalFile, SUNO_AI_VIDEO_FILES_PATH } from "@/util/file";
import { waitForUrlAvailability } from "@/util/url";
import { getSessionTokens } from "@/data_handlers/suno_ai/getClientTokens";

export const songCommand = async (
	commandData: CommandData
): Promise<CommandResponse> => {
	const { message } = commandData;

	const formattedPrompt = sanitize(
		message.body,
		`@${process.env.USER_PHONE_ID}`
	);

	await message.react("🎵");

	try {
		let attempt = 1;
		let clipIds = [];

		const sessionTokens = getSessionTokens();

		if (!sessionTokens.length) {
			throw new Error("No Suno AI Tokens left");
		}

		let clientJWTWithCredits;
		let sessionId;
		let clientTokenWithCredits;

		for (const clientToken of sessionTokens) {
			const client = await getClient(clientToken);

			const sessions: { id: string }[] = client.response.sessions;

			const [firstSession] = sessions;

			if (!firstSession) {
			}

			const clientSession = await getClientTokens(
				firstSession.id,
				clientToken
			);

			const clientJWT = clientSession.jwt;

			const credits = await getCredits(clientJWT);

			logInfo(`Current session has ${credits} credits left...`);

			if (credits <= 5) {
				logWarning(`Session is out of credits, checking next...`);

				continue;
			}

			clientTokenWithCredits = clientToken;
			clientJWTWithCredits = clientJWT;
			sessionId = firstSession.id;

			const touchData = await getClientSessionTouch(
				sessionId,
				clientTokenWithCredits
			);

			sessionId = touchData.response.id;
			const jwt = touchData.response.last_active_token.jwt;

			const generateV2Json = await getGenerateV2(formattedPrompt, jwt);

			if (generateV2Json.detail) {
				throw new Error(generateV2Json.detail);
			}

			clipIds = generateV2Json.clips.map(
				(clip: { id: string }) => clip.id
			);

			break;
		}

		if (!clipIds.length) {
			throw new Error("No working Suno AI sessions left");
		}

		if (!clientJWTWithCredits) {
			throw new Error(`All Suno AI sessions are out of credits 💸`);
		}

		while (sessionId && clientTokenWithCredits) {
			logInfo(`Attempting to fetch data... (attempt ${attempt})`);

			attempt++;

			const touchData = await getClientSessionTouch(
				sessionId,
				clientTokenWithCredits
			);

			sessionId = touchData.response.id;
			const jwt = touchData.response.last_active_token.jwt;

			const clip = await pollClipIds(clipIds, jwt);

			if (!clip) {
				await pause(5000);

				continue;
			}

			await waitForUrlAvailability(clip.video_url);

			const localFileUrl = await saveExternalFile(
				clip.video_url,
				"mp4",
				SUNO_AI_VIDEO_FILES_PATH
			);

			logInfo(`Retrieved song URL (${clip.video_url})`);

			return {
				type: CommandResponseType.Media,
				media: await getMessageMediaFromFilePath(localFileUrl),
				message: `*_"${`${clip.title}`.trim()}"_*`,
			};
		}

		throw new Error("Reached end of while loop...");
	} catch (error) {
		logError(error);
		return {
			type: CommandResponseType.Text,
			message: `${error}`,
		};
	}
};
