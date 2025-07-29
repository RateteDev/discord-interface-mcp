import { describe, expect, it, beforeEach, afterEach, mock } from 'bun:test';
import { MCPServer } from '../../src/mcp/server';
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import type { DiscordBot } from '../../src/discord/bot';
import type {
  SendTextChannelMessageArgs,
  CreateThreadArgs,
  SendThreadMessageArgs,
  TextChannelMessageResponse,
  CreateThreadResponse,
  SendThreadMessageResponse,
  ThreadMessageTextResponse,
  ThreadMessageButtonResponse,
} from '../../src/types/mcp';

describe('MCPServer', () => {
  let mcpServer: MCPServer;
  let mockDiscordBot: DiscordBot;
  let mockServer: Server;
  let callToolMethod: (name: string, args: any) => Promise<any>;

  beforeEach(() => {
    mockDiscordBot = {
      sendTextChannelMessage: mock(() =>
        Promise.resolve({
          messageId: 'test-message-123',
          channelId: 'test-channel-456',
          sentAt: '2023-01-01T00:00:00.000Z',
          status: 'success',
        })
      ),
      createThread: mock(() =>
        Promise.resolve({
          messageId: 'test-message-123',
          channelId: 'test-channel-456',
          threadId: 'test-thread-789',
          sentAt: '2023-01-01T00:00:00.000Z',
          status: 'success',
        })
      ),
      sendThreadMessage: mock(
        (
          threadId: string,
          content: any,
          waitForResponse?: any,
          timeout?: number
        ) => {
          if (!waitForResponse) {
            return Promise.resolve({
              messageId: 'test-message-123',
              threadId: threadId,
              sentAt: '2023-01-01T00:00:00.000Z',
              status: 'success',
            });
          } else if (waitForResponse.type === 'text') {
            return Promise.resolve({
              messageId: 'test-message-123',
              threadId: threadId,
              sentAt: '2023-01-01T00:00:00.000Z',
              status: 'success',
              response: {
                type: 'text',
                text: 'ユーザーの返信',
                userId: 'test-user-123',
                responseTime: 1500,
              },
            });
          } else if (waitForResponse.type === 'button') {
            return Promise.resolve({
              messageId: 'test-message-123',
              threadId: threadId,
              sentAt: '2023-01-01T00:00:00.000Z',
              status: 'success',
              response: {
                type: 'button',
                value: 'yes',
                userId: 'test-user-123',
                responseTime: 1500,
              },
            });
          }
        }
      ),
      getIsReady: mock(() => true),
      start: mock(() => Promise.resolve()),
      stop: mock(() => Promise.resolve()),
    } as any;

    mockServer = {
      setRequestHandler: mock(() => {}),
      close: mock(() => Promise.resolve()),
      onerror: undefined,
      onclose: undefined,
    } as any;

    mcpServer = new MCPServer(mockDiscordBot);
    (mcpServer as any).server = mockServer;
    callToolMethod = (mcpServer as any).callTool.bind(mcpServer);
  });

  afterEach(() => {
    if (mcpServer) {
      mcpServer.stop();
    }
  });

  describe('初期化', () => {
    it('正しくインスタンスが作成される', () => {
      expect(mcpServer).toBeDefined();
      expect((mcpServer as any).discordBot).toBe(mockDiscordBot);
    });
  });

  describe('setupHandlers', () => {
    it('必要なハンドラーが設定される', () => {
      (mcpServer as any).setupHandlers();

      expect(mockServer.setRequestHandler).toHaveBeenCalledTimes(2);
      expect(mockServer.setRequestHandler).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('listTools', () => {
    it('利用可能なツールのリストを返す', async () => {
      const tools = await (mcpServer as any).listTools();

      expect(tools.tools).toHaveLength(3);
      expect(
        tools.tools.find((t: any) => t.name === 'send_textchannel_message')
      ).toBeDefined();
      expect(
        tools.tools.find((t: any) => t.name === 'create_thread')
      ).toBeDefined();
      expect(
        tools.tools.find((t: any) => t.name === 'send_thread_message')
      ).toBeDefined();
    });
  });

  describe('callTool', () => {
    it('存在しないツールの場合はエラーを返す', async () => {
      await expect(
        (mcpServer as any).callTool('unknown_tool', {})
      ).rejects.toThrow('Unknown tool: unknown_tool');
    });

    it('Discord Bot が準備できていない場合はエラーを返す', async () => {
      mockDiscordBot.getIsReady = mock(() => false);

      await expect(
        (mcpServer as any).callTool('send_textchannel_message', {
          title: 'test',
        })
      ).rejects.toThrow('Discord bot is not ready');
    });
  });

  describe('send_textchannel_message', () => {
    it('シンプルな通知を送信できる', async () => {
      const args: SendTextChannelMessageArgs = {
        title: '✅ デプロイ完了',
        description: 'v2.0.0がリリースされました',
      };

      const result = await callToolMethod('send_textchannel_message', args);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');

      const response = JSON.parse(result.content[0].text);
      expect(response.status).toBe('success');
      expect(response.messageId).toBe('test-message-123');
      expect(mockDiscordBot.sendTextChannelMessage).toHaveBeenCalled();
    });

    it('フィールド付きメッセージを送信できる', async () => {
      const args: SendTextChannelMessageArgs = {
        title: 'エラーレポート',
        description: 'ビルドエラーが発生しました',
        fields: [
          { name: 'エラー', value: 'TypeScript compilation failed' },
          { name: 'ファイル', value: 'src/index.ts', inline: true },
        ],
      };

      const result = await callToolMethod('send_textchannel_message', args);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      const response = JSON.parse(result.content[0].text);
      expect(response.status).toBe('success');
    });
  });

  describe('create_thread', () => {
    it('スレッドを作成できる', async () => {
      const args: CreateThreadArgs = {
        threadName: 'リリース確認-v2.0.0',
        initialMessage: {
          title: '🚀 リリース準備完了',
          description: '本番環境にデプロイしてよろしいですか？',
        },
      };

      const result = await callToolMethod('create_thread', args);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      const response = JSON.parse(result.content[0].text);
      expect(response.status).toBe('success');
      expect(response.threadId).toBe('test-thread-789');
      expect(mockDiscordBot.createThread).toHaveBeenCalled();
    });

    it('カラー付きの初期メッセージでスレッドを作成できる', async () => {
      const args: CreateThreadArgs = {
        threadName: 'サポート-2025-01-27',
        initialMessage: {
          title: '🆘 サポート開始',
          description: '問題を報告してください',
          fields: [
            { name: '優先度', value: '高', inline: true },
            { name: '担当者', value: '未割当', inline: true },
          ],
        },
      };

      const result = await callToolMethod('create_thread', args);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      const response = JSON.parse(result.content[0].text);
      expect(response.status).toBe('success');
      expect(response.threadId).toBeTruthy();
    });
  });

  describe('send_thread_message', () => {
    it('待機なしでスレッドにメッセージを送信できる', async () => {
      const args: SendThreadMessageArgs = {
        threadId: 'test-thread-789',
        title: '✅ 受付完了',
        description: '調査して連絡します',
      };

      const result = await callToolMethod('send_thread_message', args);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      const response = JSON.parse(result.content[0].text);
      expect(response.status).toBe('success');
      expect(response.threadId).toBe('test-thread-789');
      expect(response.response).toBeUndefined();
    });

    it('テキスト応答を待機できる', async () => {
      const args: SendThreadMessageArgs = {
        threadId: 'test-thread-789',
        description: 'どのような問題が発生していますか？',
        waitForResponse: {
          type: 'text',
        },
      };

      const result = await callToolMethod('send_thread_message', args);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      const response = JSON.parse(
        result.content[0].text
      ) as ThreadMessageTextResponse;
      expect(response.status).toBe('success');
      expect(response.response.type).toBe('text');
      expect(response.response.text).toBe('ユーザーの返信');
      expect(response.response.userId).toBe('test-user-123');
    });

    it('ボタン応答を待機できる', async () => {
      const args: SendThreadMessageArgs = {
        threadId: 'test-thread-789',
        title: '優先度を選択してください',
        waitForResponse: {
          type: 'button',
          buttons: [
            { label: '🔴 緊急', value: 'high' },
            { label: '🟡 通常', value: 'medium' },
            { label: '🟢 低', value: 'low' },
          ],
        },
      };

      const result = await callToolMethod('send_thread_message', args);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      const response = JSON.parse(
        result.content[0].text
      ) as ThreadMessageButtonResponse;
      expect(response.status).toBe('success');
      expect(response.response.type).toBe('button');
      expect(response.response.value).toBe('yes');
      expect(response.response.userId).toBe('test-user-123');
    });

    it('ボタンタイプでボタンが未定義の場合エラーになる', async () => {
      const args: SendThreadMessageArgs = {
        threadId: 'test-thread-789',
        title: '選択してください',
        waitForResponse: {
          type: 'button',
          // buttons が未定義
        },
      };

      await expect(
        callToolMethod('send_thread_message', args)
      ).rejects.toThrow();
    });
  });

  describe('エラーハンドリング', () => {
    it('Discord 送信エラーを適切に処理する', async () => {
      mockDiscordBot.sendTextChannelMessage = mock(() =>
        Promise.reject(new Error('Discord error'))
      );

      await expect(
        (mcpServer as any).callTool('send_textchannel_message', {
          title: 'test',
        })
      ).rejects.toThrow(
        'Failed to send message to text channel: Discord error'
      );
    });
  });

  describe('タイムアウト処理', () => {
    it('テキスト応答でタイムアウトした場合', async () => {
      mockDiscordBot.sendThreadMessage = mock(
        (
          threadId: string,
          content: any,
          waitForResponse?: any,
          timeout?: number
        ) =>
          Promise.resolve({
            messageId: 'test-message-123',
            threadId: threadId,
            sentAt: '2023-01-01T00:00:00.000Z',
            status: 'success',
            response: {
              type: 'text',
              text: 'timeout',
              userId: undefined,
              responseTime: 60000,
            },
          })
      );

      const args: SendThreadMessageArgs = {
        threadId: 'test-thread-789',
        description: '応答してください',
        waitForResponse: {
          type: 'text',
        },
      };

      const result = await callToolMethod('send_thread_message', args);

      const response = JSON.parse(
        result.content[0].text
      ) as ThreadMessageTextResponse;
      expect(response.response.text).toBe('timeout');
      expect(response.response.userId).toBeUndefined();
    });

    it('ボタン応答でタイムアウトした場合', async () => {
      mockDiscordBot.sendThreadMessage = mock(
        (
          threadId: string,
          content: any,
          waitForResponse?: any,
          timeout?: number
        ) =>
          Promise.resolve({
            messageId: 'test-message-123',
            threadId: threadId,
            sentAt: '2023-01-01T00:00:00.000Z',
            status: 'success',
            response: {
              type: 'button',
              value: 'timeout',
              userId: undefined,
              responseTime: 60000,
            },
          })
      );

      const args: SendThreadMessageArgs = {
        threadId: 'test-thread-789',
        title: '選択してください',
        waitForResponse: {
          type: 'button',
          buttons: [
            { label: 'はい', value: 'yes' },
            { label: 'いいえ', value: 'no' },
          ],
        },
      };

      const result = await callToolMethod('send_thread_message', args);

      const response = JSON.parse(
        result.content[0].text
      ) as ThreadMessageButtonResponse;
      expect(response.response.value).toBe('timeout');
      expect(response.response.userId).toBeUndefined();
    });
  });
});
