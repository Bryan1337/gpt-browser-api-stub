export type RequestsModule = typeof requestsModule;

const requestsModule = async () => {
	function delay(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async function request(url: string, params: RequestInit) {
		return await fetch(url, params);
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

	async function getAccessToken(sessionUrl: string) {
		const authResponse = await get(`${sessionUrl}?oai-dm=1`);

		if (!authResponse.accessToken) {
			await delay(2500);
			return await getAccessToken(sessionUrl);
		}
		return authResponse.accessToken;
	}

	return {
		getAccessToken,
		request,
		post,
		get,
	};
};

export default requestsModule;
