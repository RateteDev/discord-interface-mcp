import pino from 'pino';
import { env } from './env';

/**
 * ロガートランスポート設定
 * @description 開発環境用のプリティプリント設定を構成
 */
const transport = env.NODE_ENV !== 'production'
    ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
        }
    }
    : undefined;

/**
 * アプリケーションロガーインスタンス
 * @description 環境固有の設定でPinoロガーインスタンスを作成
 * @example
 * import { logger } from './utils/logger';
 * logger.info('アプリケーションが開始されました');
 */
const logger = pino({
    level: env.LOG_LEVEL,
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: transport,
});

export { logger };
