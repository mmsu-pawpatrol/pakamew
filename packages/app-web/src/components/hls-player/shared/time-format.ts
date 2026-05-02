export function formatClock(value: number) {
	if (!Number.isFinite(value) || value <= 0) {
		return "0:00";
	}

	const wholeSeconds = Math.max(0, Math.floor(value));
	const hours = Math.floor(wholeSeconds / 3600);
	const minutes = Math.floor(wholeSeconds / 60);
	const minutesWithinHour = Math.floor((wholeSeconds % 3600) / 60);
	const seconds = wholeSeconds % 60;

	if (hours > 0) {
		return `${hours}:${minutesWithinHour.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
	}

	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatDriftClock(value: number) {
	if (!Number.isFinite(value) || value <= 0) {
		return "-0:00";
	}

	return `-${formatClock(value)}`;
}
