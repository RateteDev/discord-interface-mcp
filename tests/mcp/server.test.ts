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
            
            expect(tools.tools).toHaveLength(3);
            expect(tools.tools.find((t: any) => t.name === "send_discord_message")).toBeDefined();
            expect(tools.tools.find((t: any) => t.name === "send_discord_embed")).toBeDefined();
            expect(tools.tools.find((t: any) => t.name === "send_discord_embed_with_feedback")).toBeDefined();
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

        describe("send_discord_embed_with_feedback", () => {
            it("Discord にフィードバック付きEmbedメッセージを送信する", async () => {
                // モック設定
                mockDiscordBot.sendMessageWithFeedback = mock(() => Promise.resolve({
                    response: 'yes',
                    userId: 'test-user-123',
                    responseTime: 1500
                }));

                const embedData = {
                    title: "Feedback Test",
                    description: "Please provide feedback",
                    color: 0xff0000,
                    feedbackPrompt: "Do you agree?"
                };

                const result = await (mcpServer as any).callTool("send_discord_embed_with_feedback", embedData);

                expect(mockDiscordBot.sendMessageWithFeedback).toHaveBeenCalledWith(
                    {
                        embeds: [{
                            title: "Feedback Test",
                            description: "Please provide feedback",
                            color: 0xff0000
                        }]
                    },
                    "Do you agree?",
                    undefined
                );

                const parsedResult = JSON.parse(result.content[0].text);
                expect(parsedResult.message).toBe("Embed message sent and feedback received");
                expect(parsedResult.feedback).toEqual({
                    response: 'yes',
                    userId: 'test-user-123',
                    responseTime: 1500
                });
            });

            it("タイムアウトを処理できる", async () => {
                // 環境変数のモック
                const originalTimeout = process.env.DISCORD_FEEDBACK_TIMEOUT;
                process.env.DISCORD_FEEDBACK_TIMEOUT = "5000";

                // 新しい MCPServer インスタンスを作成して環境変数を反映
                const newMcpServer = new MCPServer(mockDiscordBot);
                (newMcpServer as any).server = mockServer;

                mockDiscordBot.sendMessageWithFeedback = mock(() => Promise.resolve({
                    response: 'timeout',
                    responseTime: 5000
                }));

                const result = await (newMcpServer as any).callTool("send_discord_embed_with_feedback", {
                    title: "Timeout Test"
                });

                const parsedResult = JSON.parse(result.content[0].text);
                expect(parsedResult.feedback.response).toBe('timeout');

                // 環境変数を元に戻す
                if (originalTimeout !== undefined) {
                    process.env.DISCORD_FEEDBACK_TIMEOUT = originalTimeout;
                } else {
                    delete process.env.DISCORD_FEEDBACK_TIMEOUT;
                }
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