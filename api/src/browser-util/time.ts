export type TimeUtil = typeof timeUtil;

const timeUtil = () => {
	function formatSeconds(seconds: number) {
		const days = Math.floor(seconds / 86400);
		seconds %= 86400;

		const hours = Math.floor(seconds / 3600);
		seconds %= 3600;

		const minutes = Math.floor(seconds / 60);
		seconds = Math.floor(seconds % 60);

		const parts = [];

		if (days > 0) {
			parts.push(`${days} day${days !== 1 ? "s" : ""}`);
		}
		if (hours > 0) {
			parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
		}
		if (minutes > 0) {
			parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
		}
		if (seconds > 0 || parts.length === 0) {
			parts.push(`${seconds} second${seconds !== 1 ? "s" : ""}`);
		}

		return parts.join(", ");
	}

	async function pause(amountOfMs: number) {
		return await new Promise((resolve) => setTimeout(resolve, amountOfMs));
	}

	return {
		pause,
		formatSeconds,
	};
};

export default timeUtil;
