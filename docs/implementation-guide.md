# Discord Interface MCP 実装ガイド

このガイドでは、Discord Interface MCPの内部実装と拡張方法について説明します。

## アーキテクチャ概要

```
┌─────────────────┐     JSON-RPC      ┌──────────────┐     WebSocket    ┌─────────────┐
│  MCP Client     │ ◄──────────────► │  MCP Server  │ ◄──────────────► │  Discord    │
│ (Claude等)      │      stdio        │              │                   │  Gateway    │
└─────────────────┘                   └──────────────┘                   └─────────────┘
                                             │
                                             ▼
                                      ┌──────────────┐
                                      │ Discord Bot  │
                                      └──────────────┘
```

## コンポーネント詳細

### 1. エントリーポイント (`src/index.ts`)

アプリケーションの起動とコンポーネントの初期化を管理します。

```typescript
// 主要な責務
1. 環境変数の読み込みと検証
2. Discord Botの初期化と起動
3. MCP Serverの初期化と起動
4. グレースフルシャットダウンの処理
```

**重要な実装ポイント:**
- Bot準備完了の待機処理（最大30秒）
- プロセスシグナル（SIGINT/SIGTERM）のハンドリング
- エラー時の適切な終了処理

### 2. Discord Bot (`src/discord/bot.ts`)

Discord.jsを使用したBot実装です。

**主要メソッド:**

```typescript
class DiscordBot {
  // Botの開始
  async start(): Promise<void>
  
  // メッセージ送信（テキスト/Embed両対応）
  async sendMessage(content: string | MessageCreateOptions): Promise<void>
  
  // Botの停止
  async stop(): Promise<void>
  
  // 準備状態の確認
  getIsReady(): boolean
}
```

**実装の特徴:**
- 必要最小限のIntents（Guilds, GuildMessages, MessageContent）
- 型安全なチャンネル送信処理
- 自動再接続（Discord.js内蔵）

### 3. MCP Server (`src/mcp/server.ts`)

Model Context Protocolサーバーの実装です。

**ツール実装の流れ:**

```typescript
1. listTools() - 利用可能なツールを定義
2. callTool() - ツールの実行をルーティング
3. sendDiscordMessage() / sendDiscordEmbed() - 実際の処理
```

**重要な実装ポイント:**
- 標準入出力（stdio）を使用した通信
- 型安全な引数処理（unknown → 型アサーション）
- エラーの適切な伝播

## 型システム

### 型定義の構成

```
src/types/
├── discord.ts  # Discord関連の型定義
└── mcp.ts      # MCP関連の型定義
```

**型の使用例:**

```typescript
// MCPツール引数の型定義
interface SendDiscordMessageArgs {
  content: string;
}

// 使用時の型アサーション
const typedArgs = args as SendDiscordMessageArgs;
```

## 環境変数とロギング

### 環境変数管理 (`src/utils/env.ts`)

znvとzodを使用した型安全な環境変数管理：

```typescript
export const env = parseEnv(process.env, {
  DISCORD_BOT_TOKEN: z.string().min(1),
  DISCORD_GUILD_ID: z.string().min(1),
  // ... その他の設定
});
```

### ロギング (`src/utils/logger.ts`)

pinoを使用した構造化ログ：

```typescript
// 重要: stderrへの出力（MCPプロトコルとの競合回避）
destination: 2  // 2 = stderr
```

## 新しいツールの追加方法

### ステップ1: 型定義の追加

`src/types/mcp.ts`に新しいツールの引数型を追加：

```typescript
export interface SendDiscordReactionArgs {
  messageId: string;
  emoji: string;
}
```

### ステップ2: ツール定義の追加

`src/mcp/server.ts`の`listTools()`メソッドに追加：

```typescript
{
  name: "send_discord_reaction",
  description: "Add a reaction to a Discord message",
  inputSchema: {
    type: "object",
    properties: {
      messageId: {
        type: "string",
        description: "The ID of the message to react to"
      },
      emoji: {
        type: "string", 
        description: "The emoji to react with"
      }
    },
    required: ["messageId", "emoji"]
  }
}
```

### ステップ3: 実装の追加

