import dotenv from 'dotenv';
import { getRandomString } from './randomHelper.js';
import { logError, logInfo } from './logHelper.js';

dotenv.config();

const defaultProps = {
	width: 768,
	height: 768,
	num_images: 1,
	sampler: 1,
	cfg_scale: 15,
	guidance_scale: 15,
	strength: 1.3,
	steps: 50,
	// filter: 'polymode_style',
	hide: false,
	isPrivate: false,
	modelType: 'stable-diffusion-2',
	generateVariants: false,
	negativePrompt: [
		"bad anatomy",
		"bad proportions",
		"blurry",
		"cloned face",
		"cropped",
		"deformed",
		"dehydrated",
		"disfigured",
		"duplicate",
		"error",
		"extra arms",
		"extra fingers",
		"extra legs",
		"extra limbs",
		"fused fingers",
		// "gross proportions",
		"jpeg artifacts",
		"long neck",
		"low quality",
		"lowres",
		"malformed limbs",
		"missing arms",
		"missing legs",
		"missing fingers",
		// "morbid",
		// "mutated hands",
		// "mutation",
		// "mutilated",
		"out of frame",
		"poorly drawn face",
		"poorly drawn hands",
		"signature",
		// "text",
		"too many fingers",
		"ugly",
		"username",
		"watermark",
		"worst quality",
	].join(", "),
}

const maxImageFetchAttemptCount = 5;

export const getAiImageBase64 = async (prompt, initialMedia, attemptCount = 1) => {

	try {

		logInfo(`Fetching base64 image data for prompt (Attempt ${attemptCount})`, prompt);

		const bodyData = {
			prompt,
			batchId: getRandomString(10),
			seed: (Math.random() * 1e9) >> 0,
			...defaultProps,
		}

		if (initialMedia) {

			bodyData.init_image = `data:${initialMedia.mimetype};base64,${initialMedia.data}`;
			bodyData.height = 512;
			bodyData.width = 512;
			bodyData.modelType = 'stable-diffusion';
			bodyData.sampler = 3;
			bodyData.mode = 2;
			bodyData.start_schedule = 0.7;
			bodyData.mask_strength = 0.7;
			bodyData.hide = true;
			bodyData.negativePrompt = undefined;
		}

		const response = await fetch('https://playgroundai.com/api/models', {
			headers: {
				'content-type': "application/json",
				'cookie': `__Secure-next-auth.session-token=${process.env.PLAYGROUND_AI_SESSION_TOKEN}`,
			},
			method: 'POST',
			body: JSON.stringify(bodyData),
		})

		const jsonResponse = await response.json();

		if (jsonResponse.error) {

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
