import { describe, expect, it, beforeEach, afterEach, mock } from "bun:test";
import { DiscordBot } from "../../src/discord/bot";
import { MCPServer } from "../../src/mcp/server";

describe("Discord と MCP の統合テスト", () => {
    let discordBot: DiscordBot;
    let mcpServer: MCPServer;
    let mockChannel: any;
    let mockSend: any;

    beforeEach(() => {
        mockSend = mock(() => Promise.resolve());
        mockChannel = {
            isTextBased: () => true,
            send: mockSend
        };

        const mockClient = {
            login: mock(() => Promise.resolve("token")),
            on: mock((event: string, handler: Function) => mockClient),
            once: mock((event: string, handler: Function) => {
                if (event === "ready") {
                    setTimeout(() => handler(mockClient), 0);
                }
                return mockClient;
            }),
            destroy: mock(() => Promise.resolve()),
            channels: {
                cache: {
                    get: mock(() => mockChannel)
                }
            },
            user: {
                tag: "TestBot#1234"
            }
        } as any;

        discordBot = new DiscordBot({
            token: "test-token",
            guildId: "test-guild-id",
            textChannelId: "test-channel-id"
        });

        (discordBot as any).client = mockClient;

        // Mock server for MCP
        const mockServer = {
            setRequestHandler: mock(() => {}),
            close: mock(() => Promise.resolve()),
            connect: mock(() => Promise.resolve()),
            onerror: undefined,
            onclose: undefined
        } as any;

        mcpServer = new MCPServer(discordBot);
        (mcpServer as any).server = mockServer;
    });

    afterEach(async () => {
        if (mcpServer) {
            await mcpServer.stop();
        }
        if (discordBot) {
            await discordBot.stop();
        }
    });

    describe("エンドツーエンド動作", () => {
        it("MCP ツールから Discord にメッセージを送信できる", async () => {
            // Discord Bot を開始
            await discordBot.start();
            
            // Bot の準備ができるまで待機
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // MCP サーバーを開始
            await mcpServer.start();

            // MCP ツールを使用してメッセージを送信
            const result = await (mcpServer as any).callTool("send_discord_message", {
                content: "Hello from MCP integration test!"
            });

            // 結果の確認
            expect(mockSend).toHaveBeenCalledWith("Hello from MCP integration test!");
            expect(result).toEqual({
                content: [
                    {
                        type: "text",
                        text: "Message sent to Discord successfully"
                    }
                ]
            });
        });

        it("MCP ツールから Discord に Embed メッセージを送信できる", async () => {
            // Discord Bot を開始
            await discordBot.start();
            
            // Bot の準備ができるまで待機
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // MCP サーバーを開始
            await mcpServer.start();

            // MCP ツールを使用して Embed メッセージを送信
            const embedData = {
                title: "Integration Test",
                description: "This is an integration test",
                color: 0x00ff00,
                fields: [
                    { name: "Status", value: "Success", inline: true },
                    { name: "Environment", value: "Test", inline: true }
                ]
            };

            const result = await (mcpServer as any).callTool("send_discord_embed", embedData);

            // 結果の確認
            expect(mockSend).toHaveBeenCalledWith({
                embeds: [{
                    title: "Integration Test",
                    description: "This is an integration test",
                    color: 0x00ff00,
                    fields: [
                        { name: "Status", value: "Success", inline: true },
                        { name: "Environment", value: "Test", inline: true }
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

        it("Discord Bot が準備できていない場合、MCP ツールはエラーを返す", async () => {
            // Discord Bot を開始しない（準備されていない状態）
            
            // MCP サーバーを開始
            await mcpServer.start();

            // MCP ツールを使用してメッセージを送信しようとする
            await expect(
                (mcpServer as any).callTool("send_discord_message", {
                    content: "This should fail"
                })
            ).rejects.toThrow("Discord bot is not ready");
        });

        it("利用可能なツールのリストを取得できる", async () => {
            // Discord Bot を開始
            await discordBot.start();
            
            // Bot の準備ができるまで待機
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // MCP サーバーを開始
            await mcpServer.start();

            // ツールリストを取得
            const tools = await (mcpServer as any).listTools();

            // 期待されるツールが含まれていることを確認
            expect(tools.tools).toHaveLength(3);
            expect(tools.tools.map((t: any) => t.name)).toEqual([
                "send_discord_message",
                "send_discord_embed",
                "send_discord_embed_with_feedback"
            ]);
        });
    });

    describe("エラーハンドリング", () => {
        it("Discord の送信エラーが適切に MCP に伝播される", async () => {
            // Discord Bot を開始
            await discordBot.start();
            
            // Bot の準備ができるまで待機
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // MCP サーバーを開始
            await mcpServer.start();

            // エラーをシミュレート
            mockSend.mockImplementation(() => Promise.reject(new Error("Discord API error")));

            // MCP ツールを使用してメッセージを送信しようとする
            await expect(
                (mcpServer as any).callTool("send_discord_message", {
                    content: "This will fail"
                })
            ).rejects.toThrow("Failed to send message to Discord: Discord API error");
        });
    });
});