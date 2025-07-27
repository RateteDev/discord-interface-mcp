import { z } from "zod";

/**
 * CSS基本16色名のスキーマ
 */
export const ColorNameSchema = z.enum([
    "black", "silver", "gray", "white",
    "maroon", "red", "purple", "fuchsia", 
    "green", "lime", "olive", "yellow",
    "navy", "blue", "teal", "aqua"
]);

export type ColorName = z.infer<typeof ColorNameSchema>;

/**
 * CSS基本16色名を16進数値に変換するマッピング
 */
const COLOR_MAP: Record<ColorName, number> = {
    black: 0x000000,
    silver: 0xC0C0C0,
    gray: 0x808080,
    white: 0xFFFFFF,
    maroon: 0x800000,
    red: 0xFF0000,
    purple: 0x800080,
    fuchsia: 0xFF00FF,
    green: 0x008000,
    lime: 0x00FF00,
    olive: 0x808000,
    yellow: 0xFFFF00,
    navy: 0x000080,
    blue: 0x0000FF,
    teal: 0x008080,
    aqua: 0x00FFFF
};

/**
 * 色名を16進数値に変換
 * @param colorName CSS基本16色名
 * @returns Discord用の色値
 */
export function colorNameToHex(colorName: ColorName): number {
    const hexValue = COLOR_MAP[colorName];
    if (hexValue === undefined) {
        throw new Error(`Invalid color name: ${colorName}`);
    }
    return hexValue;
}

/**
 * フィードバックボタンのスキーマ
 */
export const FeedbackButtonSchema = z.object({
    label: z.string().min(1, "ラベルは1文字以上である必要があります").max(80, "ラベルは80文字以下である必要があります"),
    value: z.string().min(1, "値は1文字以上である必要があります").max(100, "値は100文字以下である必要があります")
});

export type FeedbackButton = z.infer<typeof FeedbackButtonSchema>;

/**
 * Embedフィールドのスキーマ
 */
export const EmbedFieldSchema = z.object({
    name: z.string(),
    value: z.string(),
    inline: z.boolean().optional()
});

/**
 * Discord Embed送信引数のスキーマ
 */
export const SendDiscordEmbedArgsSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    color: ColorNameSchema.optional().transform((colorName) => 
        colorName ? colorNameToHex(colorName) : undefined
    ),
    fields: z.array(EmbedFieldSchema).optional()
});

export type SendDiscordEmbedArgs = z.infer<typeof SendDiscordEmbedArgsSchema>;

/**
 * Discord フィードバック付きEmbed送信引数のスキーマ
 */
export const SendDiscordEmbedWithFeedbackArgsSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    color: ColorNameSchema.optional().transform((colorName) => 
        colorName ? colorNameToHex(colorName) : undefined
    ),
    fields: z.array(EmbedFieldSchema).optional(),
    feedbackPrompt: z.string().optional(),
    feedbackButtons: z.array(FeedbackButtonSchema)
        .min(1, "少なくとも1つのボタンが必要です")
        .max(5, "最大5つまでのボタンが許可されています")
        .default([
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" }
        ])
        .refine((buttons) => {
            const values = buttons.map(b => b.value);
            return new Set(values).size === values.length;
        }, "ボタンの値は重複できません")
});

export type SendDiscordEmbedWithFeedbackArgs = z.infer<typeof SendDiscordEmbedWithFeedbackArgsSchema>;