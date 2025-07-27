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
            sendTextChannelMessage: mock(() => Promise.resolve({
                messageId: "test-message-123",
                channelId: "test-channel-456",
                sentAt: "2023-01-01T00:00:00.000Z",
                status: "success"
            })),
            createThread: mock(() => Promise.resolve({
                messageId: "test-message-123",
                channelId: "test-channel-456",
                threadId: "test-thread-789",
                sentAt: "2023-01-01T00:00:00.000Z",
                status: "success"
            })),
            sendThreadMessage: mock(() => Promise.resolve({
                messageId: "test-message-123",
                threadId: "test-thread-789",
                sentAt: "2023-01-01T00:00:00.000Z",
                status: "success"
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
            
            expect(tools.tools).toHaveLength(3);
            expect(tools.tools.find((t: any) => t.name === "send_textchannel_message")).toBeDefined();
            expect(tools.tools.find((t: any) => t.name === "create_thread")).toBeDefined();
            expect(tools.tools.find((t: any) => t.name === "send_thread_message")).toBeDefined();
        });
    });

    describe("callTool", () => {
        it("存在しないツールの場合はエラーを返す", async () => {
            await expect(
                (mcpServer as any).callTool("unknown_tool", {})
            ).rejects.toThrow("Unknown tool: unknown_tool");
        });

        it("Discord Bot が準備できていない場合はエラーを返す", async () => {
            mockDiscordBot.getIsReady = mock(() => false);

            await expect(
                (mcpServer as any).callTool("send_textchannel_message", { title: "test" })
            ).rejects.toThrow("Discord bot is not ready");
        });
    });

    describe("エラーハンドリング", () => {
        it("Discord 送信エラーを適切に処理する", async () => {
            mockDiscordBot.sendTextChannelMessage = mock(() => Promise.reject(new Error("Discord error")));

            await expect(
                (mcpServer as any).callTool("send_textchannel_message", { title: "test" })
            ).rejects.toThrow("Failed to send message to text channel: Discord error");
        });
    });
});