# 🔍 MCP Inspector ガイド

## 📚 概要

MCP Inspector は、MCP (Model Context Protocol) サーバーのテストとデバッグを行うための開発者向けツールです。視覚的なWebUIとCLIの両方を提供し、MCPサーバーの動作を効率的にテストできます。

## 🎯 主要機能

### アーキテクチャ
- **MCP Inspector Client (MCPI)**: React ベースの Web UI
- **MCP Proxy (MCPP)**: Node.js サーバー（プロトコルブリッジとして機能）

### 特徴
- 複数のトランスポート方式をサポート（stdio, SSE, streamable-http）
- ビジュアルテスト機能
- 高度なログ記録とエラー追跡
- ツール実行監視
- UI モードと CLI モード両方をサポート

## 📦 インストール方法

### 基本的な使用方法
リポジトリをクローンする必要はありません。`npx` を使用して直接実行できます。

```bash
# 基本的な実行（ビルド済みサーバーの場合）
npx @modelcontextprotocol/inspector node build/index.js

# 引数を渡す場合
npx @modelcontextprotocol/inspector build/index.js arg1 arg2

# 設定ファイルを使用する場合
npx @modelcontextprotocol/inspector --config path/to/config.json --server server-name
```

### このプロジェクトでの使用方法

1. **プロジェクトをビルド**
   ```bash
   bun run build
   ```

2. **MCP Inspector を起動**
   ```bash
   npx @modelcontextprotocol/inspector node dist/index.js
   ```

3. **設定ファイルを使用する場合**
   ```bash
   npx @modelcontextprotocol/inspector --config .claude-workspace/mcp-inspector-test.json --server discord-interface-test
   ```

## 🖥️ 使用方法

### UI モード
1. MCP Inspector を起動すると、Web UI が自動的に開きます
2. デフォルトアクセス先: http://localhost:6274
3. 認証トークンが自動的に設定されたURLが表示されます

### CLI モード
プログラム的な操作や自動化に適しています：

```bash
# CLI モードで起動
npx @modelcontextprotocol/inspector node dist/index.js --mode cli

# 特定のツールをテスト
npx @modelcontextprotocol/inspector node dist/index.js --mode cli --tool send_message

# リソースの一覧表示
npx @modelcontextprotocol/inspector node dist/index.js --mode cli --list-resources
```

## ⚙️ 設定ファイル

### 基本的な設定ファイル構造
```json
{
  "mcpServers": {
    "server-name": {
      "command": "node",
      "args": ["path/to/server.js"],
      "env": {
        "ENV_VAR": "value"
      }
    }
  }
}
```

### このプロジェクト用の設定例
```json
{
  "mcpServers": {
    "discord-interface-test": {
      "command": "node",
      "args": ["D:/repo/discord-interface-mcp/dist/index.js"],
      "env": {
        "NODE_ENV": "development",
        "DISCORD_BOT_TOKEN": "your-test-token",
        "DISCORD_GUILD_ID": "your-guild-id",
        "DISCORD_TEXT_CHANNEL_ID": "your-channel-id"
      }
    }
  }
}
```

## 🔒 セキュリティ機能

### 認証
- デフォルトで認証が有効
- セッショントークンが自動生成される
- ローカルネットワークのみでアクセス可能

### セッショントークンの例
```
🔑 Session token: 3a1c267fad21f7150b7d624c160b7f09b0b8c4f623c7107bbf13378f051538d4
🔗 Open inspector with token pre-filled: 
http://localhost:6274/?MCP_PROXY_AUTH_TOKEN=3a1c267fad21f7150b7d624c160b7f09b0b8c4f623c7107bbf13378f051538d4
```

## 🧪 テスト方法

### 1. 基本的なサーバー接続テスト
```bash
# サーバーが正常に起動するかテスト
npx @modelcontextprotocol/inspector node dist/index.js
```

### 2. 個別ツールのテスト
Web UI から以下をテストできます：
- **Tools**: `send_message`, `send_embed` などの Discord 操作
- **Resources**: 利用可能なリソースの一覧とアクセス
- **Prompts**: プロンプトテンプレートの動作確認

### 3. 環境変数のテスト
```bash
# 本番環境に近い設定でテスト
DISCORD_BOT_TOKEN=your-token DISCORD_GUILD_ID=your-guild npx @modelcontextprotocol/inspector node dist/index.js
```

## 🛠️ トラブルシューティング

### よくある問題と解決方法

#### 1. サーバーが起動しない
```bash
# ビルドが完了しているか確認
ls -la dist/index.js

# 必要な依存関係がインストールされているか確認
bun install
```

#### 2. 認証エラー
- セッショントークンが正しく設定されているか確認
- ブラウザのキャッシュをクリア
- URLにトークンが含まれているか確認

#### 3. Discord 接続エラー
- `DISCORD_BOT_TOKEN` が正しく設定されているか確認
- ボットがサーバーに招待されているか確認
- 必要な権限が付与されているか確認

#### 4. ポート競合
```bash
# カスタムポートを指定
npx @modelcontextprotocol/inspector --port 8080 node dist/index.js
```

### ログの確認
```bash
# デバッグモードで起動
DEBUG=mcp:* npx @modelcontextprotocol/inspector node dist/index.js
```

## 🌐 代替ツール

### Online MCP Inspector
- URL: https://onlinemcpinspector.com/
- インストール不要のブラウザベースツール
- リモートサーバーのテストに便利

### MCPJam Inspector
- URL: https://www.mcpjam.com/
- Claude、GPT、Ollama モデルとの統合テスト機能

## 📝 開発のベストプラクティス

1. **段階的テスト**: 基本的な接続から始めて、徐々に複雑な機能をテスト
2. **設定ファイルの活用**: 複数の環境設定を管理しやすくする
3. **ログの活用**: エラー時は詳細なログを確認する
4. **セキュリティ**: 本番トークンをテスト設定に含めない

## 🔗 関連リンク

- [MCP Inspector GitHub リポジトリ](https://github.com/modelcontextprotocol/inspector)
- [Model Context Protocol 公式ドキュメント](https://modelcontextprotocol.io/)
- [Online MCP Inspector](https://onlinemcpinspector.com/)