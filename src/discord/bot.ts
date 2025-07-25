import { Client, Events, GatewayIntentBits, type MessageCreateOptions, type TextBasedChannel } from "discord.js";
import { logger } from "../utils/logger";

/**
 * Discord Bot の設定インターフェース
 */
export interface DiscordBotConfig {
    /** Discord Bot のトークン */
    token: string;
    /** 対象のギルド（サーバー）ID */
    guildId: string;
    /** メッセージ送信先のテキストチャンネルID */
    textChannelId: string;
}

/**
 * Discord Bot クラス
 * @description Discord との接続を管理し、メッセージの送受信を行う
 */
export class DiscordBot {
    private client: Client;
    private config: DiscordBotConfig;
    private isReady: boolean = false;

    /**
     * コンストラクタ
     * @param config Discord Bot の設定
     */
    constructor(config: DiscordBotConfig) {
        this.config = config;
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
        });
    }

    /**
     * イベントハンドラーの設定
     * @private
     */
    private setupEventHandlers(): void {
        this.client.once(Events.ClientReady, (client) => {
            logger.info(`Discord Bot logged in as ${client.user.tag}`);
            this.isReady = true;
        });

        this.client.on(Events.Error, (error) => {
            logger.error("Discord client error:", error);
        });
    }

    /**
     * Discord Bot を開始
     * @returns Promise<void>
     */
    async start(): Promise<void> {
        try {
            logger.info("Starting Discord bot...");
            this.setupEventHandlers();
            await this.client.login(this.config.token);
        } catch (error) {
            logger.error("Failed to start Discord bot:", error);
            throw error;
        }
    }

    /**
     * 指定されたチャンネルにメッセージを送信
     * @param content 送信するメッセージ内容（文字列またはMessageCreateOptions）
     * @returns Promise<void>
     */
    async sendMessage(content: string | MessageCreateOptions): Promise<void> {
        if (!this.isReady) {
            throw new Error("Bot is not ready");
        }

        const channel = this.client.channels.cache.get(this.config.textChannelId);
        
        if (!channel) {
            throw new Error("Channel not found");
        }

        if (!channel.isTextBased()) {
            throw new Error("Channel is not a text channel");
        }

        try {
            // Type guard ensures channel is TextBasedChannel
            if ('send' in channel) {
                await channel.send(content);
            } else {
                throw new Error("Channel does not support sending messages");
            }
            logger.debug(`Message sent to channel ${this.config.textChannelId}`);
        } catch (error) {
            logger.error("Failed to send message:", error);
            throw error;
        }
    }

    /**
     * Discord Bot を停止
     * @returns Promise<void>
     */
    async stop(): Promise<void> {
        logger.info("Stopping Discord bot...");
        await this.client.destroy();
        this.isReady = false;
    }

    /**
     * Bot の準備ができているかを確認
     * @returns boolean
     */
    getIsReady(): boolean {
        return this.isReady;
    }

    /**
     * Bot の準備状態を設定（テスト用）
     * @param ready 準備状態
     * @internal
     */
    _setReady(ready: boolean): void {
        this.isReady = ready;
    }
}