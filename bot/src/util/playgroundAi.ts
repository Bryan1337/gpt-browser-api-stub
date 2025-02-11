import { getRandomString } from "@/util/random";
import { logError, logInfo } from "@/util/log";
import { MessageMedia } from "whatsapp-web.js";
import { PLAYGROUND_AI_KEYS_FILE_PATH } from "@/util/file";
import fs from "fs";

enum PlayGroundAIModel {
	SDXL = "stable-diffusion-xl",
}

interface AIImageSuccessResponse {
	image: string;
}

interface AIImageErrorResponse {
	error: string;
}

type AIImageResponse = AIImageErrorResponse | AIImageSuccessResponse;

interface PlayGroundAIImageEditProps extends PlayGroundAIProps {
	init_image: string;
	mode: number;
	start_schedule: number;
	mask_strength: number;
}

interface PlayGroundAIProps {
	width: number;
	height: number;
	num_images: number;
	sampler: number;
	cfg_scale: number;
	guidance_scale: number;
	strength: number;
	steps: number;
	hide: boolean;
	isPrivate: boolean;
	modelType: PlayGroundAIModel;
	generateVariants: boolean;
	prompt: string;
	negativePrompt: string;
	initImageFromPlayground: boolean;
	batchId: string;
	seed: number;
}

enum PlayGroundAIErrorCodes {
	BadGateway = "BAD_GATEWAY",
	RateLimited = "RATE_LIMITED",
}

const maxImageFetchAttemptCount = 5;

const getPlayGroundAIBodyData = (
	prompt: string,
	initialMedia?: MessageMedia
): PlayGroundAIProps | PlayGroundAIImageEditProps => {
	const bodyData: PlayGroundAIProps = {
		width: 512,
		height: 512,
		num_images: 1,
		sampler: 3,
		cfg_scale: 10,
		guidance_scale: 10,
		strength: 1,
		steps: 30,
		hide: false,
		isPrivate: false,
		modelType: PlayGroundAIModel.SDXL,
		generateVariants: false,
		negativePrompt: "",
		batchId: getRandomString(10),
		seed: (Math.random() * 1e9) >> 0,
		prompt,
		initImageFromPlayground: false,
	};

	if (initialMedia) {
		const imageBodyData = bodyData as PlayGroundAIImageEditProps;
		imageBodyData.init_image = `data:${initialMedia.mimetype};base64,${initialMedia.data}`;
		imageBodyData.sampler = 1;
		imageBodyData.cfg_scale = 30;
		imageBodyData.guidance_scale = 30;
		imageBodyData.strength = 1;
		imageBodyData.steps = 50;
		imageBodyData.mode = 0;
		imageBodyData.start_schedule = 0.89;
		imageBodyData.mask_strength = 0.7;

		return imageBodyData as PlayGroundAIImageEditProps;
	}

	return bodyData as PlayGroundAIProps;
};

export const getPlaygroundAIToken = () => {
	const keys = fs.readFileSync(PLAYGROUND_AI_KEYS_FILE_PATH);
	const keyMap = JSON.parse(keys.toString());

	const [firstEntry] = keyMap;

	if (firstEntry) {
		return firstEntry.token;
	}

	return null;
};

export const getPlaygroundAiImageBase64 = async (
	prompt: string,
	initialMedia?: MessageMedia,
	attemptCount = 1
): Promise<AIImageResponse> => {
	try {
		logInfo(
			`Fetching base64 image data for prompt (Attempt ${attemptCount})`,
			prompt
		);

		const bodyData = getPlayGroundAIBodyData(prompt, initialMedia);

		const token = getPlaygroundAIToken();

		if (!token) {
			return { error: "No tokens found for PlaygroundAI" };
		}

		const response = await fetch("https://playgroundai.com/api/models", {
			headers: {
				"content-type": "application/json",
				cookie: `__Secure-next-auth.session-token=${token}`,
			},
			method: "POST",
			body: JSON.stringify(bodyData),
		});

		const jsonResponse = await response.json();

		if (jsonResponse.error) {
			if (
				[
					PlayGroundAIErrorCodes.RateLimited,
					PlayGroundAIErrorCodes.BadGateway,
				].includes(jsonResponse.errorCode)
			) {
				return { error: jsonResponse.error };
			}

			logError("Error from playgroundAI API", jsonResponse.error);

			if (attemptCount < maxImageFetchAttemptCount) {
				return getPlaygroundAiImageBase64(
					prompt,
					initialMedia,
					attemptCount + 1
				);
			}

			return { error: jsonResponse.error };
		}

		const [image] = jsonResponse.images;

		return {
			image: image.url,
		};
	} catch (error) {
		logError("Error fetching base64 image data", String(error));

		return {
			error: String(error),
		};
	}
};
