import { describe, expect, it, beforeEach, afterEach, mock } from "bun:test";
import { MCPServer } from "../../src/mcp/server";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { DiscordBot } from "../../src/discord/bot";

describe("多言語フィードバックボタンテスト", () => {
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
                response: 'はい',
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

    describe("多言語ボタンテスト", () => {
        it("日本語ボタンでフィードバックを送信する", async () => {
            const embedData = {
                title: "アンケート",
                description: "サービスの満足度をお聞かせください",
                color: "blue",
                feedbackButtons: [
                    { label: "とても満足", value: "とても満足" },
                    { label: "満足", value: "満足" },
                    { label: "普通", value: "普通" },
                    { label: "不満", value: "不満" }
                ]
            };

            const result = await (mcpServer as any).callTool("send_discord_embed_with_feedback", embedData);

            expect(mockDiscordBot.sendMessageWithFeedback).toHaveBeenCalledWith(
                {
                    embeds: [{
                        title: "アンケート",
                        description: "サービスの満足度をお聞かせください",
                        color: 0x0000FF // blue
                    }]
                },
                "Please select:",
                [
                    { label: "とても満足", value: "とても満足" },
                    { label: "満足", value: "満足" },
                    { label: "普通", value: "普通" },
                    { label: "不満", value: "不満" }
                ],
                undefined
            );

            const parsedResult = JSON.parse(result.content[0].text);
            expect(parsedResult.status).toBe("success");
            expect(parsedResult.feedback.response).toBe('はい');
        });

        it("中国語ボタンでフィードバックを送信する", async () => {
            const embedData = {
                title: "问卷调查",
                feedbackButtons: [
                    { label: "非常好", value: "非常好" },
                    { label: "好", value: "好" },
                    { label: "一般", value: "一般" },
                    { label: "不好", value: "不好" }
                ]
            };

            const result = await (mcpServer as any).callTool("send_discord_embed_with_feedback", embedData);

            expect(mockDiscordBot.sendMessageWithFeedback).toHaveBeenCalledWith(
                {
                    embeds: [{
                        title: "问卷调查"
                    }]
                },
                "Please select:",
                [
                    { label: "非常好", value: "非常好" },
                    { label: "好", value: "好" },
                    { label: "一般", value: "一般" },
                    { label: "不好", value: "不好" }
                ],
                undefined
            );

            expect(() => result).not.toThrow();
        });

        it("絵文字を含むボタンでフィードバックを送信する", async () => {
            const embedData = {
                title: "Reaction Test",
                feedbackButtons: [
                    { label: "😍 Love it!", value: "love" },
                    { label: "👍 Good", value: "good" },
                    { label: "😐 Okay", value: "okay" },
                    { label: "👎 Bad", value: "bad" }
                ]
            };

            const result = await (mcpServer as any).callTool("send_discord_embed_with_feedback", embedData);

            expect(mockDiscordBot.sendMessageWithFeedback).toHaveBeenCalledWith(
                {
                    embeds: [{
                        title: "Reaction Test"
                    }]
                },
                "Please select:",
                [
                    { label: "😍 Love it!", value: "love" },
                    { label: "👍 Good", value: "good" },
                    { label: "😐 Okay", value: "okay" },
                    { label: "👎 Bad", value: "bad" }
                ],
                undefined
            );

            expect(() => result).not.toThrow();
        });

        it("多言語混在ボタンでフィードバックを送信する", async () => {
            const embedData = {
                title: "International Survey",
                feedbackButtons: [
                    { label: "English: Yes", value: "yes_en" },
                    { label: "日本語: はい", value: "はい_ja" },
                    { label: "Español: Sí", value: "si_es" },
                    { label: "Русский: Да", value: "да_ru" }
                ]
            };

            const result = await (mcpServer as any).callTool("send_discord_embed_with_feedback", embedData);

            expect(mockDiscordBot.sendMessageWithFeedback).toHaveBeenCalledWith(
                {
                    embeds: [{
                        title: "International Survey"
                    }]
                },
                "Please select:",
                [
                    { label: "English: Yes", value: "yes_en" },
                    { label: "日本語: はい", value: "はい_ja" },
                    { label: "Español: Sí", value: "si_es" },
                    { label: "Русский: Да", value: "да_ru" }
                ],
                undefined
            );

            expect(() => result).not.toThrow();
        });
    });
});