import { describe, expect, it, beforeEach, afterEach, mock } from "bun:test";
import { DiscordBot } from "../../src/discord/bot";
import { Client, Events, type MessageCreateOptions, type ButtonInteraction, type Message } from "discord.js";

describe("DiscordBot", () => {
    let bot: DiscordBot;
    let mockClient: Client;
    let mockChannel: any;
    let mockSend: any;
    let mockGuild: any;
    let mockMember: any;

    beforeEach(() => {
        mockSend = mock(() => Promise.resolve({
            id: "test-message-123"
        }));
        mockChannel = {
            isTextBased: () => true,
            send: mockSend
        };
        
        mockMember = {
            roles: {
                cache: {
                    has: mock((roleId: string) => roleId === "allowed-role-id")
                }
            }
        };
        
        mockGuild = {
            members: {
                fetch: mock((userId: string) => Promise.resolve(mockMember))
            }
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
            guilds: {
                cache: {
                    get: mock(() => mockGuild)
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

    describe("ロールベースアクセス制御", () => {
        describe("allowedRoleIdが設定されていない場合", () => {
            it("全ユーザーを許可する", async () => {
                const result = await (bot as any).checkUserPermission("any-user-id");
                expect(result).toBe(true);
            });
        });

        describe("allowedRoleIdが設定されている場合", () => {
            beforeEach(() => {
                bot = new DiscordBot({
                    token: "test-token",
                    guildId: "test-guild-id",
                    textChannelId: "test-channel-id",
                    allowedRoleId: "allowed-role-id"
                });
                (bot as any).client = mockClient;
            });

            it("許可されたロールを持つユーザーを許可する", async () => {
                const result = await (bot as any).checkUserPermission("user-with-role");
                expect(result).toBe(true);
                expect(mockGuild.members.fetch).toHaveBeenCalledWith("user-with-role");
                expect(mockMember.roles.cache.has).toHaveBeenCalledWith("allowed-role-id");
            });

            it("許可されたロールを持たないユーザーを拒否する", async () => {
                mockMember.roles.cache.has = mock(() => false);
                const result = await (bot as any).checkUserPermission("user-without-role");
                expect(result).toBe(false);
            });

            it("ギルドが見つからない場合は拒否する", async () => {
                mockClient.guilds.cache.get = mock(() => null);
                const result = await (bot as any).checkUserPermission("any-user");
                expect(result).toBe(false);
            });

            it("メンバーが見つからない場合は拒否する", async () => {
                mockGuild.members.fetch = mock(() => Promise.resolve(null));
                const result = await (bot as any).checkUserPermission("nonexistent-user");
                expect(result).toBe(false);
            });

            it("エラーが発生した場合は拒否する", async () => {
                mockGuild.members.fetch = mock(() => Promise.reject(new Error("Fetch failed")));
                const result = await (bot as any).checkUserPermission("error-user");
                expect(result).toBe(false);
            });
        });
    });
});