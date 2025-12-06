export type RequestUtil = typeof requestUtil;

const requestUtil = async () => {
	async function request(url: string, params: RequestInit) {
		const response = await fetch(url, params);
		if (!response.ok) {
			throw new Error(`Request failed with ${response.status}: ${response.statusText}.`);
		}
		return response;
	}

	async function jsonRequest(url: string, params: Record<string, unknown>) {
		const response = await request(url, params);
		return await response.json();
	}

	async function get(url: string, params = {}) {
		return jsonRequest(url, { ...params, method: "GET" });
	}

	async function post(url: string, params = {}) {
		return jsonRequest(url, { ...params, method: "POST" });
	}

	async function retry<T>(
		callback: (...args: unknown[]) => Promise<T>,
		maxAttempts = 1,
		currentAttempt = 1,
	): Promise<T> {
		try {
			return await callback();
		} catch (err) {
			if (currentAttempt >= maxAttempts) {
				throw err;
			}
			return await retry(callback, maxAttempts, currentAttempt + 1);
		}
	}

	async function getAccessToken(sessionUrl: string) {
		const authResponse = await get(`${sessionUrl}?oai-dm=1`);

		return authResponse.accessToken;
	}

	return {
		getAccessToken,
		request,
		post,
		get,
		retry,
	};
};

export default requestUtil;
