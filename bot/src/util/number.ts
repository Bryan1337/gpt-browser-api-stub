export function normalizeProgress(progress: number | null) {
	if (progress === null || isNaN(progress)) {
		return 0;
	}

	const clamped = Math.max(0, Math.min(1, progress));
	return Math.round(clamped * 100 * 100) / 100;
}
