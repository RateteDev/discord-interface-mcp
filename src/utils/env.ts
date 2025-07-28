import { parseEnv } from "znv";
import { z } from "zod";

/**
 * 環境変数の読み込み
 * @description 環境変数をパースしてバリデーションを実施
 * @see https://github.com/lostfictions/znv/tree/master
 */
export const env = parseEnv(process.env, {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    DISCORD_BOT_TOKEN: z.string().min(1),
    DISCORD_GUILD_ID: z.string().min(1),
    DISCORD_TEXT_CHANNEL_ID: z.string().min(1),
    DISCORD_RESPONSE_TIMEOUT_SECONDS: z.string().optional().transform(val => 
        val ? parseInt(val, 10) : undefined
    ),
});

/**
 * 環境変数をマスクするための関数
 * @description セキュリティのため環境変数の値をマスクし、最初の3文字だけ表示
 * @param {string} value - マスクする値
 * @returns {string} マスクされた値
 * @example
 * maskEnv('sk-1234567890') // 'sk-******'
 */
export function maskEnv(value: string): string {
    // 最初の3文字だけ表示
    return value.slice(0, 3) + "******";
}
