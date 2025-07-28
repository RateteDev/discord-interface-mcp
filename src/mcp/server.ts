import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    type Tool,
    type CallToolResult
} from "@modelcontextprotocol/sdk/types.js";
import { env } from "../utils/env";
import type { DiscordBot } from "../discord/bot";
import {
    SendTextChannelMessageArgsSchema,
    CreateThreadArgsSchema,
    SendThreadMessageArgsSchema
} from "../validation/schemas";
import type {
    TextChannelMessageResponse,
    CreateThreadResponse,
    SendThreadMessageResponse,
    ThreadMessageTextResponse,
    ThreadMessageButtonResponse
} from "../types/mcp";

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
            console.error("[ERROR] MCP Server error:", error);
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
                    name: "send_textchannel_message",
                    description: "Send a message to text channel without waiting for response",
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
                    name: "create_thread",
                    description: "Create a new thread with an initial message",
                    inputSchema: {
                        type: "object",
                        properties: {
                            threadName: {
                                type: "string",
                                description: "Name of the thread to create (1-100 characters)"
                            },
                            initialMessage: {
                                type: "object",
                                properties: {
                                    title: {
                                        type: "string",
                                        description: "The title of the initial message embed"
                                    },
                                    description: {
                                        type: "string",
                                        description: "The description of the initial message embed"
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
                                description: "Initial message to send when creating the thread"
                            }
                        },
                        required: ["threadName", "initialMessage"]
                    }
                },
                {
                    name: "send_thread_message",
                    description: "Send a message to a thread with optional wait for text or button response",
                    inputSchema: {
                        type: "object",
                        properties: {
                            threadId: {
                                type: "string",
                                description: "The ID of the thread to send message to"
                            },
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
                            waitForResponse: {
                                type: "object",
                                properties: {
                                    type: {
                                        type: "string",
                                        enum: ["text", "button"],
                                        description: "Type of response to wait for"
                                    },
                                    buttons: {
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
                                                    description: "Button response value (1-100 characters)"
                                                }
                                            },
                                            required: ["label", "value"]
                                        },
                                        description: "Buttons to show when type is 'button' (1-5 buttons)"
                                    }
                                },
                                description: "Configuration for waiting for user response"
                            }
                        },
                        required: ["threadId"]
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
            case "send_textchannel_message":
                return this.sendTextChannelMessage(args);
            
            case "create_thread":
                return this.createThread(args);
            
            case "send_thread_message":
                return this.sendThreadMessage(args);
            
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }


    /**
     * テキストチャンネルにメッセージを送信（新API）
     * @private
     * @param args メッセージ送信引数
     * @returns 送信結果
     */
    private async sendTextChannelMessage(args: unknown): Promise<CallToolResult> {
        try {
            // Zodバリデーション
            const validatedArgs = SendTextChannelMessageArgsSchema.parse(args);
            
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

            const result = await this.discordBot.sendTextChannelMessage({
                embeds: [embed]
            });
            
            console.error("[INFO] Sent message to text channel");
            
            const response: TextChannelMessageResponse = {
                sentAt: result.sentAt,
                messageId: result.messageId,
                channelId: result.channelId,
                status: result.status
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
            throw new Error(`Failed to send message to text channel: ${errorMessage}`);
        }
    }

    /**
     * スレッドを作成（新API）
     * @private
     * @param args スレッド作成引数
     * @returns 作成結果
     */
    private async createThread(args: unknown): Promise<CallToolResult> {
        try {
            // Zodバリデーション
            const validatedArgs = CreateThreadArgsSchema.parse(args);
            
            const embed: {
                title?: string;
                description?: string;
                color?: number;
                fields?: Array<{ name: string; value: string; inline?: boolean }>;
            } = {};
            
            if (validatedArgs.initialMessage.title) embed.title = validatedArgs.initialMessage.title;
            if (validatedArgs.initialMessage.description) embed.description = validatedArgs.initialMessage.description;
            if (validatedArgs.initialMessage.color !== undefined) embed.color = validatedArgs.initialMessage.color;
            if (validatedArgs.initialMessage.fields) embed.fields = validatedArgs.initialMessage.fields;

            const result = await this.discordBot.createThread(
                validatedArgs.threadName,
                { embeds: [embed] }
            );
            
            console.error(`[INFO] Created thread: ${result.threadId}`);
            
            const response: CreateThreadResponse = {
                sentAt: result.sentAt,
                messageId: result.messageId,
                channelId: result.channelId,
                threadId: result.threadId,
                status: result.status
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
            throw new Error(`Failed to create thread: ${errorMessage}`);
        }
    }

    /**
     * スレッドにメッセージを送信（新API）
     * @private
     * @param args メッセージ送信引数
     * @returns 送信結果
     */
    private async sendThreadMessage(args: unknown): Promise<CallToolResult> {
        try {
            // Zodバリデーション
            const validatedArgs = SendThreadMessageArgsSchema.parse(args);
            
            const embed: {
                title?: string;
                description?: string;
                color?: number;
                fields?: Array<{ name: string; value: string; inline?: boolean }>;
                footer?: { text: string };
                timestamp?: string;
            } = {};
            
            if (validatedArgs.title) embed.title = validatedArgs.title;
            if (validatedArgs.description) embed.description = validatedArgs.description;
            
            // 応答待ちの場合の装飾
            if (validatedArgs.waitForResponse) {
                // 色が指定されていない場合は青色をデフォルトに
                embed.color = validatedArgs.color !== undefined ? validatedArgs.color : 0x0099FF;
                
                if (validatedArgs.waitForResponse.type === "text") {
                    embed.footer = { text: "💬 返信をお待ちしています..." };
                } else if (validatedArgs.waitForResponse.type === "button") {
                    embed.footer = { text: "👆 選択してください" };
                }
                embed.timestamp = new Date().toISOString();
            } else {
                // 返信不要の場合は通常の色
                if (validatedArgs.color !== undefined) embed.color = validatedArgs.color;
            }
            
            if (validatedArgs.fields) embed.fields = validatedArgs.fields;

            const timeoutSeconds = env.DISCORD_FEEDBACK_TIMEOUT_SECONDS;
            const timeoutMs = timeoutSeconds ? timeoutSeconds * 1000 : undefined;

            const result = await this.discordBot.sendThreadMessage(
                validatedArgs.threadId,
                { embeds: [embed] },
                validatedArgs.waitForResponse,
                timeoutMs
            );
            
            console.error(`[INFO] Sent message to thread ${validatedArgs.threadId}. Wait for response: ${validatedArgs.waitForResponse?.type || 'none'}`);
            
            let response: SendThreadMessageResponse;
            
            if (!validatedArgs.waitForResponse) {
                response = {
                    sentAt: result.sentAt,
                    messageId: result.messageId,
                    threadId: validatedArgs.threadId,
                    status: result.status
                };
            } else if (result.response && result.response.type === "text") {
                response = {
                    sentAt: result.sentAt,
                    messageId: result.messageId,
                    threadId: validatedArgs.threadId,
                    status: result.status,
                    response: result.response
                } as ThreadMessageTextResponse;
            } else if (result.response && result.response.type === "button") {
                response = {
                    sentAt: result.sentAt,
                    messageId: result.messageId,
                    threadId: validatedArgs.threadId,
                    status: result.status,
                    response: result.response
                } as ThreadMessageButtonResponse;
            } else {
                throw new Error("Unexpected response format");
            }
            
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
            throw new Error(`Failed to send message to thread: ${errorMessage}`);
        }
    }

    /**
     * MCP サーバーを開始
     * @returns Promise<void>
     */
    async start(): Promise<void> {
        console.error("[INFO] Starting MCP server...");
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("[INFO] MCP server started");
    }

    /**
     * MCP サーバーを停止
     * @returns Promise<void>
     */
    async stop(): Promise<void> {
        console.error("[INFO] Stopping MCP server...");
        await this.server.close();
        console.error("[INFO] MCP server stopped");
    }
}