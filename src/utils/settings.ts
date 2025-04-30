import { z } from "zod";
import fs from "fs";
import path from "path";

/**
 * 設定ファイルのスキーマ定義
 */
export const settingsSchema = z.object({
    appName: z.string().min(1),
    featureFlags: z.object({
        newUI: z.boolean(),
        betaFeature: z.boolean().optional().default(false),
    }),
    apiEndpoints: z.object({
        users: z.string().url().or(z.string().startsWith("/")),
        products: z.string().url().or(z.string().startsWith("/")),
    }),
    retryAttempts: z.number().int().positive().max(5),
});

/**
 * 設定ファイルの型定義
 */
export type Settings = z.infer<typeof settingsSchema>;

/**
 * 設定ファイルを読み込む
 * @returns 設定ファイルの内容
 */
function loadSettings(): Settings {
    // ルートのsettings.jsonを読み込む
    const settingsPath = path.resolve(process.cwd(), "settings.json");
    const fileContent = fs.readFileSync(settingsPath, "utf-8");
    // JSONファイルをパース
    const jsonData = JSON.parse(fileContent);
    // パースしたJSONデータをスキーマにマッチング
    const validatedSettings = settingsSchema.parse(jsonData);
    return validatedSettings;
}

// 設定ファイルをエクスポート
export const settings = loadSettings();
