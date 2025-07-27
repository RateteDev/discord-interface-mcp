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
            sendMessage: mock(() => Promise.resolve({
                messageId: "test-message-123",
                channelId: "test-channel-456",
                sentAt: "2023-01-01T00:00:00.000Z"
            })),
            sendMessageWithFeedback: mock(() => Promise.resolve({
                response: 'yes',
                userId: 'test-user-123',
                responseTime: 1500,
                messageId: "test-message-123",
                channelId: "test-channel-456",
                sentAt: "2023-01-01T00:00:00.000Z"
            })),
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
            
            expect(tools.tools).toHaveLength(2);
            expect(tools.tools.find((t: any) => t.name === "send_discord_embed")).toBeDefined();
            expect(tools.tools.find((t: any) => t.name === "send_discord_embed_with_feedback")).toBeDefined();
        });
    });

    describe("callTool", () => {
        describe("send_discord_embed", () => {
            it("Discord にEmbedメッセージを送信する（色名使用）", async () => {
                const embedData = {
                    title: "Test Embed",
                    description: "This is a test",
                    color: "blue",
                    fields: [
                        { name: "Field 1", value: "Value 1", inline: true }
                    ]
                };

                const result = await (mcpServer as any).callTool("send_discord_embed", embedData);

                expect(mockDiscordBot.sendMessage).toHaveBeenCalledWith({
                    embeds: [{
                        title: "Test Embed",
                        description: "This is a test",
                        color: 0x0000FF, // blue
                        fields: [
                            { name: "Field 1", value: "Value 1", inline: true }
                        ]
                    }]
                });

                const parsedResult = JSON.parse(result.content[0].text);
                expect(parsedResult.status).toBe("success");
                expect(parsedResult.messageId).toBe("test-message-123");
                expect(parsedResult.channelId).toBe("test-channel-456");
            });

            it("空のEmbedでも送信できる", async () => {
                const result = await (mcpServer as any).callTool("send_discord_embed", {});

                expect(mockDiscordBot.sendMessage).toHaveBeenCalledWith({
                    embeds: [{}]
                });

                const parsedResult = JSON.parse(result.content[0].text);
                expect(parsedResult.status).toBe("success");
            });

            it("無効な色名を拒否する", async () => {
                const embedData = {
                    title: "Test",
                    color: "orange" // 無効な色名
                };

                await expect(
                    (mcpServer as any).callTool("send_discord_embed", embedData)
                ).rejects.toThrow();
            });
        });

        describe("send_discord_embed_with_feedback", () => {
            it("Discord にフィードバック付きEmbedメッセージを送信する（デフォルトボタン）", async () => {
                const embedData = {
                    title: "Feedback Test",
                    description: "Please provide feedback",
                    color: "red",
                    feedbackPrompt: "Do you agree?"
                };

                const result = await (mcpServer as any).callTool("send_discord_embed_with_feedback", embedData);

                expect(mockDiscordBot.sendMessageWithFeedback).toHaveBeenCalledWith(
                    {
                        embeds: [{
                            title: "Feedback Test",
                            description: "Please provide feedback",
                            color: 0xFF0000 // red
                        }]
                    },
                    "Do you agree?",
                    [
                        { label: "Yes", value: "yes" },
                        { label: "No", value: "no" }
                    ],
                    undefined
                );

                const parsedResult = JSON.parse(result.content[0].text);
                expect(parsedResult.status).toBe("success");
                expect(parsedResult.feedback.response).toBe('yes');
                expect(parsedResult.feedback.userId).toBe('test-user-123');
            });

            it("カスタムボタンでフィードバックを送信する", async () => {
                const embedData = {
                    title: "Rating Test",
                    feedbackButtons: [
                        { label: "Excellent", value: "excellent" },
                        { label: "Good", value: "good" },
                        { label: "Poor", value: "poor" }
                    ]
                };

                const result = await (mcpServer as any).callTool("send_discord_embed_with_feedback", embedData);

                expect(mockDiscordBot.sendMessageWithFeedback).toHaveBeenCalledWith(
                    {
                        embeds: [{
                            title: "Rating Test"
                        }]
                    },
                    "Please select:",
                    [
                        { label: "Excellent", value: "excellent" },
                        { label: "Good", value: "good" },
                        { label: "Poor", value: "poor" }
                    ],
                    undefined
                );
            });

            it("無効なボタン配列を拒否する", async () => {
                const embedData = {
                    title: "Invalid Buttons",
                    feedbackButtons: [] // 空配列
                };

                await expect(
                    (mcpServer as any).callTool("send_discord_embed_with_feedback", embedData)
                ).rejects.toThrow();
            });

            it("6つ以上のボタンを拒否する", async () => {
                const embedData = {
                    title: "Too Many Buttons",
                    feedbackButtons: [
                        { label: "1", value: "one" },
                        { label: "2", value: "two" },
                        { label: "3", value: "three" },
                        { label: "4", value: "four" },
                        { label: "5", value: "five" },
                        { label: "6", value: "six" } // 6つ目
                    ]
                };

                await expect(
                    (mcpServer as any).callTool("send_discord_embed_with_feedback", embedData)
                ).rejects.toThrow();
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
                (mcpServer as any).callTool("send_discord_embed", { title: "test" })
            ).rejects.toThrow("Discord bot is not ready");
        });
    });

    describe("エラーハンドリング", () => {
        it("Discord 送信エラーを適切に処理する", async () => {
            mockDiscordBot.sendMessage = mock(() => Promise.reject(new Error("Discord error")));

            await expect(
                (mcpServer as any).callTool("send_discord_embed", { title: "test" })
            ).rejects.toThrow("Failed to send message to Discord: Discord error");
        });
    });
});