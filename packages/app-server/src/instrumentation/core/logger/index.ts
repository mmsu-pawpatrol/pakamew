import { getSchemaRawEnvSnapshot } from "@pakamew/shared/utils/log-env";
import { EnvSchema } from "../../../env";
import { config } from "../config";
import { initLogger } from "./core";

const logger = initLogger(config);

logger.info(
	{ event: "app.startup" },
	JSON.stringify(
		{
			config: config,
			env: getSchemaRawEnvSnapshot(EnvSchema.shape),
		},
		null,
		2,
	),
);

export function getLogger() {
	return logger;
}
