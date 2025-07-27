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