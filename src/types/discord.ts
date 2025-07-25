/**
 * Discord 関連の型定義
 */

import type { MessageCreateOptions, EmbedBuilder } from "discord.js";

/**
 * Discord メッセージ送信オプション
 */
export type DiscordMessageOptions = string | MessageCreateOptions;

/**
 * Discord Embed の設定
 */
export interface DiscordEmbedOptions {
    /** タイトル */
    title?: string;
    /** 説明 */
    description?: string;
    /** 色（16進数） */
    color?: number;
    /** フィールド */
    fields?: Array<{
        name: string;
        value: string;
        inline?: boolean;
    }>;
    /** フッター */
    footer?: {
        text: string;
        iconURL?: string;
    };
    /** タイムスタンプ */
    timestamp?: Date;
}