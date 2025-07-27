import { describe, expect, it, beforeEach, afterEach, mock } from "bun:test";
import { DiscordBot } from "../../src/discord/bot";
import { Client, Events, type MessageCreateOptions } from "discord.js";

describe("DiscordBot", () => {
    let bot: DiscordBot;
    let mockClient: Client;
    let mockChannel: any;
    let mockSend: any;

    beforeEach(() => {
        mockSend = mock(() => Promise.resolve({
            id: "test-message-123"
        }));
        mockChannel = {
            isTextBased: () => true,
            send: mockSend
        };
        
        mockClient = {
            login: mock(() => Promise.resolve("token")),
            on: mock((event: string, handler: Function) => mockClient),
            once: mock((event: string, handler: Function) => mockClient),
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

        bot = new DiscordBot({
            token: "test-token",
            guildId: "test-guild-id",
            textChannelId: "test-channel-id"
        });
        
        (bot as any).client = mockClient;
    });

    afterEach(() => {
        if (bot) {
            bot.stop();
        }
    });

    describe("初期化", () => {
        it("正しい設定でインスタンスが作成される", () => {
            expect(bot).toBeDefined();
            expect((bot as any).config.token).toBe("test-token");
            expect((bot as any).config.guildId).toBe("test-guild-id");
            expect((bot as any).config.textChannelId).toBe("test-channel-id");
        });
    });

    describe("start", () => {
        it("Discord クライアントにログインする", async () => {
            await bot.start();
            expect(mockClient.login).toHaveBeenCalledWith("test-token");
        });

        it("必要なイベントリスナーが登録される", async () => {
            await bot.start();
            expect(mockClient.once).toHaveBeenCalledWith(Events.ClientReady, expect.any(Function));
            expect(mockClient.on).toHaveBeenCalledWith(Events.Error, expect.any(Function));
        });
    });


    describe("stop", () => {
        it("Discord クライアントを正しく破棄する", async () => {
            await bot.stop();
            expect(mockClient.destroy).toHaveBeenCalled();
        });
    });

    describe("getIsReady", () => {
        it("準備状態を正しく返す", () => {
            expect(bot.getIsReady()).toBe(false);
            (bot as any)._setReady(true);
            expect(bot.getIsReady()).toBe(true);
        });
    });
});