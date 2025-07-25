# Discord Interface MCP 動的テスト手順書

## 前提条件

- [x] 静的テスト完了（TypeScript型チェック: ✅、単体テスト: 25/25 ✅、ビルド: ✅）
- [x] Discord開発者ポータルでBotを作成済み
- [x] Botをテスト用サーバーに招待済み
- [x] 環境変数設定済み（`.env`ファイル）

## テスト環境情報

| 項目            | 値                                     | 確認 |
| --------------- | -------------------------------------- | ---- |
| Bot Token       | `YOUR_BOT_TOKEN_HERE`                  | ✅    |
| Guild ID        | `YOUR_GUILD_ID_HERE`                   | ✅    |
| Text Channel ID | `YOUR_CHANNEL_ID_HERE`                 | ✅    |
| Application ID  | `YOUR_APP_ID_HERE`                     | ✅    |

## 動的テスト手順

### 1. Discord Bot単体の動作確認

#### 1.1 開発モードでの起動

```bash
cd D:/repo/discord-interface-mcp
bun run dev
```

**期待される結果:**
- [x] コンソールに "Discord Interface MCP starting..." が表示される
- [x] コンソールに "Discord Bot logged in as [Bot名]" が表示される
- [x] コンソールに "Discord bot is ready!" が表示される
- [x] エラーが発生しない

**実際の結果:**
```powershell
PS D:\repo\discord-interface-mcp> bun run dev
$ bun run --watch src/index.ts
[2025-07-25 22:28:55] INFO: Discord Interface MCP starting...
[2025-07-25 22:28:55] INFO: settings.appName: My Awesome App
[2025-07-25 22:28:55] INFO: Discord Bot Token: YOUR******
[2025-07-25 22:28:55] INFO: Discord Guild ID: YOUR_GUILD_ID
[2025-07-25 22:28:55] INFO: Discord Text Channel ID: YOUR_CHANNEL_ID
[2025-07-25 22:28:55] INFO: Starting Discord bot...
[2025-07-25 22:28:57] INFO: Discord Bot logged in as TEST#4937
[2025-07-25 22:28:57] INFO: Discord bot is ready!
[2025-07-25 22:28:57] INFO: Starting MCP server...
[2025-07-25 22:28:57] INFO: MCP server started
[2025-07-25 22:28:57] INFO: Discord Interface MCP is running successfully!
```

#### 1.2 Discord側の確認

**確認項目:**
- [x] Discordサーバーで Bot がオンライン状態になっている
- [x] Bot に緑色の●マークが付いている

### 2. MCP サーバーとしての動作確認

#### 2.1 MCPクライアントからの接続テスト

**別のターミナルで実行:**
```bash
# MCPクライアント（例：Claude Desktop）の設定に追加
# claude_desktop_config.json に以下を追加:
{
  "mcpServers": {
    "discord-interface": {
      "command": "node",
      "args": ["D:/repo/discord-interface-mcp/dist/index.js"]
    }
  }
}
```

**期待される結果:**
- [ ] MCPクライアントから "discord-interface" サーバーが認識される
- [ ] 利用可能なツールリストに以下が表示される：
  - send_discord_message
  - send_discord_embed

**実際の結果:**
```
file:///D:/repo/discord-interface-mcp/dist/index.js:68852
    throw new Error(reporter(errors, schemas));
          ^

Error: Errors found while parsing environment:
  [DISCORD_BOT_TOKEN]:
    This field is required.
    (received undefined)

  [DISCORD_CLIENT_ID]:
    This field is required.
    (received undefined)

  [DISCORD_GUILD_ID]:
    This field is required.
    (received undefined)

  [DISCORD_TEXT_CHANNEL_ID]:
    This field is required.
    (received undefined)

    at parseEnvImpl (file:///D:/repo/discord-interface-mcp/dist/index.js:68852:11)
    at parseEnv (file:///D:/repo/discord-interface-mcp/dist/index.js:68884:7)
    at file:///D:/repo/discord-interface-mcp/dist/index.js:68887:12
    at ModuleJob.run (node:internal/modules/esm/module_job:329:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:644:26)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:117:5)

Node.js v22.17.0
```

