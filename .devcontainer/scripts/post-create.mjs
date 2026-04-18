import { execSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";

const workspace = process.cwd();

const pnpm = "corepack pnpm";

const envFiles = [
	["packages/app-server/.env.example", "packages/app-server/.env"],
	["packages/app-web/.env.example", "packages/app-web/.env"],
	["packages/livestream-node/.env.example", "packages/livestream-node/.env"],
];

for (const [sourceRelativePath, targetRelativePath] of envFiles) {
	const sourcePath = path.join(workspace, sourceRelativePath);
	const targetPath = path.join(workspace, targetRelativePath);

	if (existsSync(sourcePath) && !existsSync(targetPath)) copyFileSync(sourcePath, targetPath);
}

execSync(`${pnpm} install --config.confirmModulesPurge=false`, { cwd: workspace, stdio: "inherit" });

execSync(`${pnpm} --filter @pakamew/server exec prisma generate`, { cwd: workspace, stdio: "inherit" });
