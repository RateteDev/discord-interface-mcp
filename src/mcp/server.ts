import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    type Tool,
    type CallToolResult
} from "@modelcontextprotocol/sdk/types.js";
import { logger } from "../utils/logger";
import { env } from "../utils/env";
import type { DiscordBot } from "../discord/bot";
import type { 
    DiscordMessageResponse, 
    DiscordFeedbackResponse 
} from "../types/mcp";
import { 
    SendDiscordEmbedArgsSchema,
    SendDiscordEmbedWithFeedbackArgsSchema,
    ColorNameSchema
} from "../validation/schemas";

/**
 * MCP サーバークラス
 * @description Discord へのメッセージ送信ツールを提供する MCP サーバー
 */
export class MCPServer {
    private server: Server;
    private discordBot: DiscordBot;

    /**
     * コンストラクタ
     * @param discordBot Discord Bot インスタンス
     */
    constructor(discordBot: DiscordBot) {
        this.discordBot = discordBot;
        this.server = new Server(
            {
                name: "discord-interface-mcp",
                version: "0.1.0"
            },
            {
                capabilities: {
                    tools: {}
                }
            }
        );

        this.setupHandlers();
    }

    /**
     * ハンドラーの設定
     * @private
     */
    private setupHandlers(): void {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return this.listTools();
        });

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            return this.callTool(request.params.name, request.params.arguments || {});
        });

        this.server.onerror = (error) => {
            logger.error("MCP Server error:", error);
        };
    }

    /**
     * 利用可能なツールのリストを返す
     * @private
     * @returns ツールリスト
     */
    private async listTools(): Promise<{ tools: Tool[] }> {
        return {
            tools: [
                {
                    name: "send_discord_embed",
                    description: "Send a rich embed message to Discord channel",
                    inputSchema: {
                        type: "object",
                        properties: {
                            title: {
                                type: "string",
                                description: "The title of the embed"
                            },
                            description: {
                                type: "string",
                                description: "The description of the embed"
                            },
                            color: {
                                type: "string",
                                description: "The color of the embed (CSS basic 16 color names)",
                                enum: ["black", "silver", "gray", "white", "maroon", "red", "purple", "fuchsia", "green", "lime", "olive", "yellow", "navy", "blue", "teal", "aqua"]
                            },
                            fields: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" },
                                        value: { type: "string" },
                                        inline: { type: "boolean" }
                                    },
                                    required: ["name", "value"]
                                },
                                description: "Array of embed fields"
                            }
                        },
                        required: []
                    }
                },
                {
                    name: "send_discord_embed_with_feedback",
                    description: "Send an embed message with customizable feedback buttons and wait for user response",
                    inputSchema: {
                        type: "object",
                        properties: {
                            title: {
                                type: "string",
                                description: "The title of the embed"
                            },
                            description: {
                                type: "string",
                                description: "The description of the embed"
                            },
                            color: {
                                type: "string",
                                description: "The color of the embed (CSS basic 16 color names)",
                                enum: ["black", "silver", "gray", "white", "maroon", "red", "purple", "fuchsia", "green", "lime", "olive", "yellow", "navy", "blue", "teal", "aqua"]
                            },
                            fields: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" },
                                        value: { type: "string" },
                                        inline: { type: "boolean" }
                                    },
                                    required: ["name", "value"]
                                },
                                description: "Array of embed fields"
                            },
                            feedbackPrompt: {
                                type: "string",
                                description: "The prompt text above the buttons",
                                default: "Please select:"
                            },
                            feedbackButtons: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        label: { 
                                            type: "string",
                                            description: "Button display text (1-80 characters)"
                                        },
                                        value: { 
                                            type: "string",
                                            description: "Button response value (1-100 characters, supports unicode including Japanese, Chinese, etc.)"
                                        }
                                    },
                                    required: ["label", "value"]
                                },
                                description: "Custom feedback buttons (1-5 buttons, defaults to Yes/No)",
                                maxItems: 5,
                                minItems: 1
                            }
                        },
                        required: []
                    }
                }
            ]
        };
    }

    /**
     * ツールを実行
     * @private
     * @param name ツール名
     * @param args ツールの引数
     * @returns ツールの実行結果
     */
    private async callTool(name: string, args: unknown): Promise<CallToolResult> {
        if (!this.discordBot.getIsReady()) {
            throw new Error("Discord bot is not ready");
        }

        switch (name) {
            case "send_discord_embed":
                return this.sendDiscordEmbed(args);
            
            case "send_discord_embed_with_feedback":
                return this.sendDiscordEmbedWithFeedback(args);
            
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }

    /**
     * Discord に Embed メッセージを送信
     * @private
     * @param args Embed 送信引数
     * @returns 送信結果
     */
    private async sendDiscordEmbed(args: unknown): Promise<CallToolResult> {
        try {
            // Zodバリデーション
            const validatedArgs = SendDiscordEmbedArgsSchema.parse(args);
            
            const embed: {
                title?: string;
                description?: string;
                color?: number;
                fields?: Array<{ name: string; value: string; inline?: boolean }>;
            } = {};
            
            if (validatedArgs.title) embed.title = validatedArgs.title;
            if (validatedArgs.description) embed.description = validatedArgs.description;
            if (validatedArgs.color !== undefined) embed.color = validatedArgs.color;
            if (validatedArgs.fields) embed.fields = validatedArgs.fields;

            const messageInfo = await this.discordBot.sendMessage({
                embeds: [embed]
            });
            
            logger.info("Sent embed message to Discord");
            
            const response: DiscordMessageResponse = {
                sentAt: messageInfo.sentAt,
                messageId: messageInfo.messageId,
                channelId: messageInfo.channelId,
                status: "success"
            };
            
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(response, null, 2)
                    }
                ]
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to send message to Discord: ${errorMessage}`);
        }
    }

    /**
     * Discord にフィードバック付き Embed メッセージを送信
     * @private
     * @param args フィードバック付き Embed 送信引数
     * @returns 送信結果とフィードバック
     */
    private async sendDiscordEmbedWithFeedback(args: unknown): Promise<CallToolResult> {
        try {
            // Zodバリデーション
            const validatedArgs = SendDiscordEmbedWithFeedbackArgsSchema.parse(args);
            
            const embed: {
                title?: string;
                description?: string;
                color?: number;
                fields?: Array<{ name: string; value: string; inline?: boolean }>;
            } = {};
            
            if (validatedArgs.title) embed.title = validatedArgs.title;
            if (validatedArgs.description) embed.description = validatedArgs.description;
            if (validatedArgs.color !== undefined) embed.color = validatedArgs.color;
            if (validatedArgs.fields) embed.fields = validatedArgs.fields;

            const feedbackPrompt = validatedArgs.feedbackPrompt || "Please select:";
            const feedbackButtons = validatedArgs.feedbackButtons;
            const timeoutSeconds = env.DISCORD_FEEDBACK_TIMEOUT_SECONDS;
            const timeoutMs = timeoutSeconds ? timeoutSeconds * 1000 : undefined;

            const feedbackResult = await this.discordBot.sendMessageWithFeedback(
                { embeds: [embed] },
                feedbackPrompt,
                feedbackButtons,
                timeoutMs
            );
            
            logger.info(`Sent embed with feedback to Discord. Response: ${feedbackResult.response}`);
            
            const response: DiscordFeedbackResponse = {
                sentAt: feedbackResult.sentAt!,
                messageId: feedbackResult.messageId!,
                channelId: feedbackResult.channelId!,
                status: "success",
                feedback: {
                    response: feedbackResult.response,
                    userId: feedbackResult.userId,
                    responseTime: feedbackResult.responseTime
                }
            };
            
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(response, null, 2)
                    }
                ]
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to send message to Discord: ${errorMessage}`);
        }
    }

    /**
     * MCP サーバーを開始
     * @returns Promise<void>
     */
    async start(): Promise<void> {
        logger.info("Starting MCP server...");
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        logger.info("MCP server started");
    }

    /**
     * MCP サーバーを停止
     * @returns Promise<void>
     */
    async stop(): Promise<void> {
        logger.info("Stopping MCP server...");
        await this.server.close();
        logger.info("MCP server stopped");
    }
}