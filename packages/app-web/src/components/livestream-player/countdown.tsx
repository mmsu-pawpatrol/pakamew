import { useEffect, useState } from "react";

interface CountdownProps {
	targetAtMs: number;
}

function getRemainingSeconds(targetAtMs: number) {
	return Math.max(0, Math.ceil((targetAtMs - Date.now()) / 1_000));
}

export function Countdown({ targetAtMs }: CountdownProps) {
	const [remainingSeconds, setRemainingSeconds] = useState(() => getRemainingSeconds(targetAtMs));

	useEffect(() => {
		const interval = setInterval(() => {
			setRemainingSeconds((current) => {
				const next = getRemainingSeconds(targetAtMs);
				return next === current ? current : next;
			});
		}, 1_000);

		return () => {
			clearInterval(interval);
		};
	}, [targetAtMs]);

	return <>{remainingSeconds}</>;
}
