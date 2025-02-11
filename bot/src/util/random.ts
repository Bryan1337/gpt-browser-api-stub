export const getRandomString = (length: number) => {
	const characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	let result = "";

	for (let i = 0; i < length; i++) {
		result += characters.charAt(
			Math.floor(Math.random() * characters.length)
		);
	}

	return result;
};

export const getRandomInt = (min = 1000000, max = 10000000) => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};
