import { logInfo } from "@/util/log";

export const SUNO_AI_BASE_URL = "https://studio-api.prod.suno.com/api";
export const SUNO_AI_CLERK_BASE_URL = "https://clerk.suno.com/v1/client";
export const SUNO_AI_CDN_URL = "";
export const CLERK_JS_VERSION = "5.46.0";
export const CLERK_API_VERSION = "2024-10-01";
export const SUNO_AI_INITIALIZE_URL = "https://s.prod.suno.com/v1//initialize";

interface Clip {
	id: string;
	audio_url: string;
	video_url: string;
	title: string;
	metadata: {
		error_message: string;
	};
	status: "error" | "complete" | "queued" | "streaming";
}

export const initializeSession = async (token: string) => {
	const params = new URLSearchParams();
	params.set("k", "client-DaZjubWc7zwnZ5o2EEJhqt4UYRzYRoUuHbTQcIH9Ybq");
	params.set("st", "javascript-client-react");
	params.set("sv", "3.1.0");
	// Hmm
	params.set("sid", "ab3f6c04-8887-47d9-b017-2c0d34553eab");
	params.set("se", "1");

	const payload = token.split("").reverse().join("");

	return await fetch(`${SUNO_AI_INITIALIZE_URL}?${params}`, {
		method: "POST",
		body: payload,
	});
};

const extractFinishedClipFromFeedJson = (feedJson: { clips: Clip[] }, clipIds: string[]) => {
	const { clips } = feedJson;

	for (const clip of clips) {
		logInfo(`Checking clip status... (${clip.status})`);

		if (clip.status === "error") {
			throw new Error(clip.metadata.error_message);
		}

		if (clip.audio_url && clip.status === "complete" && clipIds.includes(clip.id)) {
			return clip;
		}
	}

	return null;
};

export const getClient = async (sessionToken: string) => {
	const params = new URLSearchParams();
	params.append("_clerk_js_version", CLERK_JS_VERSION);
	params.append("__clerk_api_version", CLERK_API_VERSION);

	const clientResponse = await fetch(`${SUNO_AI_CLERK_BASE_URL}?${params}`, {
		method: "GET",
		headers: {
			Cookie: `__client=${sessionToken}`,
		},
	});

	return await clientResponse.json();
};

export const getClientSessionTouch = async (sessionId: string, sessionToken: string) => {
	const clientSessionTouchUrl = `${SUNO_AI_CLERK_BASE_URL}/sessions/${sessionId}/touch`;

	const params = new URLSearchParams();
	params.append("_clerk_js_version", CLERK_JS_VERSION);
	params.append("__clerk_api_version", CLERK_API_VERSION);

	const clientSessionTouchResponse = await fetch(`${clientSessionTouchUrl}?${params}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"Cookie": `__client=${sessionToken}`,
		},
	});

	return await clientSessionTouchResponse.json();
};

export const getClientTokens = async (sessionId: string, sessionToken: string) => {
	const clientSessionUrl = `${SUNO_AI_CLERK_BASE_URL}/sessions/${sessionId}/tokens`;

	const params = new URLSearchParams();
	params.append("_clerk_js_version", CLERK_JS_VERSION);

	const clientSessionResponse = await fetch(`${clientSessionUrl}?${params}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"Cookie": `__client=${sessionToken}`,
		},
	});

	return await clientSessionResponse.json();
};

export const getFeedV2 = async (params: URLSearchParams, clientToken: string) => {
	const feedV2Response = await fetch(`${SUNO_AI_BASE_URL}/feed/v2?${params}`, {
		method: "GET",
		headers: {
			"Authorization": `Bearer ${clientToken}`,
			"Content-Type": "application/json",
		},
	});

	return await feedV2Response.json();
};

// {
//     "token": null,
//     "prompt": "asdf gg yooooo",
//     "generation_type": "TEXT",
//     "tags": "shamanic, freestyle",
//     "negative_tags": "",
//     "mv": "chirp-v3-5",
//     "title": "",
//     "continue_clip_id": null,
//     "continue_at": null,
//     "continued_aligned_prompt": null,
//     "infill_start_s": null,
//     "infill_end_s": null,
//     "task": null,
//     "artist_clip_id": null,
//     "artist_start_s": null,
//     "artist_end_s": null,
//     "metadata": {
//         "create_session_token": "a4006ffc-2222-449a-bfd4-5a0a502a090d"
//     }
// }

export const getGenerateV2 = async (prompt: string, clientToken: string) => {
	const generateV2Response = await fetch(`${SUNO_AI_BASE_URL}/generate/v2/`, {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${clientToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			gpt_description_prompt: prompt,
			mv: "chirp-v3-5",
			prompt: "",
			medadata: {
				lyrics_model: "default",
			},
			make_instrumental: false,
			user_uploaded_images_b64: [],
			generation_type: "TEXT",
			token: null,
		}),
	});

	if (generateV2Response.status === 403) {
		throw new Error(generateV2Response.statusText);
	}

	return await generateV2Response.json();
};

export const getBillingInfo = async (clientToken: string) => {
	const billingInfoResponse = await fetch(`${SUNO_AI_BASE_URL}/billing/info/`, {
		method: "GET",
		headers: {
			"Authorization": `Bearer ${clientToken}`,
			"Content-Type": "application/json",
		},
	});

	return await billingInfoResponse.json();
};

export const pollClipIds = async (clipIds: string[], clientToken: string) => {
	const params = new URLSearchParams();
	params.append("ids", clipIds.join(","));
	const feedJson = await getFeedV2(params, clientToken);
	return extractFinishedClipFromFeedJson(feedJson, clipIds);
};

export const getCredits = async (clientToken: string) => {
	const billingInfoJson = await getBillingInfo(clientToken);
	return billingInfoJson.total_credits_left;
};
