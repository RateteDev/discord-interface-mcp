# Discord Interface MCP

Discordを介してModel Context Protocol (MCP)サーバーと対話できるようにするプロジェクト

## 概要

Discord Interface MCPは、Discordをインターフェースとして活用することで、MCPサーバーの機能をより身近で使いやすくするプロジェクトです。慣れ親しんだDiscordのUIを通じて、複数人での利用、通知機能、読み上げ機能などを活用できます。

### なぜDiscord？

- **複数人利用**: チームやコミュニティでの共同利用が可能
- **通知機能**: 重要な情報をリアルタイムで受け取れる
- **読み上げ機能**: Discord の音声機能と連携可能
- **リッチなUI**: Embedを使った視覚的に分かりやすい表示
- **どこでも利用**: モバイルアプリからでもアクセス可能
- **慣れ親しんだUI**: 多くの人が既に使い慣れているインターフェース

## 開発ロードマップ

### Phase 1: 一方向通信（実装中）
- MCPサーバーからDiscordへのメッセージ送信
- 基本的な通知機能の実装

### Phase 2: 双方向対話
- DiscordからMCPサーバーへのコマンド送信
- インタラクティブな対話機能

### Phase 3: 高機能UI
- Discord Embedを使用したリッチな表示
- ボタンやセレクトメニューなどのインタラクティブコンポーネント

## インストール

詳細なインストール手順については[install-guide.md](./docs/install-guide.md)を参照してください。

### クイックスタート

Claude Desktopの設定ファイル（`claude_desktop_config.json`）に以下を追加：

```json
{
  "mcpServers": {
    "discord-interface": {
      "command": "npx",
      "args": ["discord-interface-mcp"],
      "env": {
        "DISCORD_BOT_TOKEN": "your-bot-token",
        "DISCORD_GUILD_ID": "your-guild-id",
        "DISCORD_TEXT_CHANNEL_ID": "your-channel-id"
      }
    }
  }
}
```

## 必要な設定

以下の情報が必要です：

- `DISCORD_BOT_TOKEN`: Discord Botのトークン
- `DISCORD_GUILD_ID`: 使用するサーバーのID
- `DISCORD_TEXT_CHANNEL_ID`: メッセージを送信するチャンネルのID


## 使用方法

### 利用可能なツール

- `send_discord_embed`: Embedメッセージを送信
- `send_discord_embed_with_feedback`: フィードバック機能付きEmbedを送信

詳細なMCPサーバーリファレンスは[mcp-server-reference.md](./docs/mcp-server-reference.md)を参照してください。

### 開発者向け

```bash
# 開発モードで起動
bun run dev

# ビルド
bun run build

# プロダクション実行
bun run start

# テスト実行
bun test
```

## プロジェクト構造

```
discord-interface-mcp/
├── src/
│   ├── discord/    # Discord bot関連のコード
│   ├── mcp/        # MCP server実装
│   ├── types/      # TypeScript型定義
│   └── utils/      # ユーティリティ関数
├── .env.example    # 環境変数のテンプレート
├── package.json    # プロジェクト設定
└── tsconfig.json   # TypeScript設定
```

## 技術スタック

- **[Bun](https://bun.sh/)**: 高速なJavaScriptランタイム
- **[discord.js](https://discord.js.org/)**: Discord bot開発用ライブラリ
- **[@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)**: MCP実装用SDK
- **TypeScript**: 型安全な開発

## ライセンス

GPLv3

