import { env } from "@/env";
import { useCallback, useEffect, useRef, useState } from "react";
import { createInitialLivestreamState, reduceLivestream } from "./reducer";
import { createLivestreamTransport } from "./transport";
import type { LivestreamCommand, LivestreamEvent, LivestreamState } from "./types";

const LIVESTREAM_STALL_TIMEOUT_MS = 5000;
const LIVESTREAM_STALL_POLL_INTERVAL_MS = 1000;

export interface UseLivestreamResult {
	state: LivestreamState;
	retry: () => void;
	setUrl: (sourceUrl: string) => void;
}

export function useLivestream(url = env.VITE_LIVESTREAM_URL): UseLivestreamResult {
	const [state, setState] = useState(() => createInitialLivestreamState(url));
	const stateRef = useRef(state);
	const dispatchRef = useRef<(event: LivestreamEvent) => void>(() => undefined);
	const transportRef = useRef<ReturnType<typeof createLivestreamTransport> | null>(null);
	const lastFrameAtRef = useRef<number | null>(null);

	const run = useCallback((command: LivestreamCommand) => {
		transportRef.current?.run(command);
	}, []);

	const dispatch = useCallback(
		(event: LivestreamEvent) => {
			if (event.type === "frame-ready") {
				lastFrameAtRef.current = Date.now();
			}

			if (event.type === "source-url-set" || event.type === "retry-requested") {
				lastFrameAtRef.current = null;
			}

			const result = reduceLivestream(stateRef.current, event);

			stateRef.current = result.state;
			setState(result.state);

			for (const command of result.commands) {
				run(command);
			}
		},
		[run],
	);

	useEffect(() => {
		dispatchRef.current = dispatch;
	}, [dispatch]);

	useEffect(() => {
		transportRef.current = createLivestreamTransport((event) => {
			dispatchRef.current(event);
		});

		return () => {
			transportRef.current?.dispose(stateRef.current.frames);
			transportRef.current = null;
		};
	}, []);

	useEffect(() => {
		const intervalId = window.setInterval(() => {
			if (stateRef.current.status !== "live" || !lastFrameAtRef.current) {
				return;
			}

			const elapsedMs = Date.now() - lastFrameAtRef.current;
			if (elapsedMs <= LIVESTREAM_STALL_TIMEOUT_MS) {
				return;
			}

			lastFrameAtRef.current = null;
			dispatchRef.current({ type: "frame-stalled" });
		}, LIVESTREAM_STALL_POLL_INTERVAL_MS);

		return () => {
			window.clearInterval(intervalId);
		};
	}, []);

	const retry = useCallback(() => {
		dispatchRef.current({ type: "retry-requested" });
	}, []);

	const setUrl = useCallback((sourceUrl: string) => {
		dispatchRef.current({ type: "source-url-set", url: sourceUrl });
	}, []);

	useEffect(() => {
		setUrl(url);
	}, [setUrl, url]);

	return {
		state,
		retry,
		setUrl,
	};
}
