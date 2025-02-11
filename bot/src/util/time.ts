export const pause = async (amountOfMs: number) => {
	return await new Promise((resolve) => setTimeout(resolve, amountOfMs));
};

export const getDurationText = (startTime: Date, endTime: Date) => {
	const diffMs = endTime.getTime() - startTime.getTime();

	const totalSeconds = Math.floor(diffMs / 1000);

	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	const minuteText =
		minutes > 0 ? `${minutes} minute${minutes !== 1 ? "s" : ""}` : "";
	const secondText =
		seconds > 0 ? `${seconds} second${seconds !== 1 ? "s" : ""}` : "";

	return [minuteText, secondText].filter(Boolean).join(" ");
};
