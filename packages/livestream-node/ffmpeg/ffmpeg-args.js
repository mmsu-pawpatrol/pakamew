/**
 * Shared x264 output arguments for low-latency RTMP forwarding.
 *
 * @param {number} streamFps
 * @returns {string[]}
 */
function buildCommonOutputArgs(streamFps) {
	return [
		// Encode video as H.264 for RTMP compatibility.
		"-c:v",
		"libx264",
		// Keep live latency low without the heavy quality loss of ultrafast.
		"-preset",
		"veryfast",
		// Minimize encoder buffering for low latency.
		"-tune",
		"zerolatency",
		// Use the high profile for better compression efficiency at the same CRF.
		"-profile:v",
		"high",
		// Preserve more detail from the already-compressed OV2640 JPEG source.
		"-crf",
		"17",
		// GOP length: keyframe every ~2 seconds at configured FPS.
		"-g",
		String(streamFps * 2),
		// Keep GOP cadence stable for live segmenters and playback.
		"-keyint_min",
		String(streamFps * 2),
		// Avoid scene-cut keyframes that can disrupt live stream cadence.
		"-sc_threshold",
		"0",
	];
}

/**
 * Shared ffmpeg input arguments for JPEG frames received over stdin.
 *
 * @param {number} streamFps
 * @returns {string[]}
 */
function buildJpegPipeInputArgs(streamFps) {
	return [
		// Hide ffmpeg startup/build banner noise.
		"-hide_banner",
		// Emit warnings/errors only.
		"-loglevel",
		"warning",
		// Input format is an image stream coming through stdin.
		"-f",
		"image2pipe",
		// Expected source frame rate for JPEG packets.
		"-framerate",
		String(streamFps),
		// Decode incoming images as MJPEG.
		"-vcodec",
		"mjpeg",
		// Read frames from stdin.
		"-i",
		"pipe:0",
		// No audio track.
		"-an",
	];
}

/**
 * Build ffmpeg args optimized for OME playback compatibility.
 *
 * This explicitly converts the full-range JPEG source into standard
 * limited-range H.264 for the broadest compatibility across RTMP ingest,
 * WebRTC playback, and LL-HLS playback.
 *
 * @param {number} streamFps
 * @param {string} rtmpUrl
 * @returns {string[]}
 */
function buildOmeFirstFfmpegArgs(streamFps, rtmpUrl) {
	return [
		...buildJpegPipeInputArgs(streamFps),
		// Convert JPEG full-range into standard limited-range H.264.
		"-vf",
		"scale=iw:ih:in_range=pc:out_range=tv:flags=lanczos,format=yuv420p,setparams=range=tv",
		...buildCommonOutputArgs(streamFps),
		// Signal a conventional limited-range stream.
		"-color_range",
		"tv",
		// Keep live rate control predictable.
		"-x264-params",
		"force-cfr=1:rc-lookahead=0",
		// Output container/protocol for RTMP publish.
		"-f",
		"flv",
		// Destination RTMP endpoint (OME ingest URL).
		rtmpUrl,
	];
}

/**
 * Build ffmpeg args optimized for preserving the OV2640 JPEG look.
 *
 * This keeps the source in full-range through the H.264 encode, which better
 * preserves highlight and shadow detail from the ESP32-CAM's MJPEG output.
 *
 * @param {number} streamFps
 * @param {string} rtmpUrl
 * @returns {string[]}
 */
function buildOv2640FirstFfmpegArgs(streamFps, rtmpUrl) {
	return [
		...buildJpegPipeInputArgs(streamFps),
		// Preserve the OV2640 JPEG source range through the H.264 encode.
		"-vf",
		"scale=iw:ih:in_range=pc:out_range=pc:flags=lanczos,format=yuv420p,setparams=range=pc",
		...buildCommonOutputArgs(streamFps),
		// Keep the H.264 stream tagged as full-range for compatible players.
		"-color_range",
		"pc",
		// Preserve full-range signaling in x264 metadata.
		"-x264-params",
		"fullrange=on:force-cfr=1:rc-lookahead=0",
		// Output container/protocol for RTMP publish.
		"-f",
		"flv",
		// Destination RTMP endpoint (OME ingest URL).
		rtmpUrl,
	];
}

/**
 * Build ffmpeg args for low-latency JPEG (image2pipe) to RTMP H.264 forwarding.
 *
 * The default profile is OV2640-first because the production source is an
 * ESP32-CAM OV2640 emitting MJPEG frames.
 *
 * @param {number} streamFps
 * @param {string} rtmpUrl
 * @returns {string[]}
 */
function buildFfmpegArgs(streamFps, rtmpUrl) {
	return buildOv2640FirstFfmpegArgs(streamFps, rtmpUrl);
}

module.exports = {
	buildFfmpegArgs,
	buildOmeFirstFfmpegArgs,
	buildOv2640FirstFfmpegArgs,
};
