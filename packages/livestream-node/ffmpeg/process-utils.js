/**
 * @param {import("child_process").ChildProcessWithoutNullStreams | null} processRef
 * @returns {boolean}
 */
function isRunning(processRef) {
	return Boolean(processRef && processRef.exitCode == null);
}

/**
 * @param {import("stream").Writable | null | undefined} stdin
 * @returns {boolean}
 */
function isStdinWritable(stdin) {
	return Boolean(stdin && !stdin.destroyed && !stdin.writableEnded && stdin.writable);
}

module.exports = {
	isRunning,
	isStdinWritable,
};
