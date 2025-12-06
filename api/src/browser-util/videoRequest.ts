export type VideoRequestUtil = typeof videoRequestUtil;

const videoRequestUtil = async () => {
	const { get, post, retry, getAccessToken } = await window.gptBoyUtils.request();

	const BASE_URL = "https://sora.chatgpt.com";

	enum Url {
		SESSION = `${BASE_URL}/api/auth/session`,
		VIDEO_DRAFTS = `${BASE_URL}/backend/project_y/profile/drafts`,
		USAGE = `${BASE_URL}/backend/nf/check`,
		CREATE = `${BASE_URL}/backend/nf/create`,
		PENDING = `${BASE_URL}/backend/nf/pending`,
	}

	const maxAccessTokenAttempts = 5;
	const accessToken = await retry(
		async () => await getAccessToken(Url.SESSION),
		maxAccessTokenAttempts,
	);

	function getVideoBodyParams(prompt: string) {
		return {
			kind: "video",
			prompt,
			title: null,
			orientation: "portrait",
			size: "small",
			n_frames: 300,
			inpaint_items: [],
			remix_target_id: null,
			metadata: null,
			cameo_ids: null,
			cameo_replacements: null,
			model: "sy_8",
			style_id: null,
			audio_caption: null,
			audio_transcript: null,
			video_caption: null,
			storyboard_id: null,
		};
	}

	async function videoUsageRequest(): Promise<SoraResponse.Usage> {
		return get(Url.USAGE, {
			headers: {
				"Authorization": `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
		});
	}

	async function videoDraftRequest(): Promise<SoraResponse.Drafts> {
		return get(Url.VIDEO_DRAFTS, {
			headers: {
				"Authorization": `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
		});
	}

	async function videoPendingRequest(): Promise<SoraResponse.Pending> {
		return get(Url.PENDING, {
			headers: {
				"Authorization": `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
		});
	}

	async function videoRequest(prompt: string): Promise<SoraResponse.Video> {
		const body = getVideoBodyParams(prompt);
		return post(Url.CREATE, {
			headers: {
				"Authorization": `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});
	}

	return {
		videoUsageRequest,
		videoDraftRequest,
		videoPendingRequest,
		videoRequest,
	};
};

export default videoRequestUtil;