`callTool()`メソッドにケースを追加：

```typescript
case "send_discord_reaction":
  return this.sendDiscordReaction(args);
```

実装メソッドを追加：

```typescript
private async sendDiscordReaction(args: unknown): Promise<CallToolResult> {
  const typedArgs = args as SendDiscordReactionArgs;
  
  // バリデーション
  if (!typedArgs.messageId || !typedArgs.emoji) {
    throw new Error("Missing required parameters");
  }
  
  try {
    // Discord Botのメソッドを呼び出し
    await this.discordBot.addReaction(
      typedArgs.messageId, 
      typedArgs.emoji
    );
    
    return {
      content: [{
        type: "text",
        text: "Reaction added successfully"
      }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to add reaction: ${errorMessage}`);
  }
}
```

### ステップ4: Bot機能の実装

`src/discord/bot.ts`に新しいメソッドを追加：

```typescript
async addReaction(messageId: string, emoji: string): Promise<void> {
  if (!this.isReady) {
    throw new Error("Bot is not ready");
  }
  
  const channel = this.client.channels.cache.get(this.config.textChannelId);
  if (!channel || !channel.isTextBased()) {
    throw new Error("Invalid channel");
  }
  
  try {
    const message = await channel.messages.fetch(messageId);
    await message.react(emoji);
  } catch (error) {
    logger.error("Failed to add reaction:", error);
    throw error;
  }
}
```

### ステップ5: テストの追加

適切なテストケースを追加して、新機能が正しく動作することを確認します。

## テスト戦略

### 単体テスト

各コンポーネントを独立してテスト：

```typescript
// Discord Botのモック
const mockClient = {
  login: vi.fn(),
  channels: {
    cache: new Map()
  },
  // ...
};
```

### 統合テスト

実際のMCPサーバーとDiscord Botの連携をテスト：

```typescript
// MCPツール呼び出しのテスト
const result = await mcpServer.callTool("send_discord_message", {
  content: "Test message"
});
```

## デバッグ方法

### 1. ログレベルの調整

```env
LOG_LEVEL=debug
```

### 2. MCP Inspector の使用

```bash
npx @modelcontextprotocol/inspector \
  -e LOG_LEVEL=debug \
  bun src/index.ts
```

### 3. 開発モードでの実行

```bash
bun run dev
```

## パフォーマンス考慮事項

### メモリ管理
- Discord.jsのキャッシュサイズに注意
- 不要なIntentsを無効化してメモリ使用量を削減

### レート制限
- Discord APIのレート制限を考慮
- 必要に応じてキューイングシステムの実装を検討

## セキュリティベストプラクティス

1. **環境変数の保護**
   - `.env`ファイルをGitにコミットしない
   - 本番環境では環境変数を安全に管理

2. **入力検証**
   - ユーザー入力は必ず検証
   - SQLインジェクション等の攻撃を防ぐ

3. **権限の最小化**
   - Botに必要最小限の権限のみ付与
   - 不要なチャンネルへのアクセスを制限

## トラブルシューティング

### よくある実装の問題

**問題: TypeScriptの型エラー**
```typescript
// エラー: Property 'send' does not exist on type 'TextBasedChannel'
// 解決: 型ガードを使用
if ('send' in channel) {
  await channel.send(content);
}
```

**問題: 環境変数が読み込まれない**
```typescript
// 解決: znvのエラーメッセージを確認
// 必要な環境変数がすべて設定されているか確認
```

**問題: MCPプロトコルエラー**
```typescript
// 解決: ログがstdoutに出力されていないか確認
// destination: 2 (stderr) が設定されているか確認
```

## 今後の拡張可能性

### Phase 2: 双方向通信
- Discordからのコマンド受信
- インタラクティブなボタン/メニュー

### Phase 3: 高度な機能
- ファイルアップロード
- 音声チャンネル対応
- スレッド管理

### コミュニティ貢献

プルリクエストを歓迎します！貢献の際は：
1. 型安全性を維持
2. 適切なテストを追加
3. ドキュメントを更新

詳細は[CONTRIBUTING.md](../CONTRIBUTING.md)を参照してください。