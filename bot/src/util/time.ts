export const pause = async (amountOfMs: number) => {
	return await new Promise((resolve) => setTimeout(resolve, amountOfMs));
};
