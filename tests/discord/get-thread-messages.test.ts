import { describe, expect, it, beforeEach, afterEach, mock } from 'bun:test';
import { DiscordBot } from '../../src/discord/bot';
import type {
  ThreadMessage,
  EmbedInfo,
  AttachmentInfo,
  ReactionInfo,
} from '../../src/types/mcp';

describe('DiscordBot - getThreadMessages', () => {
  let bot: DiscordBot;
  let mockClient: any;
  let mockThread: any;
  let mockMessage1: any;
  let mockMessage2: any;
  let mockMessages: any;

  beforeEach(() => {
    // モックメッセージオブジェクトの作成
    mockMessage1 = {
      id: 'message-1',
      content: 'こんにちは！',
      author: {
        id: 'user-1',
        username: 'testuser',
        displayName: 'テストユーザー',
        bot: false,
      },
      createdAt: new Date('2024-01-15T10:30:00.000Z'),
      editedAt: null,
      embeds: [
        {
          title: 'テスト埋め込み',
          description: 'これは埋め込みメッセージです',
          color: 0x0099ff,
          timestamp: '2024-01-15T10:30:00.000Z',
          fields: [
            {
              name: 'フィールド1',
              value: '値1',
              inline: true,
            },
          ],
          toJSON: () => ({
            title: 'テスト埋め込み',
            description: 'これは埋め込みメッセージです',
            color: 0x0099ff,
            timestamp: '2024-01-15T10:30:00.000Z',
            fields: [
              {
                name: 'フィールド1',
                value: '値1',
                inline: true,
              },
            ],
          }),
        },
      ],
      attachments: new Map([
        [
          'attachment-1',
          {
            id: 'attachment-1',
            name: 'test.png',
            size: 1024,
            contentType: 'image/png',
            url: 'https://cdn.discord.com/attachments/test.png',
          },
        ],
      ]),
      reactions: {
        cache: new Map([
          [
            'reaction-1',
            {
              emoji: { toString: () => '👍' },
              count: 3,
              me: false,
            },
          ],
        ]),
      },
      reference: {
        messageId: 'reply-to-message-1',
      },
    };

    mockMessage2 = {
      id: 'message-2',
      content: 'いいアイデアですね！',
      author: {
        id: 'user-2',
        username: 'reviewer',
        displayName: null,
        bot: false,
      },
      createdAt: new Date('2024-01-15T10:25:00.000Z'),
      editedAt: new Date('2024-01-15T10:26:00.000Z'),
      embeds: [],
      attachments: new Map(),
      reactions: {
        cache: new Map(),
      },
      reference: null,
    };

    mockMessages = {
      values: mock(() => [mockMessage1, mockMessage2]),
      map: mock((callback: Function) => [
        callback(mockMessage1),
        callback(mockMessage2),
      ]),
    };

    mockThread = {
      id: 'test-thread-123',
      isThread: () => true,
      messages: {
        fetch: mock(() => Promise.resolve(mockMessages)),
      },
    };

    mockClient = {
      channels: {
        cache: {
          get: mock(() => mockThread),
        },
      },
      destroy: mock(() => Promise.resolve()),
    };

    bot = new DiscordBot({
      token: 'test-token',
      guildId: 'test-guild-id',
      textChannelId: 'test-channel-id',
    });

    (bot as any).client = mockClient;
    (bot as any)._setReady(true);
  });

  afterEach(() => {
    if (bot) {
      bot.stop();
    }
  });

  describe('getThreadMessages - 基本機能', () => {
    it('スレッドからメッセージを取得できる', async () => {
      const result = await (bot as any).getThreadMessages('test-thread-123');

      expect(result).toHaveLength(2);
      expect(mockThread.messages.fetch).toHaveBeenCalledWith({ limit: 50 });

      // メッセージが新しい順にソートされているか確認
      expect(result[0].messageId).toBe('message-1'); // 新しい
      expect(result[1].messageId).toBe('message-2'); // 古い
    });

    it('limitオプションが正しく適用される', async () => {
      await (bot as any).getThreadMessages('test-thread-123', { limit: 25 });

      expect(mockThread.messages.fetch).toHaveBeenCalledWith({ limit: 25 });
    });

    it('beforeオプションが正しく適用される', async () => {
      await (bot as any).getThreadMessages('test-thread-123', {
        limit: 30,
        before: 'message-before-123',
      });

      expect(mockThread.messages.fetch).toHaveBeenCalledWith({
        limit: 30,
        before: 'message-before-123',
      });
    });

    it('afterオプションが正しく適用される', async () => {
      await (bot as any).getThreadMessages('test-thread-123', {
        limit: 20,
        after: 'message-after-456',
      });

      expect(mockThread.messages.fetch).toHaveBeenCalledWith({
        limit: 20,
        after: 'message-after-456',
      });
    });
  });

  describe('getThreadMessages - メッセージ変換', () => {
    it('メッセージが正しい形式に変換される', async () => {
      const result = await (bot as any).getThreadMessages('test-thread-123');

      const message = result[0] as ThreadMessage;
      expect(message.messageId).toBe('message-1');
      expect(message.content).toBe('こんにちは！');
      expect(message.author.id).toBe('user-1');
      expect(message.author.username).toBe('testuser');
      expect(message.author.displayName).toBe('テストユーザー');
      expect(message.author.bot).toBe(false);
      expect(message.createdAt).toBe('2024-01-15T10:30:00.000Z');
      expect(message.editedAt).toBeUndefined();
    });

    it('編集されたメッセージの日時が含まれる', async () => {
      const result = await (bot as any).getThreadMessages('test-thread-123');

      const message = result[1] as ThreadMessage;
      expect(message.editedAt).toBe('2024-01-15T10:26:00.000Z');
    });
  });

  describe('getThreadMessages - Embed処理', () => {
    it('includeEmbeds=trueの場合Embedが含まれる', async () => {
      const result = await (bot as any).getThreadMessages('test-thread-123', {
        includeEmbeds: true,
      });

      const message = result[0] as ThreadMessage;
      expect(message.embeds).toHaveLength(1);
      expect(message.embeds?.[0]?.title).toBe('テスト埋め込み');
      expect(message.embeds?.[0]?.description).toBe(
        'これは埋め込みメッセージです'
      );
      expect(message.embeds?.[0]?.color).toBe(0x0099ff);
      expect(message.embeds?.[0]?.timestamp).toBe('2024-01-15T10:30:00.000Z');
      expect(message.embeds?.[0]?.fields).toHaveLength(1);
    });

    it('includeEmbeds=falseの場合Embedが含まれない', async () => {
      const result = await (bot as any).getThreadMessages('test-thread-123', {
        includeEmbeds: false,
      });

      const message = result[0] as ThreadMessage;
      expect(message.embeds).toBeUndefined();
    });
  });

  describe('getThreadMessages - 添付ファイル処理', () => {
    it('includeAttachments=trueの場合添付ファイルが含まれる', async () => {
      const result = await (bot as any).getThreadMessages('test-thread-123', {
        includeAttachments: true,
      });

      const message = result[0] as ThreadMessage;
      expect(message.attachments).toHaveLength(1);
      expect(message.attachments?.[0]?.id).toBe('attachment-1');
      expect(message.attachments?.[0]?.filename).toBe('test.png');
      expect(message.attachments?.[0]?.size).toBe(1024);
      expect(message.attachments?.[0]?.contentType).toBe('image/png');
      expect(message.attachments?.[0]?.url).toBe(
        'https://cdn.discord.com/attachments/test.png'
      );
    });

    it('includeAttachments=falseの場合添付ファイルが含まれない', async () => {
      const result = await (bot as any).getThreadMessages('test-thread-123', {
        includeAttachments: false,
      });

      const message = result[0] as ThreadMessage;
      expect(message.attachments).toBeUndefined();
    });
  });

  describe('getThreadMessages - リアクション処理', () => {
    it('リアクションが正しく含まれる', async () => {
      const result = await (bot as any).getThreadMessages('test-thread-123');

      const message = result[0] as ThreadMessage;
      expect(message.reactions).toHaveLength(1);
      expect(message.reactions?.[0]?.emoji).toBe('👍');
      expect(message.reactions?.[0]?.count).toBe(3);
      expect(message.reactions?.[0]?.me).toBe(false);
    });

    it('リアクションがない場合は空配列ではなくundefined', async () => {
      const result = await (bot as any).getThreadMessages('test-thread-123');

      const message = result[1] as ThreadMessage;
      expect(message.reactions).toBeUndefined();
    });
  });

  describe('getThreadMessages - 返信処理', () => {
    it('返信メッセージの場合返信情報が含まれる', async () => {
      const result = await (bot as any).getThreadMessages('test-thread-123');

      const message = result[0] as ThreadMessage;
      expect(message.replyTo).toBeDefined();
      expect(message.replyTo!.messageId).toBe('reply-to-message-1');
      expect(message.replyTo!.authorId).toBe('user-1');
    });

    it('返信でない場合返信情報は含まれない', async () => {
      const result = await (bot as any).getThreadMessages('test-thread-123');

      const message = result[1] as ThreadMessage;
      expect(message.replyTo).toBeUndefined();
    });
  });

  describe('getThreadMessages - エラーハンドリング', () => {
    it('Botが準備できていない場合エラーが発生する', async () => {
      (bot as any)._setReady(false);

      await expect(
        (bot as any).getThreadMessages('test-thread-123')
      ).rejects.toThrow('Bot is not ready');
    });

    it('スレッドが見つからない場合エラーが発生する', async () => {
      mockClient.channels.cache.get = mock(() => null);

      await expect(
        (bot as any).getThreadMessages('test-thread-123')
      ).rejects.toThrow('Thread not found');
    });

    it('通常のチャンネルでスレッドでない場合エラーが発生する', async () => {
      const mockNonThread = {
        isThread: () => false,
      };
      mockClient.channels.cache.get = mock(() => mockNonThread);

      await expect(
        (bot as any).getThreadMessages('test-thread-123')
      ).rejects.toThrow('Thread not found');
    });

    it('Discord APIエラーが適切に処理される', async () => {
      mockThread.messages.fetch = mock(() =>
        Promise.reject(new Error('Discord API error'))
      );

      await expect(
        (bot as any).getThreadMessages('test-thread-123')
      ).rejects.toThrow('Discord API error');
    });
  });

  describe('getThreadMessages - デフォルト値', () => {
    it('オプションが指定されない場合デフォルト値が使用される', async () => {
      await (bot as any).getThreadMessages('test-thread-123');

      expect(mockThread.messages.fetch).toHaveBeenCalledWith({ limit: 50 });
    });

    it('空のオプションオブジェクトの場合デフォルト値が使用される', async () => {
      await (bot as any).getThreadMessages('test-thread-123', {});

      expect(mockThread.messages.fetch).toHaveBeenCalledWith({ limit: 50 });
    });
  });
});
