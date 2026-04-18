import { execSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";

const workspaceRoot = process.cwd();

const envFiles = [
	["packages/app-server/.env.example", "packages/app-server/.env"],
	["packages/app-web/.env.example", "packages/app-web/.env"],
	["packages/livestream-node/.env.example", "packages/livestream-node/.env"],
];

for (const [sourceRelativePath, targetRelativePath] of envFiles) {
	const sourcePath = path.join(workspaceRoot, sourceRelativePath);
	const targetPath = path.join(workspaceRoot, targetRelativePath);

	if (existsSync(sourcePath) && !existsSync(targetPath)) {
		copyFileSync(sourcePath, targetPath);
	}
}

execSync("corepack enable", { cwd: workspaceRoot, stdio: "inherit" });
execSync("pnpm install", { cwd: workspaceRoot, stdio: "inherit" });
execSync("pnpm --filter @pakamew/server exec prisma generate", {
	cwd: workspaceRoot,
	stdio: "inherit",
});
