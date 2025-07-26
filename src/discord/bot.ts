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
    private feedbackResolvers: Map<string, {
        resolve: (value: { response: 'yes' | 'no'; userId: string }) => void;
        timeout?: NodeJS.Timeout;
    }> = new Map();

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

        this.client.on(Events.InteractionCreate, async (interaction) => {
            if (!interaction.isButton()) return;
            
            const buttonInteraction = interaction as ButtonInteraction;
            const [action, messageId = ''] = buttonInteraction.customId.split(':');
            
            if (action === 'feedback_yes' || action === 'feedback_no') {
                await this.handleFeedbackInteraction(buttonInteraction, action, messageId);
            }
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

    /**
     * フィードバック付きメッセージを送信
     * @param content MessageCreateOptions（embedを含む）
     * @param feedbackPrompt フィードバックプロンプト
     * @param timeout タイムアウト時間（ミリ秒）
     * @returns フィードバック結果
     */
    async sendMessageWithFeedback(
        content: MessageCreateOptions,
        feedbackPrompt: string = "Please select:",
        timeout?: number
    ): Promise<{ response: 'yes' | 'no' | 'timeout'; userId?: string; responseTime?: number }> {
        const startTime = Date.now();
        
        const yesButton = new ButtonBuilder()
            .setCustomId(`feedback_yes:${Date.now()}`)
            .setLabel('Yes')
            .setStyle(ButtonStyle.Success);

        const noButton = new ButtonBuilder()
            .setCustomId(`feedback_no:${Date.now()}`)
            .setLabel('No')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(yesButton, noButton);

        const messageOptions: MessageCreateOptions = {
            ...content,
            content: feedbackPrompt,
            components: [row]
        };

        const message = await this.sendMessageAndGetMessage(messageOptions);
        const messageId = message.id;

        return new Promise((resolve) => {
            const timeoutHandle = timeout ? setTimeout(() => {
                this.feedbackResolvers.delete(messageId);
                resolve({ response: 'timeout', responseTime: Date.now() - startTime });
            }, timeout) : undefined;

            this.feedbackResolvers.set(messageId, {
                resolve: (value) => {
                    if (timeoutHandle) clearTimeout(timeoutHandle);
                    this.feedbackResolvers.delete(messageId);
                    resolve({ ...value, responseTime: Date.now() - startTime });
                },
                timeout: timeoutHandle
            });
        });
    }

    /**
     * メッセージを送信してMessageオブジェクトを返す
     * @private
     * @param content 送信するメッセージ内容
     * @returns 送信されたMessage
     */
    private async sendMessageAndGetMessage(content: string | MessageCreateOptions): Promise<Message> {
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
            logger.error("Failed to send message:", error);
            throw error;
        }
    }

    /**
     * フィードバックインタラクションを処理
     * @private
     * @param interaction ButtonInteraction
     * @param action 'feedback_yes' または 'feedback_no'
     * @param messageId メッセージID
     */
    private async handleFeedbackInteraction(
        interaction: ButtonInteraction,
        action: string,
        messageId: string
    ): Promise<void> {
        try {
            const resolver = this.feedbackResolvers.get(interaction.message.id);
            if (resolver) {
                const response = action === 'feedback_yes' ? 'yes' : 'no';
                resolver.resolve({ response, userId: interaction.user.id });
                
                await interaction.reply({
                    content: `Thank you for your feedback! You selected: ${response}`,
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: 'This feedback session has expired.',
                    ephemeral: true
                });
            }
        } catch (error) {
            logger.error("Error handling feedback interaction:", error);
            await interaction.reply({
                content: 'An error occurred while processing your feedback.',
                ephemeral: true
            }).catch(() => {});
        }
    }
}