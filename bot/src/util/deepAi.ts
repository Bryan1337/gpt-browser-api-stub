import { getAuth } from "@/data_handlers/deep_ai/getAuthContext";
import { generateTryItApiKey } from "@/util/deepAiKey";

const BASE_URL = "https://api.deepai.org";

enum DeepAiModel {
	HD = "hd",
	STANDARD = "standard",
}

interface DeepAiImageRequestData {
	text: string;
	image_generator_version: DeepAiModel;
	use_old_model: boolean;
	turbo?: boolean;
	quality: boolean;
	genius_preference: string;
}

interface DeepAIVideoRequestData {
	textPrompt: string;
	dimensions: string;
}

const MOCK_USER_AGENT =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36";

const baseImageRequestData: DeepAiImageRequestData = {
	text: "",
	image_generator_version: DeepAiModel.HD,
	use_old_model: false,
	quality: true,
	genius_preference: "classic",
};

const baseVideoRequestData: DeepAIVideoRequestData = {
	textPrompt: "",
	dimensions: JSON.stringify({ width: 1024, height: 1024 }),
};

function generateBoundary() {
	return "----WebKitFormBoundary" + Math.random().toString(36).substr(2, 16);
}

function buildMultipartBody(fields: Record<string, unknown>, boundary: string) {
	const CRLF = "\r\n";
	let body = "";

	for (const [key, value] of Object.entries(fields)) {
		body += `--${boundary}${CRLF}`;
		body += `Content-Disposition: form-data; name="${key}"${CRLF}${CRLF}`;
		body += `${value}${CRLF}`;
	}

	body += `--${boundary}--${CRLF}`;
	return body;
}

const getCookies = () => {
	const { messagesToken, csrfToken, sessionId } = getAuth();

	const cookieMap = {
		messages: messagesToken,
		csrftoken: csrfToken,
		sessionid: sessionId,
		user_sees_ads: false,
	};

	return Object.entries(cookieMap)
		.map(([key, value]) => `${key}=${value}`)
		.join("; ");
};

export const generateDeepAiImage = async (text: string) => {
	const boundary = generateBoundary();

	const response = await fetch(`${BASE_URL}/api/text2img`, {
		method: "POST",
		headers: {
			"Content-Type": `multipart/form-data; boundary=${boundary}`,
			"User-Agent": MOCK_USER_AGENT,
			"Api-Key": generateTryItApiKey(MOCK_USER_AGENT),
			"Cookie": getCookies(),
		},
		body: buildMultipartBody(
			{
				...baseImageRequestData,
				text,
			},
			boundary,
		),
	});

	const json = await response.json();

	if (json.err) {
		throw new Error(json.err);
	}

	return json.output_url;
};

export const generateDeepAiVideo = async (text: string) => {
	const boundary = generateBoundary();

	const response = await fetch(`${BASE_URL}/generate_video`, {
		method: "POST",
		headers: {
			"Content-Type": `multipart/form-data; boundary=${boundary}`,
			"User-Agent": MOCK_USER_AGENT,
			"Api-Key": generateTryItApiKey(MOCK_USER_AGENT),
			"Cookie": getCookies(),
		},
		body: buildMultipartBody(
			{
				...baseVideoRequestData,
				textPrompt: text,
			},
			boundary,
		),
	});

	const json = await response.json();

	if (json.status) {
		throw new Error(json.status);
	}

	return json.videoUrl;
};
