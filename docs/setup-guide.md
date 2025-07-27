# Discord Interface MCP セットアップガイド

このガイドでは、Discord Interface MCPの初期セットアップから実際の動作確認までを説明します。

## 前提条件

- **Node.js** v18以上または**Bun** 1.0以上
- **Discord アカウント**と管理権限を持つサーバー
- **Claude Desktop**またはMCP対応クライアント

## 1. Discord Bot の作成

### 1.1 Discord Developer Portal での設定

1. [Discord Developer Portal](https://discord.com/developers/applications)にアクセス
2. 「New Application」をクリックしてアプリケーションを作成
3. 左メニューの「Bot」を選択
4. 「Reset Token」をクリックしてトークンを生成（後で使用）

### 1.2 Bot の権限設定

Botセクションで以下の権限を有効化：
- **Send Messages** - メッセージ送信
- **Embed Links** - Embedメッセージ送信
- **Read Message History** - メッセージ履歴読み取り（オプション）

### 1.3 Bot をサーバーに招待

1. 左メニューの「OAuth2」→「URL Generator」を選択
2. Scopesで「bot」を選択
3. Bot Permissionsで必要な権限を選択
4. 生成されたURLにアクセスしてBotを招待

## 2. プロジェクトのセットアップ

### 2.1 npxで直接実行（推奨）

最も簡単な方法は、npmパッケージとして公開されているものを直接実行することです：

```bash
# インストール不要で直接実行
npx discord-interface-mcp

# またはグローバルインストール
npm install -g discord-interface-mcp
discord-interface-mcp
```

### 2.2 ソースコードから実行

開発やカスタマイズを行う場合：

```bash
# リポジトリのクローン
git clone https://github.com/RateteDev/discord-interface-mcp.git
cd discord-interface-mcp

# 依存関係のインストール
bun install  # または npm install
```

### 2.3 環境変数の設定

プロジェクトルートに`.env`ファイルを作成：

```env
# Discord設定
DISCORD_BOT_TOKEN=your-bot-token-here
DISCORD_GUILD_ID=your-guild-id-here
DISCORD_TEXT_CHANNEL_ID=your-channel-id-here

# ログレベル（オプション）
LOG_LEVEL=info
NODE_ENV=production
```

#### 環境変数の取得方法

- **DISCORD_BOT_TOKEN**: Developer Portalで生成したトークン
- **DISCORD_GUILD_ID**: サーバーを右クリック→「IDをコピー」
- **DISCORD_TEXT_CHANNEL_ID**: チャンネルを右クリック→「IDをコピー」

> **注意**: Discord開発者モードを有効にする必要があります（設定→詳細設定→開発者モード）

## 3. ビルドと実行

### 3.1 プロジェクトのビルド

```bash
bun run build
```

これにより`dist/index.js`が生成されます。

### 3.2 開発モードでの実行（テスト用）

```bash
bun run dev
```

以下のようなログが表示されれば成功です：
```
[2025-07-25 22:28:55] INFO: Discord Interface MCP starting...
[2025-07-25 22:28:57] INFO: Discord Bot logged in as YourBot#1234
[2025-07-25 22:28:57] INFO: Discord bot is ready!
[2025-07-25 22:28:57] INFO: MCP server started
```

## 4. MCPクライアントの設定

### 4.1 Claude Desktop の設定

Claude Desktopの設定ファイル（`claude_desktop_config.json`）に以下を追加：

#### npxを使用する場合（推奨）

```json
{
  "mcpServers": {
    "discord-interface": {
      "command": "npx",
      "args": ["discord-interface-mcp"],
      "env": {
        "DISCORD_BOT_TOKEN": "your-bot-token",
        "DISCORD_CHANNEL_ID": "your-channel-id"
      }
    }
  }
}
```

#### ローカルビルドを使用する場合

```json
{
  "mcpServers": {
    "discord-interface": {
      "command": "node",
      "args": ["D:/repo/discord-interface-mcp/dist/index.js"],
      "env": {
        "NODE_ENV": "production",
        "DISCORD_BOT_TOKEN": "your-bot-token",
        "DISCORD_GUILD_ID": "your-guild-id",
        "DISCORD_TEXT_CHANNEL_ID": "your-channel-id"
      }
    }
  }
}
```

### 4.2 設定ファイルの場所

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

## 5. 動作確認

### 5.1 Claude Desktop でのテスト

1. Claude Desktopを再起動
2. ツールが認識されているか確認
3. 以下のツールが利用可能になります：
   - `send_discord_message` - テキストメッセージ送信
   - `send_discord_embed` - Embedメッセージ送信

### 5.2 MCP Inspector でのテスト

開発時のデバッグには[MCP Inspector](https://github.com/modelcontextprotocol/inspector)が便利です：

```bash
# 環境変数を直接指定して実行
npx @modelcontextprotocol/inspector \
  -e DISCORD_BOT_TOKEN=your-token \
  -e DISCORD_GUILD_ID=your-guild-id \
  -e DISCORD_TEXT_CHANNEL_ID=your-channel-id \
  bun src/index.ts
```

## トラブルシューティング

### Bot がオンラインにならない
- Botトークンが正しいか確認
- インターネット接続を確認
- `.env`ファイルが正しく読み込まれているか確認

### メッセージが送信されない
- チャンネルIDが正しいか確認
- Botがチャンネルへのアクセス権限を持っているか確認
- チャンネルがテキストチャンネルであることを確認

### MCPクライアントで認識されない
- ビルドが成功しているか確認（`dist/index.js`が存在するか）
- 設定ファイルのパスが正しいか確認
- Claude Desktopを完全に再起動

### ログメッセージの確認
エラーの詳細はstderr出力に記録されます。開発モードで実行してログを確認してください。

## 次のステップ

セットアップが完了したら、[APIリファレンス](api-reference.md)でツールの使用方法を確認してください。