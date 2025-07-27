# Discord Interface MCP サーバーリファレンス

Discord Interface MCPが提供するMCPツールの詳細な仕様とインターフェースについて説明します。

## 利用可能なツール

### 1. send_textchannel_message

テキストチャンネルへの通知専用ツール（応答待機なし）

#### パラメータ

| 名前            | 型      | 必須 | 説明                                |
| --------------- | ------- | ---- | ----------------------------------- |
| title           | string  | ❌    | Embedのタイトル                     |
| description     | string  | ❌    | Embedの説明文                       |
| color           | string  | ❌    | Embedの色（CSS基本16色名のみ）      |
| fields          | Array   | ❌    | フィールドの配列                    |
| fields[].name   | string  | ✅*   | フィールド名                        |
| fields[].value  | string  | ✅*   | フィールド値                        |
| fields[].inline | boolean | ❌    | インライン表示（デフォルト: false） |

\* fieldsを使用する場合は必須

#### 使用例

**シンプルな通知:**
```json
{
  "title": "✅ デプロイ完了",
  "description": "v2.0.0がリリースされました",
  "color": "green"
}
```

**詳細レポート:**
```json
{
  "title": "📊 日次レポート",
  "description": "本日の統計情報",
  "color": "blue",
  "fields": [
    {"name": "アクティブユーザー", "value": "1,234", "inline": true},
    {"name": "新規登録", "value": "56", "inline": true},
    {"name": "エラー数", "value": "0", "inline": true}
  ]
}
```

### 2. create_thread

スレッド作成専用ツール

#### パラメータ

| 名前                       | 型     | 必須 | 説明                           |
| -------------------------- | ------ | ---- | ------------------------------ |
| threadName                 | string | ✅    | スレッド名（1-100文字）        |
| initialMessage             | object | ✅    | 初期メッセージ                 |
| initialMessage.title       | string | ❌    | Embedのタイトル                |
| initialMessage.description | string | ❌    | Embedの説明文                  |
| initialMessage.color       | string | ❌    | Embedの色（CSS基本16色名のみ） |
| initialMessage.fields      | Array  | ❌    | フィールドの配列               |

#### 使用例

```json
{
  "threadName": "リリース確認-v2.0.0",
  "initialMessage": {
    "title": "🚀 リリース準備完了",
    "description": "本番環境にデプロイしてよろしいですか？",
    "color": "yellow"
  }
}
```

#### レスポンス

```json
{
  "sentAt": "2025-01-27T12:00:00.000Z",
  "messageId": "1399000000000000000",
  "channelId": "1230500850779164682",
  "threadId": "1399000000000000001",
  "status": "success"
}
```

### 3. send_thread_message

スレッド内メッセージ送信ツール（テキスト/ボタン応答待機対応）

#### パラメータ

| 名前                            | 型     | 必須 | 説明                                |
| ------------------------------- | ------ | ---- | ----------------------------------- |
| threadId                        | string | ✅    | 送信先スレッドID                    |
| title                           | string | ❌    | Embedのタイトル                     |
| description                     | string | ❌    | Embedの説明文                       |
| color                           | string | ❌    | Embedの色（CSS基本16色名のみ）      |
| fields                          | Array  | ❌    | フィールドの配列                    |
| waitForResponse                 | object | ❌    | 応答待機設定                        |
| waitForResponse.type            | string | ✅*   | 応答タイプ ("text" または "button") |
| waitForResponse.buttons         | Array  | ✅**  | ボタン配列（1-5個）                 |
| waitForResponse.buttons[].label | string | ✅**  | ボタンのラベル（1-80文字）          |
| waitForResponse.buttons[].value | string | ✅**  | ボタンの値（1-100文字）             |

\* waitForResponseを使用する場合は必須
\** type="button"の場合は必須

#### 使用例

**通知のみ（待機なし）:**
```json
{
  "threadId": "1399000000000000001",
  "title": "✅ 処理完了",
  "description": "データベースの更新が完了しました",
  "color": "green"
}
```

**テキスト応答待機:**
```json
{
  "threadId": "1399000000000000001",
  "description": "どのような問題が発生していますか？",
  "waitForResponse": {
    "type": "text"
  }
}
```

**ボタン応答待機:**
```json
{
  "threadId": "1399000000000000001",
  "title": "優先度を選択してください",
  "waitForResponse": {
    "type": "button",
    "buttons": [
      {"label": "🔴 緊急", "value": "high"},
      {"label": "🟡 通常", "value": "medium"},
      {"label": "🟢 低", "value": "low"}
    ]
  }
}
```

#### レスポンス形式

**待機なしの場合:**
```json
{
  "sentAt": "2025-01-27T12:01:00.000Z",
  "messageId": "1399000000000000002",
  "threadId": "1399000000000000001",
  "status": "success"
}
```

**テキスト応答の場合:**
```json
{
  "sentAt": "2025-01-27T12:01:00.000Z",
  "messageId": "1399000000000000002",
  "threadId": "1399000000000000001",
  "status": "success",
  "response": {
    "type": "text",
    "text": "画面が真っ白になります",
    "userId": "293529230900461569",
    "responseTime": 5234
  }
}
```

**ボタン応答の場合:**
```json
{
  "sentAt": "2025-01-27T12:01:00.000Z",
  "messageId": "1399000000000000002",
  "threadId": "1399000000000000001",
  "status": "success",
  "response": {
    "type": "button",
    "value": "high",
    "userId": "293529230900461569",
    "responseTime": 2156
  }
}
```

## 新APIを使った対話フロー例

```javascript
// 1. スレッドを作成
const thread = await tool("create_thread", {
  threadName: "サポート-2025-01-27",
  initialMessage: {
    title: "🆘 サポート開始",
    description: "問題を報告してください"
  }
});

// 2. テキストで問題を聞く
const issue = await tool("send_thread_message", {
  threadId: thread.threadId,
  description: "どのような問題が発生していますか？",
  waitForResponse: { type: "text" }
});

// 3. 優先度をボタンで選択
const priority = await tool("send_thread_message", {
  threadId: thread.threadId,
  title: "優先度を選択してください",
  fields: [
    { name: "報告された問題", value: issue.response.text }
  ],
  waitForResponse: {
    type: "button",
    buttons: [
      { label: "🔴 緊急", value: "high" },
      { label: "🟡 通常", value: "medium" },
      { label: "🟢 低", value: "low" }
    ]
  }
});

// 4. 受付完了（待機なし）
await tool("send_thread_message", {
  threadId: thread.threadId,
  title: "✅ 受付完了",
  description: "調査して連絡します",
  color: "green",
  fields: [
    { name: "問題", value: issue.response.text },
    { name: "優先度", value: priority.response.value }
  ]
});
```