必須の環境変数が設定されていないことによるエラーが発生しました。

### 3. エンドツーエンドテスト

#### 3.1 テキストメッセージ送信テスト

**MCPクライアントから実行:**
```json
{
  "tool": "send_discord_message",
  "arguments": {
    "content": "テストメッセージ from MCP! 🎉"
  }
}
```

**期待される結果:**
- [ ] 指定したDiscordチャンネルにメッセージが表示される
- [ ] コンソールに送信成功ログが表示される
- [ ] MCPクライアントに成功レスポンスが返る

**実際の結果:**
```
記入欄：
```

#### 3.2 Embedメッセージ送信テスト

**MCPクライアントから実行:**
```json
{
  "tool": "send_discord_embed",
  "arguments": {
    "title": "MCP動作テスト",
    "description": "これは動的テストのEmbedメッセージです",
    "color": 5814783,
    "fields": [
      {
        "name": "ステータス",
        "value": "✅ 正常動作",
        "inline": true
      },
      {
        "name": "時刻",
        "value": "2025-07-25 12:00",
        "inline": true
      }
    ]
  }
}
```

**期待される結果:**
- [ ] Discordチャンネルにリッチなembed表示される
- [ ] タイトル、説明、色、フィールドが正しく表示される

**実際の結果:**
```
記入欄：
```

### 4. エラーハンドリングテスト

#### 4.1 Bot停止中のテスト

**手順:**
1. Ctrl+C でBotを停止
2. MCPクライアントからメッセージ送信を試行

**期待される結果:**
- [ ] "Discord bot is not ready" エラーが返される
- [ ] アプリケーションがクラッシュしない

**実際の結果:**
```
記入欄：
```

#### 4.2 無効なパラメータテスト

**MCPクライアントから実行:**
```json
{
  "tool": "send_discord_message",
  "arguments": {}
}
```

**期待される結果:**
- [ ] "Missing required parameter: content" エラーが返される

**実際の結果:**
```
記入欄：
```

### 5. 負荷テスト

#### 5.1 連続送信テスト

**10回連続でメッセージを送信:**
```bash
# 簡易スクリプトで10回送信
for i in {1..10}; do
  echo "Message $i"
  # MCPツール呼び出し
done
```

**期待される結果:**
- [ ] すべてのメッセージが正常に送信される
- [ ] Discord API レート制限に引っかからない
- [ ] メモリリークが発生しない

**実際の結果:**
```
記入欄：
```

## トラブルシューティング

### よくある問題と対処法

1. **Bot がオンラインにならない**
   - Bot Tokenが正しいか確認
   - インターネット接続を確認
   - Discord開発者ポータルでBotが有効か確認

2. **メッセージが送信されない**
   - チャンネルIDが正しいか確認
   - Botがチャンネルへのアクセス権限を持っているか確認
   - サーバーでBotの権限を確認

3. **MCP接続エラー**
   - Node.jsのパスが正しいか確認
   - dist/index.js が存在するか確認
   - 環境変数が正しく設定されているか確認

## テスト完了チェックリスト

- [ ] すべての基本機能が正常動作
- [ ] エラーハンドリングが適切
- [ ] パフォーマンスに問題なし
- [ ] ログが適切に出力される
- [ ] グレースフルシャットダウンが機能する

## 総合評価

**テスト実施日時:** _______________

**テスト実施者:** _______________

**総合結果:**
- [ ] ✅ 合格（すべてのテストに合格）
- [ ] ⚠️ 条件付き合格（軽微な問題あり）
- [ ] ❌ 不合格（重大な問題あり）

**コメント:**
```
記入欄：
```

## 次のステップ

1. 本番環境への展開準備
2. ドキュメントの最終確認
3. 監視・アラート設定
4. バックアップ・リカバリ手順の確立
