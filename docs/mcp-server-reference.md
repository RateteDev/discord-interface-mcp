# Discord Interface MCP サーバーリファレンス

Discord Interface MCPが提供するMCPツールの詳細な仕様とインターフェースについて説明します。

## 利用可能なツール

### 1. send_discord_embed

リッチなEmbedメッセージをDiscordチャンネルに送信します。

#### パラメータ

| 名前            | 型               | 必須 | 説明                                 |
| --------------- | ---------------- | ---- | ------------------------------------ |
| title           | string           | ❌    | Embedのタイトル                         |
| description     | string           | ❌    | Embedの説明文                          |
| color           | string           | ❌    | Embedの色（CSS基本16色名のみ）       |
| fields          | Array            | ❌    | フィールドの配列                      |
| fields[].name   | string           | ✅*   | フィールド名                          |
| fields[].value  | string           | ✅*   | フィールド値                          |
| fields[].inline | boolean          | ❌    | インライン表示（デフォルト: false）  |

\* fieldsを使用する場合は必須

#### 色の指定

**使用可能な色（CSS基本16色）:**

| グレースケール | 赤系 | 緑系 | 青系 |
|---|---|---|---|
| black | maroon | green | navy |
| gray | red | lime | blue |
| silver | purple | olive | teal |
| white | fuchsia | yellow | aqua |

#### 使用例

**デプロイ通知:**
```json
{
  "title": "✅ Production Deploy Complete",
  "description": "Version 2.1.4 has been successfully deployed to production.",
  "color": "green",
  "fields": [
    {
      "name": "Version",
      "value": "v2.1.4",
      "inline": true
    },
    {
      "name": "Duration",
      "value": "3m 42s",
      "inline": true
    },
    {
      "name": "Changes",
      "value": "• Bug fix: Login error\n• Feature: Dark mode\n• Performance improvements",
      "inline": false
    }
  ]
}
```

**エラー通知:**
```json
{
  "title": "❌ Build Failed",
  "description": "TypeScript compilation failed in main branch",
  "color": "red",
  "fields": [
    {
      "name": "Error",
      "value": "```\nsrc/index.ts(10,5): error TS2304: Cannot find name 'foo'.\n```",
      "inline": false
    }
  ]
}
```

### 2. send_discord_embed_with_feedback

フィードバック機能付きのEmbedメッセージを送信し、ユーザーの選択を待機します。

#### パラメータ

| 名前                    | 型               | 必須 | 説明                                                 |
| ----------------------- | ---------------- | ---- | ---------------------------------------------------- |
| title                   | string           | ❌    | Embedのタイトル                                      |
| description             | string           | ❌    | Embedの説明文                                        |
| color                   | string           | ❌    | Embedの色（CSS基本16色名のみ）                      |
| fields                  | Array            | ❌    | フィールドの配列                                     |
| feedbackPrompt          | string           | ❌    | ボタンの説明テキスト（デフォルト: "Please select:"） |
| feedbackButtons         | Array            | ❌    | カスタムボタン（1-5個、未指定時はYes/No）            |
| feedbackButtons[].label | string           | ✅*   | ボタンのラベル（1-80文字）                           |
| feedbackButtons[].value | string           | ✅*   | ボタンの値（1-100文字）                              |

\* feedbackButtonsを使用する場合は必須

#### 使用例

**リリース確認:**
```json
{
  "title": "🚀 Ready to Release v2.1.4",
  "description": "All tests passed and staging looks good. Proceed with production release?",
  "color": "yellow",
  "feedbackButtons": [
    {"label": "Deploy to Production", "value": "deploy"},
    {"label": "Hold Release", "value": "hold"},
    {"label": "Rollback", "value": "rollback"}
  ]
}
```

**障害対応:**
```json
{
  "title": "⚠️ Database Connection Error",
  "description": "Primary database is unreachable. Choose recovery action:",
  "color": "red",
  "feedbackButtons": [
    {"label": "Restart Service", "value": "restart"},
    {"label": "Switch to Backup", "value": "failover"},
    {"label": "Manual Investigation", "value": "investigate"}
  ]
}
```

#### レスポンス形式

```json
{
  "sentAt": "2025-07-27T10:45:53.560Z",
  "messageId": "1398979701019774998",
  "channelId": "1230500850779164682",
  "status": "success",
  "feedback": {
    "response": "deploy",
    "userId": "293529230900461569",
    "responseTime": 3991
  }
}
```

### send_discord_embed_with_thread

Discord に Embed メッセージを送信し、新しいスレッドを作成します。

#### パラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| title | string | いいえ | Embed のタイトル |
| description | string | いいえ | Embed の説明 |
| color | string | いいえ | Embed の色（CSS基本16色名） |
| fields | array | いいえ | Embed フィールドの配列 |
| threadName | string | **はい** | 作成するスレッドの名前（1-100文字） |

#### 使用例

**バグレポート用スレッドの作成:**
```json
{
  "title": "🐛 バグレポート受付",
  "description": "このスレッドでバグの詳細を報告してください",
  "color": "red",
  "threadName": "バグ報告-2025-01-27"
}
```

**機能提案用スレッドの作成:**
```json
{
  "title": "💡 新機能提案",
  "description": "新機能のアイデアをこのスレッドで共有してください",
  "color": "blue",
  "threadName": "機能提案-ダークモード"
}
```

#### レスポンス形式

```json
{
  "sentAt": "2025-01-27T10:45:53.560Z",
  "messageId": "1398979701019774998",
  "channelId": "1230500850779164682",
  "status": "success",
  "threadId": "1398979701234567890"
}
```

### reply_to_thread

既存のスレッドに Embed メッセージで返信し、オプションでユーザーの応答を待機します。

**視覚的な装飾:**
- 返信待ちの場合（`waitForReply: true`）：
  - Embedの下部に「💬 返信をお待ちしています...」というフッターが自動追加されます
  - 色が指定されていない場合、青色（#0099FF）がデフォルトで設定されます
  - タイムスタンプが表示されます
- 返信不要の場合（`waitForReply: false`）：
  - 特別な装飾は追加されません
  - 指定された色がそのまま使用されます

#### パラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| threadId | string | **はい** | 返信先のスレッドID |
| title | string | いいえ | Embed のタイトル |
| description | string | いいえ | Embed の説明 |
| color | string | いいえ | Embed の色（CSS基本16色名） |
| fields | array | いいえ | Embed フィールドの配列 |
| waitForReply | boolean | いいえ | ユーザーの応答を待機するか（デフォルト: true） |

#### 使用例

**質問して応答を待つ場合:**
```json
{
  "threadId": "1398979701234567890",
  "title": "📋 詳細確認",
  "description": "どのような問題が発生していますか？",
  "color": "blue"
}
```

**複数回の対話:**
```json
{
  "threadId": "1398979701234567890",
  "title": "📋 追加情報",
  "description": "いつから発生していますか？",
  "fields": [
    {"name": "前回の回答", "value": "画面が真っ白になります"}
  ],
  "color": "blue"
}
```

**確認メッセージ（応答不要）:**
```json
{
  "threadId": "1398979701234567890",
  "title": "✅ 受付完了",
  "description": "ご報告ありがとうございました。調査して後日連絡します。",
  "color": "green",
  "waitForReply": false
}
```

#### レスポンス形式

**応答を待つ場合（waitForReply: true）:**
```json
{
  "sentAt": "2025-01-27T10:46:30.123Z",
  "messageId": "1398979801234567890",
  "threadId": "1398979701234567890",
  "status": "success",
  "userReply": {
    "message": "今朝のアップデート後からです",
    "userId": "293529230900461569",
    "responseTime": 8523
  }
}
```

**応答を待たない場合（waitForReply: false）:**
```json
{
  "sentAt": "2025-01-27T10:47:15.789Z",
  "messageId": "1398979901234567890",
  "threadId": "1398979701234567890",
  "status": "success"
}
```

**タイムアウトした場合:**
```json
{
  "sentAt": "2025-01-27T10:46:30.123Z",
  "messageId": "1398979801234567890",
  "threadId": "1398979701234567890",
  "status": "success",
  "userReply": {
    "message": "timeout",
    "responseTime": 60000
  }
}
```

## 使用例：継続的な対話フロー

```javascript
// 1. スレッドを作成
const thread = await tool("send_discord_embed_with_thread", {
  title: "🐛 バグレポート",
  description: "バグの詳細を報告してください",
  threadName: "バグ報告-2025-01-27"
});

// 2. 最初の質問
const response1 = await tool("reply_to_thread", {
  threadId: thread.threadId,
  description: "どのような問題が発生していますか？"
});
// ユーザー: "画面が真っ白になります"

// 3. 追加の質問
const response2 = await tool("reply_to_thread", {
  threadId: thread.threadId,
  description: "いつから発生していますか？",
  fields: [
    {name: "問題", value: response1.userReply.message}
  ]
});
// ユーザー: "今朝のアップデート後からです"

// 4. 受付完了（応答不要）
await tool("reply_to_thread", {
  threadId: thread.threadId,
  title: "✅ 受付完了",
  description: "調査して連絡します",
  waitForReply: false
});
```
