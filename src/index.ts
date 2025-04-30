import { env, maskEnv } from "./utils/env";
import { logger } from "./utils/logger";
import { settings } from "./utils/settings";

logger.info("Hello via Bun!");
logger.info(`settings.appName: ${settings.appName}`);
logger.info(`env.EXAMPLE_API_KEY: ${maskEnv(env.EXAMPLE_API_KEY)}`);
