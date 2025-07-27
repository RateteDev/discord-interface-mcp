import { 
    Client, 
    Events, 
    GatewayIntentBits, 
    type MessageCreateOptions, 
    type TextBasedChannel,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    type ButtonInteraction,
    type Message
} from "discord.js";
import type { FeedbackButton } from "../types/mcp";

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
    private feedbackResolvers: Map<string, {
        resolve: (value: { response: string; userId: string }) => void;
        timeout?: NodeJS.Timeout;
        timestamp: number;
    }> = new Map();

    private threadResolvers: Map<string, {
        resolve: (value: { message: string; userId: string }) => void;
        timeout?: NodeJS.Timeout;
        timestamp: number;
    }> = new Map();
    private cleanupInterval?: NodeJS.Timeout;

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
            console.error(`[INFO] Discord Bot logged in as ${client.user.tag}`);
            this.isReady = true;
        });

        this.client.on(Events.Error, (error) => {
            console.error("[ERROR] Discord client error:", error);
        });

        this.client.on(Events.InteractionCreate, async (interaction) => {
            if (!interaction.isButton()) return;
            
            const buttonInteraction = interaction as ButtonInteraction;
            const parts = buttonInteraction.customId.split(':');
            const prefix = parts[0];
            const value = parts[1] || '';
            
            if (prefix === 'feedback' && value) {
                await this.handleFeedbackInteraction(buttonInteraction, value);
            }
        });

        this.client.on(Events.MessageCreate, async (message) => {
            // Botのメッセージは無視
            if (message.author.bot) return;
            
            // スレッド内のメッセージかチェック
            if (!message.channel.isThread()) return;
            
            const threadId = message.channel.id;
            const resolver = this.threadResolvers.get(threadId);
            
            if (resolver) {
                // メッセージを受信したことを示すリアクションを追加
                try {
                    await message.react('✅');
                } catch (error) {
                    console.error('[ERROR] Failed to add reaction:', error);
                }
                
                resolver.resolve({ 
                    message: message.content, 
                    userId: message.author.id 
                });
            }
        });
    }

    /**
     * Discord Bot を開始
     * @returns Promise<void>
     */
    async start(): Promise<void> {
        try {
            console.error("[INFO] Starting Discord bot...");
            this.setupEventHandlers();
            await this.client.login(this.config.token);
            
            // メモリリーク対策: 定期的な古いresolverのクリーンアップ
            this.cleanupInterval = setInterval(() => {
                this.cleanupOldResolvers();
            }, 60000); // 1分ごとにクリーンアップ
        } catch (error) {
            console.error("[ERROR] Failed to start Discord bot:", error);
            throw error;
        }
    }

    /**
     * 指定されたチャンネルにメッセージを送信
     * @param content 送信するメッセージ内容（文字列またはMessageCreateOptions）
     * @returns Promise<{messageId: string, channelId: string, sentAt: string}>
     */
    async sendMessage(content: string | MessageCreateOptions): Promise<{messageId: string, channelId: string, sentAt: string}> {
        const message = await this.sendMessageInternal(content);
        const sentAt = new Date().toISOString();
        
        console.error(`[DEBUG] Message sent to channel ${this.config.textChannelId}`);
        
        return {
            messageId: message.id,
            channelId: this.config.textChannelId,
            sentAt
        };
    }

    /**
     * Discord Bot を停止
     * @returns Promise<void>
     */
    async stop(): Promise<void> {
        console.error("[INFO] Stopping Discord bot...");
        
        // クリーンアップ
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = undefined;
        }
        
        // 残っているタイムアウトをクリア
        for (const [messageId, resolver] of this.feedbackResolvers) {
            if (resolver.timeout) {
                clearTimeout(resolver.timeout);
            }
        }
        this.feedbackResolvers.clear();
        
        for (const [threadId, resolver] of this.threadResolvers) {
            if (resolver.timeout) {
                clearTimeout(resolver.timeout);
            }
        }
        this.threadResolvers.clear();
        
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

    /**
     * フィードバック付きメッセージを送信
     * @param content MessageCreateOptions（embedを含む）
     * @param feedbackPrompt フィードバックプロンプト
     * @param feedbackButtons カスタムフィードバックボタン
     * @param timeout タイムアウト時間（ミリ秒）
     * @returns フィードバック結果
     */
    async sendMessageWithFeedback(
        content: MessageCreateOptions,
        feedbackPrompt: string = "Please select:",
        feedbackButtons: FeedbackButton[] = [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" }
        ],
        timeout?: number
    ): Promise<{ response: string | 'timeout'; userId?: string; responseTime: number; messageId: string; channelId: string; sentAt: string }> {
        const startTime = Date.now();
        const timestamp = Date.now();
        
        // ボタンを作成（最大5個まで）
        const buttons = feedbackButtons.slice(0, 5).map(button => 
            new ButtonBuilder()
                .setCustomId(`feedback:${button.value}:${timestamp}`)
                .setLabel(button.label)
                .setStyle(ButtonStyle.Primary)
        );

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(buttons);

        const messageOptions: MessageCreateOptions = {
            ...content,
            content: feedbackPrompt,
            components: [row]
        };

        const message = await this.sendMessageInternal(messageOptions);
        const messageId = message.id;
        const sentAt = new Date().toISOString();

        return new Promise((resolve) => {
            const timeoutHandle = timeout ? setTimeout(() => {
                this.feedbackResolvers.delete(messageId);
                resolve({ 
                    response: 'timeout', 
                    responseTime: Date.now() - startTime,
                    messageId,
                    channelId: this.config.textChannelId,
                    sentAt
                });
            }, timeout) : undefined;

            this.feedbackResolvers.set(messageId, {
                resolve: (value) => {
                    if (timeoutHandle) clearTimeout(timeoutHandle);
                    this.feedbackResolvers.delete(messageId);
                    resolve({ 
                        ...value, 
                        responseTime: Date.now() - startTime,
                        messageId,
                        channelId: this.config.textChannelId,
                        sentAt
                    });
                },
                timeout: timeoutHandle,
                timestamp: Date.now()
            });
        });
    }

    /**
     * メッセージを送信してMessageオブジェクトを返す（内部メソッド）
     * @private
     * @param content 送信するメッセージ内容
     * @returns 送信されたMessage
     */
    private async sendMessageInternal(content: string | MessageCreateOptions): Promise<Message> {
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
            if ('send' in channel) {
                return await channel.send(content);
            } else {
                throw new Error("Channel does not support sending messages");
            }
        } catch (error) {
            console.error("[ERROR] Failed to send message:", error);
            throw error;
        }
    }

    /**
     * メッセージを送信してスレッドを開始
     * @param content 送信するメッセージ内容（Embed）
     * @param threadName スレッド名
     * @returns スレッド作成情報
     */
    async sendMessageWithThread(
        content: MessageCreateOptions,
        threadName: string
    ): Promise<{ messageId: string; threadId: string; channelId: string; sentAt: string }> {
        const sentAt = new Date().toISOString();
        
        // Embedメッセージを送信
        const message = await this.sendMessageInternal(content);
        const messageId = message.id;
        const channelId = message.channel.id;
        
        // スレッドを開始
        const thread = await message.startThread({
            name: threadName,
            autoArchiveDuration: 60 // 1時間後に自動アーカイブ
        });
        const threadId = thread.id;
        
        return {
            messageId,
            threadId,
            channelId,
            sentAt
        };
    }

    /**
     * スレッドに返信し、オプションでユーザーの応答を待機
     * @param threadId スレッドID
     * @param content 送信するメッセージ内容（Embed）
     * @param waitForReply 応答を待機するか（デフォルト: true）
     * @param timeout タイムアウトミリ秒
     * @returns 送信情報とオプションでユーザーの応答
     */
    async replyToThread(
        threadId: string,
        content: MessageCreateOptions,
        waitForReply: boolean = true,
        timeout?: number
    ): Promise<{ messageId: string; threadId: string; sentAt: string; userReply?: { message: string | 'timeout'; userId?: string; responseTime: number } }> {
        const startTime = Date.now();
        const sentAt = new Date().toISOString();
        
        // スレッドチャンネルを取得
        const thread = this.client.channels.cache.get(threadId);
        if (!thread || !thread.isThread()) {
            throw new Error("Thread not found or invalid thread ID");
        }
        
        // メッセージを送信
        const message = await thread.send(content);
        const messageId = message.id;
        
        // 応答を待機しない場合は即座に返す
        if (!waitForReply) {
            return {
                messageId,
                threadId,
                sentAt
            };
        }
        
        // 応答を待機する場合
        return new Promise((resolve) => {
            const timeoutMs = timeout || Number(process.env.DISCORD_FEEDBACK_TIMEOUT_SECONDS) * 1000 || 0;
            let timeoutHandle: NodeJS.Timeout | undefined;
            
            if (timeoutMs > 0) {
                timeoutHandle = setTimeout(() => {
                    this.threadResolvers.delete(threadId);
                    resolve({ 
                        messageId,
                        threadId,
                        sentAt,
                        userReply: {
                            message: 'timeout',
                            responseTime: Date.now() - startTime
                        }
                    });
                }, timeoutMs);
            }
            
            // resolverを登録
            this.threadResolvers.set(threadId, {
                resolve: (value) => {
                    if (timeoutHandle) clearTimeout(timeoutHandle);
                    this.threadResolvers.delete(threadId);
                    resolve({ 
                        messageId,
                        threadId,
                        sentAt,
                        userReply: {
                            message: value.message,
                            userId: value.userId,
                            responseTime: Date.now() - startTime
                        }
                    });
                },
                timeout: timeoutHandle,
                timestamp: Date.now()
            });
        });
    }

    /**
     * フィードバックインタラクションを処理
     * @private
     * @param interaction ButtonInteraction
     * @param value ボタンの値
     */
    private async handleFeedbackInteraction(
        interaction: ButtonInteraction,
        value: string
    ): Promise<void> {
        try {
            const resolver = this.feedbackResolvers.get(interaction.message.id);
            if (resolver) {
                resolver.resolve({ response: value, userId: interaction.user.id });
                
                await interaction.reply({
                    content: `✅ You Selected: **${value}**`,
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: '❌ This feedback session has expired.',
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error("[ERROR] Error handling feedback interaction:", error);
            await interaction.reply({
                content: 'An error occurred while processing your feedback.',
                ephemeral: true
            }).catch(() => {});
        }
    }

    /**
     * 古いfeedbackResolverとthreadResolverをクリーンアップ
     * @private
     */
    private cleanupOldResolvers(): void {
        const now = Date.now();
        const maxAge = 5 * 60 * 1000; // 5分以上古いものをクリーンアップ
        
        // feedbackResolversのクリーンアップ
        for (const [messageId, resolver] of this.feedbackResolvers) {
            if (now - resolver.timestamp > maxAge) {
                if (resolver.timeout) {
                    clearTimeout(resolver.timeout);
                }
                this.feedbackResolvers.delete(messageId);
                console.error(`[DEBUG] Cleaned up old feedback resolver for message ${messageId}`);
            }
        }
        
        // threadResolversのクリーンアップ
        for (const [threadId, resolver] of this.threadResolvers) {
            if (now - resolver.timestamp > maxAge) {
                if (resolver.timeout) {
                    clearTimeout(resolver.timeout);
                }
                this.threadResolvers.delete(threadId);
                console.error(`[DEBUG] Cleaned up old thread resolver for thread ${threadId}`);
            }
        }
    }
}