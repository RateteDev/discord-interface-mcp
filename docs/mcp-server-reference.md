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
