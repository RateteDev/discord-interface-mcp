import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    type Tool,
    type CallToolResult
} from "@modelcontextprotocol/sdk/types.js";
import { logger } from "../utils/logger";
import type { DiscordBot } from "../discord/bot";
import type { SendDiscordMessageArgs, SendDiscordEmbedArgs } from "../types/mcp";

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
                    name: "send_discord_message",
                    description: "Send a message to Discord channel",
                    inputSchema: {
                        type: "object",
                        properties: {
                            content: {
                                type: "string",
                                description: "The message content to send"
                            }
                        },
                        required: ["content"]
                    }
                },
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
                                type: "number",
                                description: "The color of the embed (in decimal)"
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
            case "send_discord_message":
                return this.sendDiscordMessage(args);
            
            case "send_discord_embed":
                return this.sendDiscordEmbed(args);
            
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }

    /**
     * Discord にテキストメッセージを送信
     * @private
     * @param args メッセージ送信引数
     * @returns 送信結果
     */
    private async sendDiscordMessage(args: unknown): Promise<CallToolResult> {
        const typedArgs = args as SendDiscordMessageArgs;
        if (!typedArgs.content) {
            throw new Error("Missing required parameter: content");
        }

        try {
            await this.discordBot.sendMessage(typedArgs.content);
            logger.info(`Sent message to Discord: ${typedArgs.content}`);
            
            return {
                content: [
                    {
                        type: "text",
                        text: "Message sent to Discord successfully"
                    }
                ]
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to send message to Discord: ${errorMessage}`);
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
            const typedArgs = args as SendDiscordEmbedArgs;
            const embed: {
                title?: string;
                description?: string;
                color?: number;
                fields?: Array<{ name: string; value: string; inline?: boolean }>;
            } = {};
            
            if (typedArgs.title) embed.title = typedArgs.title;
            if (typedArgs.description) embed.description = typedArgs.description;
            if (typedArgs.color !== undefined) embed.color = typedArgs.color;
            if (typedArgs.fields) embed.fields = typedArgs.fields;

            await this.discordBot.sendMessage({
                embeds: [embed]
            });
            
            logger.info("Sent embed message to Discord");
            
            return {
                content: [
                    {
                        type: "text",
                        text: "Embed message sent to Discord successfully"
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