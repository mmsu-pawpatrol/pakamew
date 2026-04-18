import { getSchemaRawEnvSnapshot } from "@pakamew/shared/utils/log-env";
import { EnvSchema, getEnv } from "../../../env";
import { config } from "../config";
import { initLogger } from "./core";

const { NODE_ENV } = getEnv((env) => [env.NODE_ENV]);

const logger = initLogger(config);

logger.info(
	{ event: "app.startup" },
	JSON.stringify(
		{
			config: config,
			env: getSchemaRawEnvSnapshot(EnvSchema.shape),
		},
		null,
		NODE_ENV == "development" ? 2 : undefined,
	),
);

export function getLogger() {
	return logger;
}
