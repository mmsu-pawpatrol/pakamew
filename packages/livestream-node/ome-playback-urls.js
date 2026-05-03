const OME_PLAYBACK_PORT = "3333";

function formatHostname(hostname) {
	if (!hostname) return null;
	return hostname.includes(":") ? `[${hostname}]` : hostname;
}

function trimTrailingSlash(value) {
	return value.endsWith("/") ? value.slice(0, -1) : value;
}

function createOmePlaybackUrls(rtmpUrl) {
	try {
		const parsedUrl = new URL(rtmpUrl);
		const hostname = formatHostname(parsedUrl.hostname);
		const streamPath = trimTrailingSlash(parsedUrl.pathname);

		if (!hostname || !streamPath || streamPath === "/") {
			return null;
		}

		return {
			llhlsUrl: `http://${hostname}:${OME_PLAYBACK_PORT}${streamPath}/master.m3u8`,
			webRtcUrl: `ws://${hostname}:${OME_PLAYBACK_PORT}${streamPath}`,
		};
	} catch {
		return null;
	}
}

module.exports = {
	createOmePlaybackUrls,
};
