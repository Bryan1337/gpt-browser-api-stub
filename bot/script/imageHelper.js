import dotenv from 'dotenv';
import { getRandomString } from './randomHelper.js';
import { logError, logInfo } from './logHelper.js';
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const defaultProps = {
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
	modelType: 'stable-diffusion-xl',
	generateVariants: false,
	negativePrompt: "",
	initImageFromPlayground: false,
}

const playgroundAiV2Props = {
    width: 1024,
    height: 1024,
    num_images: 1,
    modelType: "Playground_v2.5",
    sampler: 9,
    cfg_scale: 3,
    guidance_scale: 3,
    strength: 1.45,
    steps: 30,
    high_noise_frac: 1,
    negativePrompt: "",
    isPrivate: false,
    generateVariants: false,
    initImageFromPlayground: false,
}

const maxImageFetchAttemptCount = 5;

export const getAiImageBase64 = async (prompt, initialMedia, attemptCount = 1) => {

	try {

		logInfo(`Fetching base64 image data for prompt (Attempt ${attemptCount})`, prompt);

		const bodyData = {
			prompt,
			batchId: getRandomString(10),
			seed: (Math.random() * 1e9) >> 0,
			// statusUUID: uuidv4(),
			...defaultProps,
		}

		if (initialMedia) {

			bodyData.init_image = `data:${initialMedia.mimetype};base64,${initialMedia.data}`;
			bodyData.sampler = 1;
			bodyData.cfg_scale = 30;
			bodyData.guidance_scale = 30;
			bodyData.strength = 1;
			bodyData.steps = 50;
			bodyData.mode = 0;
			bodyData.start_schedule = 0.89;
			bodyData.mask_strength = 0.7;
		}

		console.log({
			bodyData
		})

		const response = await fetch('https://playgroundai.com/api/models', {
			headers: {
				'content-type': "application/json",
				'cookie': `__Secure-next-auth.session-token=${process.env.PLAYGROUND_AI_SESSION_TOKEN}`,
			},
			method: 'POST',
			body: JSON.stringify(bodyData),
		})

		const jsonResponse = await response.json();

		console.log({
			jsonResponse
		})

		if (jsonResponse.error) {

			if([
				'RATE_LIMITED',
				'GATEWAY_TIMEOUT',
			].includes(jsonResponse.errorCode)) {

				return null;
			}

			logError('Error from playgroundAI API', jsonResponse.error);

			if (attemptCount < maxImageFetchAttemptCount) {

				return getAiImageBase64(prompt, initialMedia, attemptCount + 1);
			}

			return null;
		}

		const [image] = jsonResponse.images;

		return image.url;

	} catch (error) {

		logError('Error fetching base64 image data', error);

		return null;
	}
}
