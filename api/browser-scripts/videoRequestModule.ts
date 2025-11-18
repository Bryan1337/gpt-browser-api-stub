export type VideoRequestModule = () => ReturnType<typeof videoRequestModule>;

const videoRequestModule = async () => {
	const { get, post, getAccessToken } = await window.requestsModule();

	const BASE_URL = "https://sora.chatgpt.com";

	enum Url {
		SESSION = `${BASE_URL}/api/auth/session`,
		VIDEO_DRAFTS = `${BASE_URL}/backend/project_y/profile/drafts`,
		USAGE = `${BASE_URL}/backend/nf/check`,
		CREATE = `${BASE_URL}/backend/nf/create`,
		PENDING = `${BASE_URL}/backend/nf/pending`,
	}

	const accessToken = await getAccessToken(Url.SESSION);

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

	async function videoUsageRequest(): Promise<VideoUsageResponse> {
		return get(Url.USAGE, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
		});
	}

	async function videoDraftRequest(): Promise<VideoDraftsResponse> {
		return get(Url.VIDEO_DRAFTS, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
		});
	}

	async function videoPendingRequest(): Promise<VideoPendingResponse> {
		return get(Url.PENDING, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
		});
	}

	async function videoRequest(prompt: string): Promise<VideoResponse> {
		const body = getVideoBodyParams(prompt);
		return post(Url.CREATE, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
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

export default videoRequestModule;
