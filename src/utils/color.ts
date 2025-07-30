import { z } from 'zod';

/**
 * ステータスタイプ
 */
export type StatusType =
    | 'waiting'
    | 'success'
    | 'completed'
    | 'error'
    | 'normal';

/**
 * ステータスに応じた色の定義
 */
const STATUS_COLORS: Record<StatusType, number> = {
    waiting: 0x0099ff, // 青
    success: 0x00ff00, // 緑
    completed: 0x00ff00, // 緑
    error: 0xff0000, // 赤
    normal: 0xf5682a, // Claudeオレンジ
};

/**
 * ステータスに応じた色を取得
 * @param status ステータスタイプ
 * @returns Discord用の色値
 */
export function getStatusColor(status?: StatusType): number {
    return status ? STATUS_COLORS[status] : STATUS_COLORS.normal;
}

/**
 * CSS基本16色名のスキーマ（後方互換性のため残す）
 */
export const ColorNameSchema = z.enum([
    'black',
    'silver',
    'gray',
    'white',
    'maroon',
    'red',
    'purple',
    'fuchsia',
    'green',
    'lime',
    'olive',
    'yellow',
    'navy',
    'blue',
    'teal',
    'aqua',
]);

export type ColorName = z.infer<typeof ColorNameSchema>;

/**
 * CSS基本16色名を16進数値に変換するマッピング（後方互換性のため残す）
 */
const COLOR_MAP: Record<ColorName, number> = {
    black: 0x000000,
    silver: 0xc0c0c0,
    gray: 0x808080,
    white: 0xffffff,
    maroon: 0x800000,
    red: 0xff0000,
    purple: 0x800080,
    fuchsia: 0xff00ff,
    green: 0x008000,
    lime: 0x00ff00,
    olive: 0x808000,
    yellow: 0xffff00,
    navy: 0x000080,
    blue: 0x0000ff,
    teal: 0x008080,
    aqua: 0x00ffff,
};

/**
 * 色名を16進数値に変換（後方互換性のため残す）
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
