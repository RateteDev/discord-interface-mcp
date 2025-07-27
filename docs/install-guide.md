# Discord Interface MCP クイックインストールガイド

このガイドでは、Claude DesktopやClaude Codeに`discord-interface-mcp`を最も簡単にインストールする方法を説明します。

## 前提条件

- Node.js 18以上
- Claude DesktopまたはClaude Code
- Discord アカウントと管理権限を持つサーバー

## Discord Bot の作成

### 1. Discord Developer Portal での設定

1. [Discord Developer Portal](https://discord.com/developers/applications)にアクセス
2. 「New Application」をクリックしてアプリケーションを作成
3. 左メニューの「Bot」を選択
4. 「Reset Token」をクリックしてトークンを生成（後で使用）
5. 「Privileged Gateway Intents」セクションで以下を有効化：
   - **MESSAGE CONTENT INTENT** - メッセージ内容の読み取り（スレッド応答に必要）

### 2. Bot の権限設定

Botセクションで以下の権限を有効化：
- **Send Messages** - メッセージ送信
- **Embed Links** - Embedメッセージ送信
- **Create Public Threads** - パブリックスレッドの作成
- **Send Messages in Threads** - スレッド内でのメッセージ送信
- **Read Message History** - メッセージ履歴読み取り
- **Add Reactions** - リアクションの追加

### 3. Bot をサーバーに招待

1. 左メニューの「OAuth2」→「URL Generator」を選択
2. Scopesで「bot」を選択
3. Bot Permissionsで必要な権限を選択
4. 生成されたURLにアクセスしてBotを招待

### 4. 必要な情報を取得

以下の情報を取得してメモしておきます：

- **DISCORD_BOT_TOKEN**: Developer Portalで生成したトークン
- **DISCORD_GUILD_ID**: サーバーを右クリック→「IDをコピー」
- **DISCORD_TEXT_CHANNEL_ID**: チャンネルを右クリック→「IDをコピー」

> **注意**: Discord開発者モードを有効にする必要があります（設定→詳細設定→開発者モード）

## Claude Desktop での設定

### 1. 設定ファイルを編集

Claude Desktopの設定ファイルを開きます：

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

### 2. MCPサーバー設定を追加

以下の設定を`mcpServers`セクションに追加します：

```jsonc
{
  "mcpServers": {
    "discord-interface": {
      "command": "npx",
      "args": ["discord-interface-mcp"],
      "env": {
        "DISCORD_BOT_TOKEN": "YOUR_BOT_TOKEN_HERE",
        "DISCORD_GUILD_ID": "YOUR_GUILD_ID_HERE",
        "DISCORD_TEXT_CHANNEL_ID": "YOUR_CHANNEL_ID_HERE",
        "DISCORD_FEEDBACK_TIMEOUT_SECONDS": "30" // optional: フィードバックタイムアウト（デフォルトはタイムアウト無し）
      }
    }
  }
}
```

> **注意**: `YOUR_*_HERE`の部分を実際の値に置き換えてください

### 3. Claude Desktopを再起動

設定を反映させるため、Claude Desktopを完全に終了してから再起動します。

## Claude Code での設定

### 1. Claude Codeをインストール

```bash
npm install -g @anthropic-ai/claude-code
```

### 2. CLIでMCPサーバーを追加

プロジェクトディレクトリで以下のコマンドを実行：

**Bash/Zsh (macOS/Linux):**
```bash
claude mcp add discord-interface npx discord-interface-mcp \
  -e DISCORD_BOT_TOKEN="YOUR_BOT_TOKEN_HERE" \
  -e DISCORD_GUILD_ID="YOUR_GUILD_ID_HERE" \
  -e DISCORD_TEXT_CHANNEL_ID="YOUR_CHANNEL_ID_HERE" \
  -e DISCORD_FEEDBACK_TIMEOUT_SECONDS="30" # optional
```

**PowerShell (Windows):**
```powershell
claude mcp add discord-interface cmd /c npx discord-interface-mcp `
  -e DISCORD_BOT_TOKEN="YOUR_BOT_TOKEN_HERE" `
  -e DISCORD_GUILD_ID="YOUR_GUILD_ID_HERE" `
  -e DISCORD_TEXT_CHANNEL_ID="YOUR_CHANNEL_ID_HERE" `
  -e DISCORD_FEEDBACK_TIMEOUT_SECONDS="30" # optional
```

> **注意**: `YOUR_*_HERE`の部分を実際の値に置き換えてください
> 
> ⚠️ **セキュリティ**: コマンド実行後は履歴からトークンを削除することを推奨します

### 3. Claude Codeを起動

```bash
cd your-project
claude
```

### 設定の確認と管理

```bash
# 追加されたMCPサーバーの一覧を表示
claude mcp list

# MCPサーバーを削除する場合
claude mcp remove discord-interface
```


## 動作確認

1. Claude DesktopまたはClaude Codeを起動
2. MCPツールが利用可能か確認
3. 以下のツールが表示されることを確認：
   - `send_discord_embed`
   - `send_discord_embed_with_feedback`

## トラブルシューティング

### Bot がオンラインにならない
- Botトークンが正しいか確認
- インターネット接続を確認

### メッセージが送信されない
- チャンネルIDが正しいか確認
- Botがチャンネルへのアクセス権限を持っているか確認
- チャンネルがテキストチャンネルであることを確認

### MCPサーバーが表示されない

1. JSON構文が正しいか確認（カンマの位置など）
2. Node.jsがインストールされているか確認：
   ```bash
   node --version  # v18以上である必要があります
   ```
3. ログファイルを確認：
   - Windows: `%APPDATA%\Claude\logs\`
   - macOS: `~/Library/Logs/Claude/`
   - Linux: `~/.config/Claude/logs/`

### 接続エラーが発生する

1. Discord Botトークンが正しいか確認
2. BotがサーバーとチャンネルにアクセスできるかDiscordで確認
3. ファイアウォールやアンチウイルスソフトがブロックしていないか確認

## セキュリティ上の注意

- Discord Botトークンは秘密情報です。他人と共有しないでください
- 設定ファイルをGitにコミットしないよう注意してください

## 次のステップ

- 使用方法については[mcp-server-reference.md](./mcp-server-reference.md)を参照
- 開発者向けの情報は[implementation-guide.md](./implementation-guide.md)を参照
