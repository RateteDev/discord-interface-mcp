import { parseEnv } from "znv";
import { z } from "zod";

/**
 * load environment variables
 * @see https://github.com/lostfictions/znv/tree/master
 */
export const env = parseEnv(process.env, {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    LOG_LEVEL: z.enum(["info", "debug", "warn", "error"]).default("info"),

    EXAMPLE_API_KEY: z.string().min(1).startsWith("sk-"),
    EXAMPLE_API_URL: z.string().min(1).url(),
});
