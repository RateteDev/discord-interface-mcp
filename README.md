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

```bash
# リポジトリのクローン
git clone https://github.com/RateteDev/discord-interface-mcp.git
cd discord-interface-mcp

# 依存関係のインストール
bun install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集してDiscordのトークン等を設定
```

## 環境変数

`.env`ファイルに以下の環境変数を設定してください：

```env
DISCORD_BOT_TOKEN=your-discord-bot-token-here
DISCORD_CLIENT_ID=your-discord-client-id-here
DISCORD_GUILD_ID=your-discord-guild-id-here
```

## 使用方法

```bash
# 開発モードで起動
bun run dev

# ビルド
bun run build

# プロダクション実行
bun run start
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

