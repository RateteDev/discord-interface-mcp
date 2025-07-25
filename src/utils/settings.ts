import { z } from "zod";
import fs from "fs";
import path from "path";

/**
 * 設定ファイルのスキーマ定義
 * @description アプリケーション設定のバリデーションスキーマ
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
 * @description settingsSchemaから推論される設定の型
 */
export type Settings = z.infer<typeof settingsSchema>;

/**
 * 設定ファイルを読み込む
 * @description settings.jsonファイルを読み込み、スキーマでバリデーションを行う
 * @returns {Settings} バリデーション済みの設定オブジェクト
 * @throws {Error} ファイルが存在しない場合またはバリデーションエラー
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

/**
 * アプリケーション設定
 * @description 読み込み済みの設定オブジェクト
 */
export const settings = loadSettings();
