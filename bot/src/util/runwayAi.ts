import { getRandomInt } from "@/util/random";
import { deleteToken } from "@/data_handlers/runway_ai/deleteToken";
import { getTeamId } from "@/data_handlers/runway_ai/getTeamId";
import { getToken } from "@/data_handlers/runway_ai/getToken";
import { logError, logInfo, logWarning } from "@/util/log";

export const baseUrl = "https://api.runwayml.com/v1";

const pollVideo = async (
	taskId: string,
	teamId: string,
	token: string,
	prompt: string,
	imageUrl: string = "",
	attempt = 1
): Promise<string> => {
	const url = `${baseUrl}/tasks/${taskId}?asTeamId=${teamId}`;

	const pollResponse = await fetch(url, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
	});

	const json = await pollResponse.json();

	if (Boolean(json.task)) {
		const { status } = json.task;

		if (status === "SUCCEEDED") {
			const [artifact] = json.task.artifacts;

			const { url } = artifact;

			logInfo(
				"Task succeeded, downloading video",
				taskId,
				prompt,
				url,
				imageUrl
			);

			return url;
		}

		if (status === "FAILED") {
			logError(JSON.stringify(json));

			throw new Error("Task failed while generating");
		}

		if (status === "RUNNING" || status === "PENDING") {
			logInfo(
				"Task is still running, waiting 5 seconds before polling again",
				`Attempt ${attempt}`,
				taskId,
				prompt,
				imageUrl
			);

			await new Promise((resolve) => setTimeout(resolve, 5000));

			return await pollVideo(
				taskId,
				teamId,
				token,
				prompt,
				imageUrl,
				attempt + 1
			);
		}

		throw new Error(`Task failed with status: ${status}`);
	}

	if (Boolean(json.error)) {
		logError(JSON.stringify(json));

		if (json.error === "You do not have enough credits to run this task.") {
			logInfo(
				"Token ran out of credits. Deleting token and trying again",
				token
			);

			deleteToken(token);

			return await getRunwayAiVideoUrl(prompt, imageUrl);
		}

		logError(JSON.stringify(json));

		throw new Error(json.error);
	}

	if (Boolean(json.message)) {
		if (json.message === "Too Many Requests") {
			logWarning(
				"Too many requests, waiting 15 seconds before polling again",
				`Attempt ${attempt}`,
				taskId,
				prompt,
				imageUrl
			);

			await new Promise((resolve) => setTimeout(resolve, 15000));

			return await pollVideo(
				taskId,
				teamId,
				token,
				prompt,
				imageUrl,
				attempt + 1
			);
		}
	}

	logError(JSON.stringify(json));

	throw new Error("Task failed during polling");
};

export const getRunwayAiVideoUrl = async (
	prompt = "",
	imageUrl?: string
): Promise<string> => {
	logInfo("Generating video from prompt:", prompt);

	const token = await getToken();

	const teamId = await getTeamId(token);

	const seed = getRandomInt();

	const params = {
		taskType: "gen2",
		internal: false,
		options: {
			seconds: 4,
			gen2Options: {
				interpolate: false,
				seed,
				upscale: false,
				text_prompt: prompt,
				watermark: true,
				mode: "gen2",
				image_prompt: "",
			},
			name: `Gen-2 ${prompt.substring(0, 30)}, ${seed}`,
			assetGroupName: "Gen-2",
		},
		asTeamId: teamId,
	};

	if (imageUrl) {
		params.options.gen2Options.image_prompt = imageUrl;
	}

	const response = await fetch(`${baseUrl}/tasks`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(params),
	});

	const json = await response.json();

	if (Boolean(json.task)) {
		const { id } = json.task;

		const url = await pollVideo(id, teamId, token, prompt, imageUrl);

		return url;
	}

	if (Boolean(json.error)) {
		logError(JSON.stringify(json));

		if (Boolean(json.error)) {
			logInfo(json.error, token);

			deleteToken(token);

			return await getRunwayAiVideoUrl(prompt, imageUrl);
		}

		throw new Error(json.error);
	}

	logError(JSON.stringify(json));

	throw new Error("Task failed during initial request");
};
