/**
 * i18n関連の型定義
 */

/**
 * サポートする言語
 */
export type Locale = 'ja' | 'en';

/**
 * メッセージキー
 */
export type MessageKey =
  | 'waiting_for_response'
  | 'select_option'
  | 'message_sent'
  | 'processing'
  | 'completed'
  | 'error_occurred'
  | 'session_expired'
  | 'you_selected'
  | 'error_processing_feedback'
  | 'ty_for_reply'
  | 'selected';

/**
 * メッセージ定義の型
 */
export type Messages = Record<MessageKey, string>;

/**
 * ロケール定義の型
 */
export type LocaleMessages = Record<Locale, Messages>;
