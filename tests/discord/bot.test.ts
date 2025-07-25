import { describe, expect, it, beforeEach, afterEach, mock } from "bun:test";
import { DiscordBot } from "../../src/discord/bot";
import { Client, Events, type MessageCreateOptions } from "discord.js";

describe("DiscordBot", () => {
    let bot: DiscordBot;
    let mockClient: Client;
    let mockChannel: any;
    let mockSend: any;

    beforeEach(() => {
        mockSend = mock(() => Promise.resolve());
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

    describe("sendMessage", () => {
        beforeEach(() => {
            (bot as any)._setReady(true);
        });

        it("指定されたチャンネルにメッセージを送信する", async () => {
            await bot.sendMessage("Hello, Discord!");
            
            expect(mockClient.channels.cache.get).toHaveBeenCalledWith("test-channel-id");
            expect(mockSend).toHaveBeenCalledWith("Hello, Discord!");
        });

        it("Embedオプションでリッチなメッセージを送信できる", async () => {
            const options: MessageCreateOptions = {
                embeds: [{
                    title: "Test Embed",
                    description: "This is a test",
                    color: 0x0099ff
                }]
            };
            
            await bot.sendMessage(options);
            expect(mockSend).toHaveBeenCalledWith(options);
        });

        it("チャンネルが見つからない場合はエラーをスローする", async () => {
            mockClient.channels.cache.get = mock(() => null) as any;
            
            await expect(bot.sendMessage("test")).rejects.toThrow("Channel not found");
        });

        it("テキストチャンネルでない場合はエラーをスローする", async () => {
            mockClient.channels.cache.get = mock(() => ({
                isTextBased: () => false
            })) as any;
            
            await expect(bot.sendMessage("test")).rejects.toThrow("Channel is not a text channel");
        });

        it("Botが準備できていない場合はエラーをスローする", async () => {
            (bot as any)._setReady(false);
            
            await expect(bot.sendMessage("test")).rejects.toThrow("Bot is not ready");
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