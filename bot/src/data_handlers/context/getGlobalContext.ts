export const getGlobalContext = async () => {
	const response = await fetch(`${process.env.API_URL}/system-messages`, {
		method: "GET",
		headers: {
			"content-type": "application/json",
		},
	});

	const responseJson = await response.json();

	if (responseJson.error) {
		if (responseJson.code === 429) {
			throw new Error(`Sorry, Too many requests, try again in a bit 😅.`);
		}

		throw new Error(responseJson.error);
	}

	return responseJson;
};
