/**
 * Create scoped logger helpers for ffmpeg forwarder modules.
 *
 * @param {string} logPrefix
 */
function createLogger(logPrefix) {
	function info(message) {
		console.log(`${logPrefix} ${message}`);
	}

	function error(message, details) {
		if (details === undefined) {
			console.error(`${logPrefix} ${message}`);
			return;
		}

		console.error(`${logPrefix} ${message}`, details);
	}

	return {
		info,
		error,
	};
}

module.exports = {
	createLogger,
};
