/**
 * MCP v2 API の型定義
 */

/**
 * Embedフィールド
 */
export interface Field {
  name: string;
  value: string;
  inline?: boolean;
}

/**
 * ボタン定義
 */
export interface Button {
  label: string;
  value: string;
}

/**
 * send_textchannel_message の引数
 */
export interface SendTextChannelMessageArgs {
  title?: string;
  description?: string;
  fields?: Field[];
}

/**
 * create_thread の引数
 */
export interface CreateThreadArgs {
  threadName: string;
  initialMessage: {
    title?: string;
    description?: string;
    fields?: Field[];
  };
}

/**
 * send_thread_message の引数
 */
export interface SendThreadMessageArgs {
  threadId: string;
  title?: string;
  description?: string;
  fields?: Field[];
  waitForResponse?: {
    type: 'text' | 'button';
    buttons?: Button[];
  };
}

/**
 * send_textchannel_message のレスポンス
 */
export interface TextChannelMessageResponse {
  sentAt: string;
  messageId: string;
  channelId: string;
  status: 'success';
}

/**
 * create_thread のレスポンス
 */
export interface CreateThreadResponse {
  sentAt: string;
  messageId: string;
  channelId: string;
  threadId: string;
  status: 'success';
}

/**
 * send_thread_message のレスポンス（待機なし）
 */
export interface ThreadMessageResponse {
  sentAt: string;
  messageId: string;
  threadId: string;
  status: 'success';
}

/**
 * send_thread_message のレスポンス（テキスト待機）
 */
export interface ThreadMessageTextResponse extends ThreadMessageResponse {
  response: {
    type: 'text';
    text: string | 'timeout';
    userId?: string;
    responseTime: number;
  };
}

/**
 * send_thread_message のレスポンス（ボタン待機）
 */
export interface ThreadMessageButtonResponse extends ThreadMessageResponse {
  response: {
    type: 'button';
    value: string | 'timeout';
    userId?: string;
    responseTime: number;
  };
}

/**
 * send_thread_message の統合レスポンス型
 */
export type SendThreadMessageResponse =
  | ThreadMessageResponse
  | ThreadMessageTextResponse
  | ThreadMessageButtonResponse;

/**
 * get_threads の引数
 */
export interface GetThreadsArgs {
  filter?: 'all' | 'active' | 'archived';
}

/**
 * スレッド情報
 */
export interface ThreadInfo {
  threadId: string;
  threadName: string;
  createdAt: string;
  archived: boolean;
}

/**
 * get_threads のレスポンス
 */
export interface GetThreadsResponse {
  threads: ThreadInfo[];
  fetchedAt: string;
  totalCount: number;
  status: 'success';
}
