import { HlsPlayer } from "@/lib/hls";
import { useEffect, useEffectEvent, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import { PlaybackControllerContext, type PlaybackControllerValue } from "./playback-controller-context";
import { LIVE_EDGE_THRESHOLD_SECONDS, readDvrWindowState } from "./shared/live-edge";

type PlaybackIntent = "play" | "pause";
type SeekTarget = number | "live";

interface PendingSeekCommand {
	id: number;
	target: SeekTarget;
}

interface PlaybackControllerState {
	desiredPlayback: PlaybackIntent;
	followLiveEdge: boolean;
	nextCommandId: number;
	pendingSeek: PendingSeekCommand | null;
}

type PlaybackControllerAction =
	| { type: "go-live" }
	| { type: "toggle-playback"; shouldResumeLive: boolean }
	| { type: "seek-timeline-position"; targetTime: number; shouldFollowLiveEdge: boolean };

const initialPlaybackControllerState: PlaybackControllerState = {
	desiredPlayback: "play",
	followLiveEdge: true,
	nextCommandId: 1,
	pendingSeek: {
		id: 0,
		target: "live",
	},
};

function enqueueSeekCommand(state: PlaybackControllerState, target: SeekTarget): PlaybackControllerState {
	return {
		...state,
		nextCommandId: state.nextCommandId + 1,
		pendingSeek: {
			id: state.nextCommandId,
			target,
		},
	};
}

function playbackControllerReducer(
	state: PlaybackControllerState,
	action: PlaybackControllerAction,
): PlaybackControllerState {
	switch (action.type) {
		case "go-live":
			return enqueueSeekCommand(
				{
					...state,
					desiredPlayback: "play",
					followLiveEdge: true,
				},
				"live",
			);
		case "toggle-playback":
			if (state.desiredPlayback === "play") {
				return {
					...state,
					desiredPlayback: "pause",
					followLiveEdge: false,
				};
			}

			if (action.shouldResumeLive) {
				return enqueueSeekCommand(
					{
						...state,
						desiredPlayback: "play",
						followLiveEdge: true,
					},
					"live",
				);
			}

			return {
				...state,
				desiredPlayback: "play",
				followLiveEdge: false,
			};
		case "seek-timeline-position": {
			if (action.shouldFollowLiveEdge) {
				return enqueueSeekCommand(
					{
						...state,
						desiredPlayback: "play",
						followLiveEdge: true,
					},
					"live",
				);
			}

			return enqueueSeekCommand(
				{
					...state,
					followLiveEdge: false,
				},
				action.targetTime,
			);
		}
	}
}

export interface PlaybackControllerProviderProps {
	children?: ReactNode;
}

export function PlaybackControllerProvider({ children }: PlaybackControllerProviderProps) {
	const media = HlsPlayer.useMedia();
	const currentTime = HlsPlayer.usePlayer((state) => state.currentTime);
	const pause = HlsPlayer.usePlayer((state) => state.pause);
	const paused = HlsPlayer.usePlayer((state) => state.paused);
	const seekable = HlsPlayer.usePlayer((state) => state.seekable);
	const seek = HlsPlayer.usePlayer((state) => state.seek);
	const play = HlsPlayer.usePlayer((state) => state.play);
	const [readyMedia, setReadyMedia] = useState<typeof media>(null);
	const isPlayerReady = media != null && readyMedia === media;
	const dvrWindowState = useMemo(() => readDvrWindowState(currentTime, seekable), [currentTime, seekable]);
	const [state, dispatch] = useReducer(playbackControllerReducer, initialPlaybackControllerState);
	const handledSeekCommandIdRef = useRef<number | null>(null);

	useEffect(() => {
		let cancelled = false;
		const timeoutId = window.setTimeout(() => {
			if (!cancelled) {
				setReadyMedia(media);
			}
		}, 0);

		return () => {
			cancelled = true;
			window.clearTimeout(timeoutId);
		};
	}, [media]);

	const resumePlaybackIfNeeded = useEffectEvent(() => {
		if (!isPlayerReady) {
			return undefined;
		}

		if (state.desiredPlayback === "play") {
			return play();
		}

		return undefined;
	});

	const syncToLiveEdge = useEffectEvent(() => {
		if (!isPlayerReady) {
			return;
		}

		if (state.desiredPlayback !== "play" || !state.followLiveEdge) {
			return;
		}

		const latestDvrWindowState = readDvrWindowState(currentTime, seekable);
		const liveEdge = seekable.at(-1)?.[1];

		if (!latestDvrWindowState.canSeekToLiveEdge || liveEdge == null || !Number.isFinite(liveEdge)) {
			return;
		}

		if (!latestDvrWindowState.isAtLiveEdge) {
			void seek(liveEdge)
				.then(() => resumePlaybackIfNeeded())
				.catch(() => void 0);
			return;
		}

		if (paused) {
			void play().catch(() => void 0);
		}
	});

	useEffect(() => {
		if (!isPlayerReady) {
			return;
		}

		if (state.desiredPlayback === "pause") {
			if (!paused) {
				pause();
			}
			return;
		}

		if (!paused && state.pendingSeek === null) {
			return;
		}

		if (state.pendingSeek !== null) {
			return;
		}

		void play().catch(() => void 0);
	}, [isPlayerReady, pause, paused, play, state.desiredPlayback, state.pendingSeek]);

	useEffect(() => {
		const pendingSeek = state.pendingSeek;

		if (!isPlayerReady || !pendingSeek || handledSeekCommandIdRef.current === pendingSeek.id) {
			return;
		}

		handledSeekCommandIdRef.current = pendingSeek.id;

		const targetTime = pendingSeek.target === "live" ? seekable.at(-1)?.[1] : pendingSeek.target;

		if (targetTime == null || !Number.isFinite(targetTime)) {
			return;
		}

		void seek(targetTime)
			.then(() => resumePlaybackIfNeeded())
			.catch(() => void 0);
	}, [isPlayerReady, seek, seekable, state.pendingSeek]);

	useEffect(() => {
		if (!isPlayerReady) {
			return;
		}

		if (state.desiredPlayback !== "play" || !state.followLiveEdge) {
			return;
		}

		syncToLiveEdge();

		if (!dvrWindowState.canSeekToLiveEdge) {
			return;
		}

		const intervalId = window.setInterval(() => {
			syncToLiveEdge();
		}, 1000);

		return () => {
			window.clearInterval(intervalId);
		};
	}, [dvrWindowState.canSeekToLiveEdge, isPlayerReady, state.desiredPlayback, state.followLiveEdge]);

	const contextValue = useMemo<PlaybackControllerValue>(() => {
		const isPaused = state.desiredPlayback === "pause";
		const isRealtime = state.desiredPlayback === "play" && (state.followLiveEdge || !dvrWindowState.canSeekToLiveEdge);

		return {
			canGoLive: dvrWindowState.canSeekToLiveEdge && !isRealtime,
			dvrWindowState,
			isPaused,
			isRealtime,
			goLive: () => {
				dispatch({ type: "go-live" });
			},
			seekTimelinePosition: (position: number) => {
				const targetTime = dvrWindowState.start + position;
				const shouldFollowLiveEdge =
					state.desiredPlayback === "play" && targetTime >= dvrWindowState.end - LIVE_EDGE_THRESHOLD_SECONDS;

				dispatch({
					type: "seek-timeline-position",
					targetTime,
					shouldFollowLiveEdge,
				});
			},
			togglePlayback: () => {
				dispatch({
					type: "toggle-playback",
					shouldResumeLive: state.followLiveEdge || dvrWindowState.isAtLiveEdge || !dvrWindowState.canSeekToLiveEdge,
				});
			},
		};
	}, [dvrWindowState, state.desiredPlayback, state.followLiveEdge]);

	return <PlaybackControllerContext value={contextValue}>{children}</PlaybackControllerContext>;
}
