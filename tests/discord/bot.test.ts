import { describe, expect, it, beforeEach, afterEach, mock } from 'bun:test';
import { DiscordBot } from '../../src/discord/bot';
import {
  Client,
  Events,
  type MessageCreateOptions,
  type Message,
} from 'discord.js';

// 環境変数の設定
process.env.DISCORD_LOCALE = 'en';

describe('DiscordBot', () => {
  let bot: DiscordBot;
  let mockClient: Client;
  let mockChannel: any;
  let mockSend: any;

  beforeEach(() => {
    mockSend = mock(() =>
      Promise.resolve({
        id: 'test-message-123',
      })
    );
    mockChannel = {
      isTextBased: () => true,
      send: mockSend,
    };

    mockClient = {
      login: mock(() => Promise.resolve('token')),
      on: mock((event: string, handler: Function) => mockClient),
      once: mock((event: string, handler: Function) => mockClient),
      destroy: mock(() => Promise.resolve()),
      channels: {
        cache: {
          get: mock(() => mockChannel),
        },
      },
      user: {
        tag: 'TestBot#1234',
      },
    } as any;

    bot = new DiscordBot({
      token: 'test-token',
      guildId: 'test-guild-id',
      textChannelId: 'test-channel-id',
    });

    (bot as any).client = mockClient;
  });

  afterEach(() => {
    if (bot) {
      bot.stop();
    }
  });

  describe('初期化', () => {
    it('正しい設定でインスタンスが作成される', () => {
      expect(bot).toBeDefined();
      expect((bot as any).config.token).toBe('test-token');
      expect((bot as any).config.guildId).toBe('test-guild-id');
      expect((bot as any).config.textChannelId).toBe('test-channel-id');
    });
  });

  describe('start', () => {
    it('Discord クライアントにログインする', async () => {
      await bot.start();
      expect(mockClient.login).toHaveBeenCalledWith('test-token');
    });

    it('必要なイベントリスナーが登録される', async () => {
      await bot.start();
      expect(mockClient.once).toHaveBeenCalledWith(
        Events.ClientReady,
        expect.any(Function)
      );
      expect(mockClient.on).toHaveBeenCalledWith(
        Events.Error,
        expect.any(Function)
      );
    });
  });

  describe('stop', () => {
    it('Discord クライアントを正しく破棄する', async () => {
      await bot.stop();
      expect(mockClient.destroy).toHaveBeenCalled();
    });
  });

  describe('getIsReady', () => {
    it('準備状態を正しく返す', () => {
      expect(bot.getIsReady()).toBe(false);
      (bot as any)._setReady(true);
      expect(bot.getIsReady()).toBe(true);
    });
  });

  describe('テキスト応答時のEmbed更新', () => {
    let mockThread: any;
    let mockMessage: any;
    let mockTargetMessage: any;
    let mockEdit: any;
    let messageCreateHandler: any;

    beforeEach(() => {
      // モックメッセージの設定
      mockEdit = mock(() => Promise.resolve());
      mockTargetMessage = {
        embeds: [
          {
            toJSON: () => ({
              title: 'Test Embed',
              description: 'Test Description',
              color: 0x0099ff,
            }),
          },
        ],
        edit: mockEdit,
      };

      // モックスレッドチャンネルの設定
      mockThread = {
        id: 'test-thread-id',
        isThread: () => true,
        send: mock(() =>
          Promise.resolve({
            id: 'test-message-id',
            channel: { id: 'test-thread-id' },
          })
        ),
        messages: {
          fetch: mock(() => Promise.resolve(mockTargetMessage)),
        },
      };

      // モックメッセージ（ユーザーからの返信）
      mockMessage = {
        author: { bot: false, id: 'test-user-id' },
        content: 'ユーザーの返信',
        channel: mockThread,
      };

      // イベントハンドラーを取得するためにモックを更新
      const originalOn = mockClient.on;
      mockClient.on = mock((event: string, handler: Function) => {
        if (event === Events.MessageCreate) {
          messageCreateHandler = handler;
        }
        // 他のイベントもハンドルする
        originalOn.call(mockClient, event, handler as (...args: any[]) => void);
        return mockClient;
      });

      // チャンネルキャッシュを更新
      mockClient.channels.cache.get = mock((id: string) => {
        if (id === 'test-thread-id') return mockThread;
        return mockChannel;
      });
    });

    it('テキスト応答待機時にmessageIdが保存される', async () => {
      (bot as any)._setReady(true);
      await bot.start();

      // テキスト応答を待機するメッセージを送信（非同期で開始）
      const promise = bot.sendThreadMessage(
        'test-thread-id',
        { content: 'テストメッセージ' },
        { type: 'text' }
      );

      // 少し待機してresolverが設定されるのを待つ
      await new Promise((resolve) => setTimeout(resolve, 10));

      // resolverが正しく設定されているか確認
      const resolvers = (bot as any).threadResolvers;
      expect(resolvers.has('test-thread-id')).toBe(true);
      expect(resolvers.get('test-thread-id').messageId).toBe('test-message-id');

      // Promiseが未解決のままにならないようにクリーンアップ
      resolvers
        .get('test-thread-id')
        .resolve({ message: 'test', userId: 'test-user' });
      await promise;
    });

    it('テキスト応答受信時にEmbedが青から緑に更新される', async () => {
      (bot as any)._setReady(true);
      await bot.start();

      // テキスト応答を待機するメッセージを送信
      const promise = bot.sendThreadMessage(
        'test-thread-id',
        {
          embeds: [
            {
              title: 'Test Embed',
              description: 'Test Description',
              color: 0x0099ff,
            },
          ],
        },
        { type: 'text' }
      );

      // 少し待機してresolverが設定されるのを待つ
      await new Promise((resolve) => setTimeout(resolve, 10));

      // MessageCreateイベントを発火
      await messageCreateHandler(mockMessage);

      // Embedが更新されたか確認
      expect(mockTargetMessage.edit).toHaveBeenCalledWith({
        embeds: [
          {
            title: 'Test Embed',
            description: 'Test Description',
            color: 0x00ff00,
          },
        ],
      });

      // Promiseを解決
      await promise;
    });

    it('メッセージ取得に失敗してもエラーハンドリングされる', async () => {
      (bot as any)._setReady(true);
      await bot.start();

      // メッセージ取得を失敗させる
      mockThread.messages.fetch = mock(() =>
        Promise.reject(new Error('Message not found'))
      );

      // テキスト応答を待機するメッセージを送信
      const promise = bot.sendThreadMessage(
        'test-thread-id',
        { content: 'テストメッセージ' },
        { type: 'text' }
      );

      // 少し待機してresolverが設定されるのを待つ
      await new Promise((resolve) => setTimeout(resolve, 10));

      // MessageCreateイベントを発火
      await messageCreateHandler(mockMessage);

      // エラーがスローされないことを確認（エラーはログに出力される）
      const result = await promise;
      expect(result.response.text).toBe('ユーザーの返信');
    });
  });
});
