import { describe, expect, it, beforeEach, afterEach, mock } from "bun:test";
import { DiscordBot } from "../../src/discord/bot";
import { MCPServer } from "../../src/mcp/server";

describe("Discord と MCP の統合テスト", () => {
    let discordBot: DiscordBot;
    let mcpServer: MCPServer;
    let mockChannel: any;
    let mockSend: any;

    beforeEach(() => {
        mockSend = mock(() => Promise.resolve({
            id: "test-message-123",
            createdTimestamp: Date.now()
        }));
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
                color: "lime",
                fields: [
                    { name: "Status", value: "Success", inline: true },
                    { name: "Environment", value: "Test", inline: true }
                ]
            };

            const result = await (mcpServer as any).callTool("send_textchannel_message", embedData);

            // 結果の確認
            expect(result).toBeDefined();
            expect(result.content).toBeDefined();
            expect(result.content[0].type).toBe("text");
            
            // レスポンスの内容をパース
            const parsedResult = JSON.parse(result.content[0].text);
            expect(parsedResult.status).toBe("success");
            expect(parsedResult.messageId).toBeDefined();
            expect(parsedResult.channelId).toBeDefined();
            expect(parsedResult.sentAt).toBeDefined();
        });

        it("Discord Bot が準備できていない場合、MCP ツールはエラーを返す", async () => {
            // Discord Bot を開始しない（準備されていない状態）
            
            // MCP サーバーを開始
            await mcpServer.start();

            // MCP ツールを使用してメッセージを送信しようとする
            await expect(
                (mcpServer as any).callTool("send_textchannel_message", {
                    title: "This should fail"
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
                "send_textchannel_message",
                "create_thread",
                "send_thread_message"
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
                (mcpServer as any).callTool("send_textchannel_message", {
                    title: "This will fail"
                })
            ).rejects.toThrow("Failed to send message to text channel: Discord API error");
        });
    });
});