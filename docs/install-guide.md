# Discord Interface MCP クイックインストールガイド

このガイドでは、Claude DesktopやClaude Codeに`discord-interface-mcp`を最も簡単にインストールする方法を説明します。

## 前提条件

- Node.js 18以上
- Claude DesktopまたはClaude Code
- Discord Botの準備（[setup-guide.md](./setup-guide.md)参照）

## Claude Desktop での設定

### 1. 必要な情報を準備

以下の情報を事前に用意してください：
- `DISCORD_BOT_TOKEN`: Discord Botのトークン
- `DISCORD_GUILD_ID`: 使用するサーバー（ギルド）のID
- `DISCORD_TEXT_CHANNEL_ID`: メッセージを送信するチャンネルのID

### 2. 設定ファイルを編集

Claude Desktopの設定ファイルを開きます：

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Linux**: `~/.config/Claude/claude_desktop_config.json`

### 3. MCPサーバー設定を追加

以下の設定を`mcpServers`セクションに追加します：

```json
{
  "mcpServers": {
    "discord-interface": {
      "command": "npx",
      "args": ["discord-interface-mcp"],
      "env": {
        "DISCORD_BOT_TOKEN": "YOUR_BOT_TOKEN_HERE",
        "DISCORD_GUILD_ID": "YOUR_GUILD_ID_HERE",
        "DISCORD_TEXT_CHANNEL_ID": "YOUR_CHANNEL_ID_HERE"
      }
    }
  }
}
```

> **注意**: `YOUR_*_HERE`の部分を実際の値に置き換えてください

### 4. Claude Desktopを再起動

設定を反映させるため、Claude Desktopを完全に終了してから再起動します。

## Claude Code での設定

### 1. Claude Codeをインストール

```bash
npm install -g @anthropic-ai/claude-code
```

### 2. CLIでMCPサーバーを追加

プロジェクトディレクトリで以下のコマンドを実行：

**Bash/Zsh:**
```bash
# MCPサーバーを追加（環境変数付き）
claude mcp add discord-interface \
  --command npx \
  --args discord-interface-mcp \
  --env DISCORD_BOT_TOKEN="YOUR_BOT_TOKEN_HERE" \
  --env DISCORD_GUILD_ID="YOUR_GUILD_ID_HERE" \
  --env DISCORD_TEXT_CHANNEL_ID="YOUR_CHANNEL_ID_HERE"
```

**PowerShell:**
```powershell
# MCPサーバーを追加（環境変数付き）
claude mcp add discord-interface `
  --command npx `
  --args discord-interface-mcp `
  --env DISCORD_BOT_TOKEN="YOUR_BOT_TOKEN_HERE" `
  --env DISCORD_GUILD_ID="YOUR_GUILD_ID_HERE" `
  --env DISCORD_TEXT_CHANNEL_ID="YOUR_CHANNEL_ID_HERE"
```

> **注意**: `YOUR_*_HERE`の部分を実際の値に置き換えてください

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

## オプション設定

### フィードバックタイムアウト

フィードバック機能のタイムアウトを設定する場合：

**Claude Desktop:**
```json
"env": {
  "DISCORD_BOT_TOKEN": "...",
  "DISCORD_GUILD_ID": "...",
  "DISCORD_TEXT_CHANNEL_ID": "...",
  "DISCORD_FEEDBACK_TIMEOUT_SECONDS": "30"
}
```

**Claude Code:**
```bash
claude mcp add discord-interface \
  --command npx \
  --args discord-interface-mcp \
  --env DISCORD_BOT_TOKEN="..." \
  --env DISCORD_GUILD_ID="..." \
  --env DISCORD_TEXT_CHANNEL_ID="..." \
  --env DISCORD_FEEDBACK_TIMEOUT_SECONDS="30"
```

## 動作確認

1. Claude DesktopまたはClaude Codeを起動
2. MCPツールが利用可能か確認
3. 以下のツールが表示されることを確認：
   - `send_discord_embed`
   - `send_discord_embed_with_feedback`

## トラブルシューティング

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
- `.gitignore`に設定ファイルのパスを追加することを推奨します

## 次のステップ

- Discord Botの作成がまだの場合は[setup-guide.md](./setup-guide.md)を参照
- 使用方法については[api-reference.md](./api-reference.md)を参照

## npxを使用する利点

- 事前のインストールが不要
- 常に最新版を自動的に使用
- グローバルな名前空間を汚染しない
- 異なるプロジェクトで異なるバージョンを使用可能