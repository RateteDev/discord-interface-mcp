/**
 * MCP 関連の型定義
 */

// Zodスキーマからの型定義をインポート
export type { 
    SendDiscordEmbedArgs, 
    SendDiscordEmbedWithFeedbackArgs,
    SendDiscordEmbedWithThreadArgs,
    ReplyToThreadArgs,
    FeedbackButton,
    ColorName
} from "../validation/schemas";

/**
 * Discord Bot のレスポンス情報
 */
export interface DiscordMessageResponse {
    /** 送信時刻（ISO 8601形式） */
    sentAt: string;
    /** DiscordメッセージID */
    messageId: string;
    /** 送信先チャンネルID */
    channelId: string;
    /** ステータス */
    status: "success";
}

/**
 * フィードバック付きDiscord Bot のレスポンス情報
 */
export interface DiscordFeedbackResponse extends DiscordMessageResponse {
    /** フィードバック情報 */
    feedback: {
        /** ユーザーの応答 */
        response: string | "timeout";
        /** 応答したユーザーID（タイムアウト時は未定義） */
        userId?: string;
        /** 応答時間（ミリ秒） */
        responseTime: number;
    };
}

/**
 * スレッド作成Discord Bot のレスポンス情報
 */
export interface DiscordThreadResponse extends DiscordMessageResponse {
    /** スレッドID */
    threadId: string;
}

/**
 * スレッド返信Discord Bot のレスポンス情報
 */
export interface DiscordThreadReplyResponse {
    /** 送信時刻（ISO 8601形式） */
    sentAt: string;
    /** DiscordメッセージID */
    messageId: string;
    /** スレッドID */
    threadId: string;
    /** ステータス */
    status: "success";
    /** ユーザーの応答（waitForReplyがtrueの場合のみ） */
    userReply?: {
        /** メッセージ内容 */
        message: string | "timeout";
        /** メッセージ送信したユーザーID（タイムアウト時は未定義） */
        userId?: string;
        /** 応答時間（ミリ秒） */
        responseTime: number;
    };
}