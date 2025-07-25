import { describe, expect, it, beforeEach, afterEach, mock } from "bun:test";
import { MCPServer } from "../../src/mcp/server";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { DiscordBot } from "../../src/discord/bot";

describe("MCPServer", () => {
    let mcpServer: MCPServer;
    let mockDiscordBot: DiscordBot;
    let mockServer: Server;

    beforeEach(() => {
        mockDiscordBot = {
            sendMessage: mock(() => Promise.resolve()),
            getIsReady: mock(() => true),
            start: mock(() => Promise.resolve()),
            stop: mock(() => Promise.resolve())
        } as any;

        mockServer = {
            setRequestHandler: mock(() => {}),
            close: mock(() => Promise.resolve()),
            onerror: undefined,
            onclose: undefined
        } as any;

        mcpServer = new MCPServer(mockDiscordBot);
        (mcpServer as any).server = mockServer;
    });

    afterEach(() => {
        if (mcpServer) {
            mcpServer.stop();
        }
    });

    describe("初期化", () => {
        it("正しくインスタンスが作成される", () => {
            expect(mcpServer).toBeDefined();
            expect((mcpServer as any).discordBot).toBe(mockDiscordBot);
        });
    });

    describe("setupHandlers", () => {
        it("必要なハンドラーが設定される", () => {
            (mcpServer as any).setupHandlers();
            
            expect(mockServer.setRequestHandler).toHaveBeenCalledTimes(2);
            expect(mockServer.setRequestHandler).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Function)
            );
        });
    });

    describe("listTools", () => {
        it("利用可能なツールのリストを返す", async () => {
            const tools = await (mcpServer as any).listTools();
            
            expect(tools).toEqual({
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
            });
        });
    });

    describe("callTool", () => {
        describe("send_discord_message", () => {
            it("Discord にメッセージを送信する", async () => {
                const result = await (mcpServer as any).callTool("send_discord_message", {
                    content: "Hello from MCP!"
                });

                expect(mockDiscordBot.sendMessage).toHaveBeenCalledWith("Hello from MCP!");
                expect(result).toEqual({
                    content: [
                        {
                            type: "text",
                            text: "Message sent to Discord successfully"
                        }
                    ]
                });
            });

            it("content パラメータが無い場合はエラーを返す", async () => {
                await expect(
                    (mcpServer as any).callTool("send_discord_message", {})
                ).rejects.toThrow("Missing required parameter: content");
            });
        });

        describe("send_discord_embed", () => {
            it("Discord にEmbedメッセージを送信する", async () => {
                const embedData = {
                    title: "Test Embed",
                    description: "This is a test",
                    color: 0x0099ff,
                    fields: [
                        { name: "Field 1", value: "Value 1", inline: true }
                    ]
                };

                const result = await (mcpServer as any).callTool("send_discord_embed", embedData);

                expect(mockDiscordBot.sendMessage).toHaveBeenCalledWith({
                    embeds: [{
                        title: "Test Embed",
                        description: "This is a test",
                        color: 0x0099ff,
                        fields: [
                            { name: "Field 1", value: "Value 1", inline: true }
                        ]
                    }]
                });

                expect(result).toEqual({
                    content: [
                        {
                            type: "text",
                            text: "Embed message sent to Discord successfully"
                        }
                    ]
                });
            });

            it("空のEmbedでも送信できる", async () => {
                const result = await (mcpServer as any).callTool("send_discord_embed", {});

                expect(mockDiscordBot.sendMessage).toHaveBeenCalledWith({
                    embeds: [{}]
                });

                expect(result).toEqual({
                    content: [
                        {
                            type: "text",
                            text: "Embed message sent to Discord successfully"
                        }
                    ]
                });
            });
        });

        it("存在しないツールの場合はエラーを返す", async () => {
            await expect(
                (mcpServer as any).callTool("unknown_tool", {})
            ).rejects.toThrow("Unknown tool: unknown_tool");
        });

        it("Discord Bot が準備できていない場合はエラーを返す", async () => {
            mockDiscordBot.getIsReady = mock(() => false);

            await expect(
                (mcpServer as any).callTool("send_discord_message", { content: "test" })
            ).rejects.toThrow("Discord bot is not ready");
        });
    });

    describe("エラーハンドリング", () => {
        it("Discord 送信エラーを適切に処理する", async () => {
            mockDiscordBot.sendMessage = mock(() => Promise.reject(new Error("Discord error")));

            await expect(
                (mcpServer as any).callTool("send_discord_message", { content: "test" })
            ).rejects.toThrow("Failed to send message to Discord: Discord error");
        });
    });
});