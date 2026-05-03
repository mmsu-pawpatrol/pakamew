import { describe, expect, it } from "vitest";
import framePacerModule from "./frame-pacer.js";

const { createFramePacer } = framePacerModule;

describe("createFramePacer", () => {
	it("keeps a steady 24fps source on cadence after the initial buffer", () => {
		const pacer = createFramePacer({
			jitterBufferMs: 167,
			maxPendingAgeMs: 250,
			sourceStaleTimeoutMs: 1000,
			targetOutputFps: 24,
		});
		const frames = Array.from({ length: 8 }, (_, index) => Buffer.from(`frame-${index}`));

		frames.forEach((frame, index) => {
			pacer.pushFrame(frame, index * (1000 / 24));
		});

		expect(pacer.tick(167)).toBe(frames[0]);
		expect(pacer.tick(209)).toBe(frames[1]);
		expect(pacer.tick(251)).toBe(frames[2]);
		expect(pacer.tick(292)).toBe(frames[3]);

		const metrics = pacer.drainWindowMetrics(334);
		expect(metrics.duplicateFrames).toBe(0);
		expect(metrics.droppedFrames).toBe(0);
		expect(metrics.totalOutputFrames).toBe(4);
	});

	it("duplicates the latest frame when the source under-runs", () => {
		const pacer = createFramePacer({
			jitterBufferMs: 167,
			maxPendingAgeMs: 250,
			sourceStaleTimeoutMs: 1000,
			targetOutputFps: 24,
		});
		const firstFrame = Buffer.from("first");
		const secondFrame = Buffer.from("second");

		pacer.pushFrame(firstFrame, 0);
		pacer.pushFrame(secondFrame, 100);

		expect(pacer.tick(167)).toBe(firstFrame);
		expect(pacer.tick(209)).toBe(firstFrame);
		expect(pacer.tick(251)).toBe(firstFrame);
		expect(pacer.tick(292)).toBe(secondFrame);

		const metrics = pacer.drainWindowMetrics(334);
		expect(metrics.duplicateFrames).toBe(2);
		expect(metrics.droppedFrames).toBe(0);
	});

	it("drops stale backlog and keeps the freshest eligible frame", () => {
		const pacer = createFramePacer({
			jitterBufferMs: 167,
			maxPendingAgeMs: 250,
			sourceStaleTimeoutMs: 1000,
			targetOutputFps: 24,
		});
		const burstFrames = Array.from({ length: 10 }, (_, index) => Buffer.from(`burst-${index}`));

		burstFrames.forEach((frame, index) => {
			pacer.pushFrame(frame, index * 10);
		});

		expect(pacer.tick(260)).toBe(burstFrames[9]);

		const metrics = pacer.drainWindowMetrics(300);
		expect(metrics.duplicateFrames).toBe(0);
		expect(metrics.droppedFrames).toBe(9);
		expect(metrics.pendingFrames).toBe(0);
	});

	it("stops emitting duplicated frames when the source goes stale", () => {
		const pacer = createFramePacer({
			jitterBufferMs: 167,
			maxPendingAgeMs: 250,
			sourceStaleTimeoutMs: 1000,
			targetOutputFps: 24,
		});
		const frame = Buffer.from("frame");

		pacer.pushFrame(frame, 0);

		expect(pacer.tick(167)).toBe(frame);
		expect(pacer.tick(500)).toBe(frame);
		expect(pacer.tick(1200)).toBe(null);
	});
});
