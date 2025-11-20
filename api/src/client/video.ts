export const getVideoResponse = async ({ body }: { body: { prompt: string } }) => {
	const { videoRequest, time } = window.gptBoyUtils;

	try {
		const { prompt } = body;

		const { formatSeconds } = time();

		const requestUtil = await videoRequest();

		const usageResponse = await requestUtil.videoUsageRequest();

		const numVideosRemaining =
			usageResponse.rate_limit_and_credit_balance.estimated_num_videos_remaining ?? 0;

		if (usageResponse.rate_limit_and_credit_balance.rate_limit_reached) {
			const resetInSeconds =
				usageResponse.rate_limit_and_credit_balance.access_resets_in_seconds ?? 0;

			const timeRemaining = formatSeconds(resetInSeconds);

			return {
				error: `No video generations left. Reset occurs in ${timeRemaining}.`,
			};
		}

		const videoResponse = await requestUtil.videoRequest(prompt);

		return {
			taskId: videoResponse.id,
			numVideosRemaining: numVideosRemaining - 1,
		};
	} catch (error) {
		console.error(error);
		return { error };
	}
};

export const getPendingVideoResponse = async ({ body }: { body: { taskId: string } }) => {
	const { taskId } = body;

	const { videoRequest } = window.gptBoyUtils;
	const request = await videoRequest();

	const pendingResponse = await request.videoPendingRequest();

	console.log({ pendingResponse });

	if (!Array.isArray(pendingResponse)) {
		return {
			error: pendingResponse,
		};
	}

	const pendingTask = (pendingResponse ?? []).find((task: any) => task.id === taskId);

	if (!pendingTask) {
		return {
			task: null,
		};
	}

	return {
		progress: pendingTask.progress_pct,
	};
};

export const getVideoCreditsResponse = async () => {
	try {
		const { videoRequest } = window.gptBoyUtils;

		const requestUtil = await videoRequest();
		const usageResponse = await requestUtil.videoUsageRequest();

		return usageResponse;
	} catch (error) {
		return { error };
	}
};

export const getVideoDraftResponse = async ({ body }: { body: { taskId: string } }) => {
	try {
		const { taskId } = body;

		const { videoRequest, time } = window.gptBoyUtils;
		const { pause } = time();
		const request = await videoRequest();

		const fetchDraft = async () => {
			return await request.videoDraftRequest();
		};

		let draft;
		let attempt = 1;
		const maxAttempts = 10;

		while (!draft && attempt < maxAttempts) {
			const drafts = await fetchDraft();

			await pause(2500);
			draft = drafts.items.find((item) => item.task_id === taskId);
			attempt++;
		}

		if (!draft) {
			return {
				error: `Unable to find draft after ${maxAttempts} attempts.`,
			};
		}

		return draft;
	} catch (error) {
		console.log(error);
		return { error };
	}
};
