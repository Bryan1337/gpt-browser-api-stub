import {
	CommandData,
	CommandResponse,
	CommandResponseType,
} from "@/util/command";
import { getClient, getClientTokens, getCredits } from "@/util/sunoAi";
import { logError } from "@/util/log";

import { getSessionTokens } from "@/data_handlers/suno_ai/getClientTokens";

export const songCreditsCommand = async (
	commandData: CommandData
): Promise<CommandResponse> => {
	const { message } = commandData;

	await message.react("🎵");

	try {
		let totalCredits = 0;
		let totalAccounts = 0;

		const sessionTokens = getSessionTokens();

		if (!sessionTokens.length) {
			throw new Error("No Suno AI Tokens left");
		}

		for (const clientToken of sessionTokens) {
			const client = await getClient(clientToken);

			const sessions: { id: string }[] = client.response.sessions;

			const [firstSession] = sessions;

			const clientSession = await getClientTokens(
				firstSession.id,
				clientToken
			);

			const clientJWT = clientSession.jwt;

			const credits = await getCredits(clientJWT);

			if (credits > 0) {
				totalCredits += credits;
				totalAccounts += 1;
			}
		}

		return {
			type: CommandResponseType.Text,
			message: `${totalCredits} Suno AI credits remaining over ${totalAccounts} account(s).`,
		};
	} catch (error) {
		logError(error);
		return {
			type: CommandResponseType.Text,
			message: `${error}`,
		};
	}
};
