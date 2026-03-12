/**
 * Build ffmpeg args for low-latency JPEG (image2pipe) to RTMP H.264 forwarding.
 *
 * @param {number} streamFps
 * @param {string} rtmpUrl
 * @returns {string[]}
 */
function buildFfmpegArgs(streamFps, rtmpUrl) {
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
		// Encode video as H.264 for RTMP compatibility.
		"-c:v",
		"libx264",
		// Favor low CPU usage / speed over compression ratio.
		"-preset",
		"ultrafast",
		// Minimize encoder buffering for low latency.
		"-tune",
		"zerolatency",
		// Use widely compatible chroma format.
		"-pix_fmt",
		"yuv420p",
		// GOP length: keyframe every ~2 seconds at configured FPS.
		"-g",
		String(streamFps * 2),
		// Output container/protocol for RTMP publish.
		"-f",
		"flv",
		// Destination RTMP endpoint (OME ingest URL).
		rtmpUrl,
	];
}

module.exports = {
	buildFfmpegArgs,
};
