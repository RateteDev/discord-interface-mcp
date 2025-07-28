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
import type { Button as FeedbackButton } from "../types/mcp";
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
    /** アクセス制御用のロールID（オプション） */
    allowedRoleId?: string;
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
                GatewayIntentBits.GuildMembers,
            ],
        });
    }
    /**
     * ユーザーの権限をチェック
     * @description 設定されたロールIDを持つユーザーかどうかを確認
     * @param userId ユーザーID
     * @returns 権限があるかどうか
     * @private
     */
    private async checkUserPermission(userId: string): Promise<boolean> {
        // ロールベースアクセス制御が設定されていない場合は全許可
        if (!this.config.allowedRoleId) {
            return true;
        }

        try {
            const guild = this.client.guilds.cache.get(this.config.guildId);
            if (!guild) {
                console.error("[ERROR] Guild not found for permission check");
                return false;
            }

            const member = await guild.members.fetch(userId);
            if (!member) {
                console.error("[ERROR] Member not found for permission check");
                return false;
            }

            return member.roles.cache.has(this.config.allowedRoleId);
        } catch (error) {
            console.error("[ERROR] Error checking user permission:", error);
            return false;
        }
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
            
            // 全操作に対して権限チェックを実行
            const hasPermission = await this.checkUserPermission(buttonInteraction.user.id);
            if (!hasPermission) {
                await buttonInteraction.reply({
                    content: '❌ この操作を実行する権限がありません。必要なロールが設定されていることを確認してください。',
                    ephemeral: true
                });
                return;
            }
            
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
            
            // 全操作に対して権限チェックを実行
            const hasPermission = await this.checkUserPermission(message.author.id);
            if (!hasPermission) {
                try {
                    await message.reply('❌ この操作を実行する権限がありません。必要なロールが設定されていることを確認してください。');
                } catch (error) {
                    console.error('[ERROR] Failed to send permission denied message:', error);
                }
                return;
            }
            
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
    /**
     * テキストチャンネルにメッセージを送信
     * @param content MessageCreateOptions（embedを含む）
     * @returns 送信情報
     */
    async sendTextChannelMessage(
        content: MessageCreateOptions
    ): Promise<{ messageId: string; channelId: string; sentAt: string; status: "success" }> {
        const sentAt = new Date().toISOString();
        const message = await this.sendMessageInternal(content);
        
        return {
            messageId: message.id,
            channelId: this.config.textChannelId,
            sentAt,
            status: "success"
        };
    }
    /**
     * スレッドを作成
     * @param threadName スレッド名
     * @param initialMessage 初期メッセージ
     * @returns スレッド作成情報
     */
    async createThread(
        threadName: string,
        initialMessage: MessageCreateOptions
    ): Promise<{ messageId: string; channelId: string; threadId: string; sentAt: string; status: "success" }> {
        const sentAt = new Date().toISOString();
        
        // Embedメッセージを送信
        const message = await this.sendMessageInternal(initialMessage);
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
            channelId,
            threadId,
            sentAt,
            status: "success"
        };
    }
    /**
     * スレッドにメッセージを送信
     * @param threadId スレッドID
     * @param content メッセージ内容
     * @param waitForResponse 応答待機設定
     * @param timeout タイムアウトミリ秒
     * @returns 送信情報と応答（該当する場合）
     */
    async sendThreadMessage(
        threadId: string,
        content: MessageCreateOptions,
        waitForResponse?: { type: "text" | "button"; buttons?: FeedbackButton[] },
        timeout?: number
    ): Promise<any> {
        const sentAt = new Date().toISOString();
        const startTime = Date.now();
        
        const thread = this.client.channels.cache.get(threadId);
        if (!thread || !thread.isThread()) {
            throw new Error("Thread not found");
        }
        // 応答を待機しない場合
        if (!waitForResponse) {
            const message = await thread.send(content);
            return {
                messageId: message.id,
                threadId,
                sentAt,
                status: "success"
            };
        }
        // テキスト応答を待機する場合
        if (waitForResponse.type === "text") {
            const message = await thread.send(content);
            const messageId = message.id;
            return new Promise((resolve) => {
                const timeoutHandle = timeout ? setTimeout(() => {
                    this.threadResolvers.delete(threadId);
                    resolve({
                        messageId,
                        threadId,
                        sentAt,
                        status: "success",
                        response: {
                            type: "text",
                            text: "timeout",
                            responseTime: Date.now() - startTime
                        }
                    });
                }, timeout) : undefined;
                this.threadResolvers.set(threadId, {
                    resolve: (value) => {
                        if (timeoutHandle) clearTimeout(timeoutHandle);
                        this.threadResolvers.delete(threadId);
                        resolve({
                            messageId,
                            threadId,
                            sentAt,
                            status: "success",
                            response: {
                                type: "text",
                                text: value.message,
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
        // ボタン応答を待機する場合
        if (waitForResponse.type === "button" && waitForResponse.buttons) {
            const timestamp = Date.now();
            
            // ボタンを作成（最大5個まで）
            const buttons = waitForResponse.buttons.slice(0, 5).map(button => 
                new ButtonBuilder()
                    .setCustomId(`feedback:${button.value}:${timestamp}`)
                    .setLabel(button.label)
                    .setStyle(ButtonStyle.Primary)
            );
            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(buttons);
            const messageOptions: MessageCreateOptions = {
                ...content,
                components: [row]
            };
            const message = await thread.send(messageOptions);
            const messageId = message.id;
            
            // 🔧 FIX: Promiseを作成してからresolverを即座に登録
            return new Promise((resolve) => {
                const timeoutHandle = timeout ? setTimeout(() => {
                    this.feedbackResolvers.delete(messageId);
                    resolve({
                        messageId,
                        threadId,
                        sentAt,
                        status: "success",
                        response: {
                            type: "button",
                            value: "timeout",
                            responseTime: Date.now() - startTime
                        }
                    });
                }, timeout) : undefined;
                
                // 🔧 FIX: メッセージ送信直後にresolverを登録してタイミング競合を回避
                this.feedbackResolvers.set(messageId, {
                    resolve: (value) => {
                        if (timeoutHandle) clearTimeout(timeoutHandle);
                        this.feedbackResolvers.delete(messageId);
                        resolve({
                            messageId,
                            threadId,
                            sentAt,
                            status: "success",
                            response: {
                                type: "button",
                                value: value.response,
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
        throw new Error("Invalid waitForResponse configuration");
    }
}