import { getSchemaRawEnvSnapshot } from "@pakamew/shared/utils/log-env";
import { EnvSchema } from "../../../env";
import { config } from "../config";
import { initLogger } from "./core";

const logger = initLogger(config);

logger.info(
	{
		event: "app.startup",
		config: config,
		env: getSchemaRawEnvSnapshot(EnvSchema.shape),
	},
	"App Startup",
);

export function getLogger() {
	return logger;
}
