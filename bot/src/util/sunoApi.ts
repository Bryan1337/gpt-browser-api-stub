import { getSessionTokens } from "@/data_handlers/suno_ai/getClientTokens";
import {
	getBillingInfo,
	getClient,
	getClientSessionTouch,
	getClientTokens,
	getGenerateV2,
	initializeSession,
} from "./sunoAi";

const sessionTokens = getSessionTokens();

for (const clientToken of sessionTokens) {
	const client = await getClient(clientToken);

	console.log("-----------------CLIENT-----------------");
	console.log(JSON.stringify(client, null, 2));
	console.log("-----------------END CLIENT-----------------");

	const sessions = client.response.sessions;

	const [session] = sessions;

	const clientSession = await getClientTokens(session.id, clientToken);

	console.log("-----------------CLIENT SESSION-----------------");
	console.log(JSON.stringify(clientSession, null, 2));
	console.log("-----------------END CLIENT SESSION-----------------");

	const sessionId = session.id;

	const touchData = await getClientSessionTouch(sessionId, clientToken);

	console.log("-----------------TOUCH DATA-----------------");
	console.log(JSON.stringify(touchData, null, 2));
	console.log("-----------------END TOUCH DATA-----------------");

	const jwt = touchData.response.last_active_token.jwt;

	console.log({ jwt });

	const generateV2Json = await getGenerateV2("Song about a cat", jwt);

	console.log("-----------------GENERATE V2-----------------");
	console.log(JSON.stringify(generateV2Json, null, 2));
	console.log("-----------------END GENERATE V2-----------------");

	// const initS = await initializeSession(jwt);

	// console.log(initS);

	// try {
	// 	const generateV2Json = await getGenerateV2(
	// 		formattedPrompt,
	// 		jwt
	// 	);

	// 	if (generateV2Json.detail) {
	// 		throw new Error(generateV2Json.detail);
	// 	}

	// 	clipIds = generateV2Json.clips.map(
	// 		(clip: { id: string }) => clip.id
	// 	);

	// 	break;
	// } catch (error) {
	// 	logWarning(error);
	// }
}
