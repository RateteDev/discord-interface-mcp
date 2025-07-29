import type { Locale, MessageKey, LocaleMessages } from '../types/i18n';
import { en } from './locales/en';
import { ja } from './locales/ja';

/**
 * ロケールメッセージの定義
 */
const messages: LocaleMessages = {
  en,
  ja,
};

/**
 * 現在のロケール
 */
let currentLocale: Locale = 'en';

/**
 * 現在のロケールを取得
 * @returns 現在のロケール
 */
export function getLocale(): Locale {
  return currentLocale;
}

/**
 * ロケールを設定
 * @param locale 設定するロケール
 */
export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

/**
 * メッセージを翻訳
 * @param key メッセージキー
 * @returns 翻訳されたメッセージ
 */
export function t(key: MessageKey): string {
  return messages[currentLocale][key];
}

/**
 * i18nシステムを初期化
 * 環境変数からロケールを読み込む
 */
export function initializeI18n(): void {
  const envLocale = process.env.DISCORD_LOCALE;
  if (envLocale === 'ja' || envLocale === 'en') {
    currentLocale = envLocale;
  }
}

/**
 * デフォルトエクスポート
 */
export const i18n = {
  getLocale,
  setLocale,
  t,
  initializeI18n,
};
