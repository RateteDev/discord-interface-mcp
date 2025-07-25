/**
 * MCP 関連の型定義
 */

/**
 * Discord メッセージ送信ツールの引数
 */
export interface SendDiscordMessageArgs {
    /** 送信するメッセージ内容 */
    content: string;
}

/**
 * Discord Embed 送信ツールの引数
 */
export interface SendDiscordEmbedArgs {
    /** Embed のタイトル */
    title?: string;
    /** Embed の説明 */
    description?: string;
    /** Embed の色（10進数） */
    color?: number;
    /** Embed のフィールド */
    fields?: Array<{
        name: string;
        value: string;
        inline?: boolean;
    }>;
}

/**
 * Discord フィードバック付き Embed 送信ツールの引数
 */
export interface SendDiscordEmbedWithFeedbackArgs {
    /** Embed のタイトル */
    title?: string;
    /** Embed の説明 */
    description?: string;
    /** Embed の色（10進数） */
    color?: number;
    /** Embed のフィールド */
    fields?: Array<{
        name: string;
        value: string;
        inline?: boolean;
    }>;
    /** ボタンの上に表示するテキスト */
    feedbackPrompt?: string;
}