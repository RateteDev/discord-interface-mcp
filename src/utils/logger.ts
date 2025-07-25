import pino from 'pino';
import { env } from './env';

/**
 * ロガートランスポート設定
 * @description 開発環境用のプリティプリント設定を構成
 * MCPプロトコルではstdin/stdoutを使用するため、ログはstderrに出力
 */
const transport = env.NODE_ENV !== 'production'
    ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
            destination: 2, // stderr に出力（MCPプロトコルとの混在を回避）
        }
    }
    : {
        target: 'pino/file',
        options: {
            destination: 2, // 本番環境でもstderrに出力
        }
    };

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
