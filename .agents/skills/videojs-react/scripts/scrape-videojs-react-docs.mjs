import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const WORKSPACE_ROOT = "/home/daawaan4u/.repos/daawaan4x/pakamew";
const SKILL_ROOT = path.join(WORKSPACE_ROOT, ".agents/skills/videojs-react");
const INDEX_PATH = path.join(SKILL_ROOT, "index.md");

const DOC_HOST = "videojs.org";
const REACT_DOC_PREFIX = "/docs/framework/react/";
const ROOT_LLMS_PATH = "/llms.txt";
const REACT_LLMS_PATH = "/docs/framework/react/llms.txt";

function normalizeLineEndings(value) {
	return value.replace(/\r\n/g, "\n");
}

function extractTargets(markdown) {
	const targets = new Set();
	const pattern = /(?<!!)\[[^\]]*?\]\((?<target>[^)\s]+)(?:\s+"[^"]*")?\)/g;
	const bareUrlPattern = /https:\/\/videojs\.org\/[^\s)<>"`]+/g;

	for (const match of markdown.matchAll(pattern)) {
		const target = match.groups?.target?.trim();

		if (!target) {
			continue;
		}

		targets.add(target);
	}

	for (const match of markdown.matchAll(bareUrlPattern)) {
		targets.add(match[0]);
	}

	return [...targets];
}

function canonicalizeUrl(rawTarget, baseUrl) {
	try {
		const url = new URL(rawTarget, baseUrl);
		url.hash = "";

		if (url.protocol !== "https:" || url.host !== DOC_HOST) {
			return null;
		}

	if (url.pathname.endsWith("/") && url.pathname !== "/") {
		url.pathname = `${url.pathname.slice(0, -1)}.md`;
	}

	if (
		url.pathname.startsWith(REACT_DOC_PREFIX) &&
		path.posix.extname(url.pathname) === "" &&
		url.pathname !== REACT_DOC_PREFIX.slice(0, -1)
	) {
		url.pathname = `${url.pathname}.md`;
	}

		return url;
	} catch {
		return null;
	}
}

function isScrapeable(url) {
	if (url.host !== DOC_HOST) {
		return false;
	}

	if (url.pathname === ROOT_LLMS_PATH || url.pathname === REACT_LLMS_PATH) {
		return true;
	}

	return url.pathname.startsWith(REACT_DOC_PREFIX) && url.pathname.endsWith(".md");
}

function toCanonicalKey(url) {
	return `${url.origin}${url.pathname}`;
}

function toLocalPath(url) {
	if (url.pathname === ROOT_LLMS_PATH) {
		return path.join(SKILL_ROOT, "_site", "llms.txt");
	}

	if (url.pathname === REACT_LLMS_PATH) {
		return path.join(SKILL_ROOT, "llms.txt");
	}

	const relativePath = url.pathname.slice(REACT_DOC_PREFIX.length);
	return path.join(SKILL_ROOT, relativePath);
}

function toRelativeLocalLink(fromUrl, toUrl) {
	const fromPath = toLocalPath(fromUrl);
	const toPath = toLocalPath(toUrl);

	return normalizeLineEndings(path.relative(path.dirname(fromPath), toPath)).split(path.sep).join("/");
}

function rewriteMarkdownLinks(markdown, currentUrl, knownUrls) {
	const pattern = /(?<!!)\[(?<label>[^\]]*?)\]\((?<target>[^)\s]+)(?<suffix>(?:\s+"[^"]*")?)\)/g;

	const rewrittenLinks = markdown.replace(pattern, (fullMatch, _label, _target, _suffix, _offset, _input, groups) => {
		const target = groups?.target?.trim();

		if (!target) {
			return fullMatch;
		}

		const resolved = canonicalizeUrl(target, currentUrl);

		if (!resolved || !isScrapeable(resolved)) {
			return fullMatch;
		}

		const key = toCanonicalKey(resolved);

		if (!knownUrls.has(key)) {
			return fullMatch;
		}

		const localHref = toRelativeLocalLink(currentUrl, resolved);
		return `[${groups.label}](${localHref}${groups.suffix ?? ""})`;
	});

	return rewrittenLinks.replace(/https:\/\/videojs\.org\/[^\s)<>"`]+/g, (rawTarget) => {
		const resolved = canonicalizeUrl(rawTarget, currentUrl);

		if (!resolved || !isScrapeable(resolved)) {
			return rawTarget;
		}

		const key = toCanonicalKey(resolved);

		if (!knownUrls.has(key)) {
			return rawTarget;
		}

		return toRelativeLocalLink(currentUrl, resolved);
	});
}

async function fetchText(url) {
	const response = await fetch(url.toString(), {
		headers: {
			accept: "text/markdown, text/plain;q=0.9, */*;q=0.1",
			"user-agent": "pakamew-videojs-react-doc-scraper/1.0",
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch ${url} (${response.status})`);
	}

	return normalizeLineEndings(await response.text());
}

async function ensureDirectory(filePath) {
	await mkdir(path.dirname(filePath), { recursive: true });
}

async function crawl() {
	const indexMarkdown = normalizeLineEndings(await readFile(INDEX_PATH, "utf8"));
	const seedTargets = extractTargets(indexMarkdown)
		.map((link) => canonicalizeUrl(link, "https://videojs.org/docs/framework/react/llms.txt"))
		.filter((url) => url && isScrapeable(url));

	const queue = seedTargets;
	const seen = new Set();
	const documents = new Map();

	for (let index = 0; index < queue.length; index += 1) {
		const url = queue[index];
		const key = toCanonicalKey(url);

		if (seen.has(key)) {
			continue;
		}

		seen.add(key);

		const markdown = await fetchText(url);
		documents.set(key, { url, markdown });

		for (const link of extractTargets(markdown)) {
			const resolved = canonicalizeUrl(link, url);

			if (!resolved || !isScrapeable(resolved)) {
				continue;
			}

			const resolvedKey = toCanonicalKey(resolved);

			if (!seen.has(resolvedKey)) {
				queue.push(resolved);
			}
		}
	}

	for (const { url, markdown } of documents.values()) {
		const filePath = toLocalPath(url);
		const rewritten = rewriteMarkdownLinks(markdown, url, seen);

		await ensureDirectory(filePath);
		await writeFile(filePath, rewritten, "utf8");
	}

	const reactLlmsUrl = canonicalizeUrl("https://videojs.org/docs/framework/react/llms.txt");
	const localIndex = rewriteMarkdownLinks(indexMarkdown, reactLlmsUrl, seen);
	await writeFile(INDEX_PATH, localIndex, "utf8");

	const manifest = {
		generatedAt: new Date().toISOString(),
		sourceIndex: "https://videojs.org/docs/framework/react/llms.txt",
		documentCount: documents.size,
		documents: [...documents.values()]
			.map(({ url }) => ({
				sourceUrl: url.toString(),
				localPath: path.relative(SKILL_ROOT, toLocalPath(url)).split(path.sep).join("/"),
			}))
			.sort((left, right) => left.localPath.localeCompare(right.localPath)),
	};

	await writeFile(
		path.join(SKILL_ROOT, "manifest.json"),
		`${JSON.stringify(manifest, null, 2)}\n`,
		"utf8",
	);
}

await crawl();
