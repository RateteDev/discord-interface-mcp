# Discord Interface MCP APIリファレンス

Discord Interface MCPが提供するMCPツールの詳細な仕様とインターフェースについて説明します。

## 利用可能なツール

### 1. send_discord_embed

リッチなEmbedメッセージをDiscordチャンネルに送信します。

#### パラメータ

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| title | string | ❌ | Embedのタイトル（最大256文字） |
| description | string | ❌ | Embedの説明文（最大4096文字） |
| color | number | ❌ | Embedの色（10進数、e.g., 0x00ff00 = 65280） |
| fields | Array | ❌ | フィールドの配列（最大25個） |
| fields[].name | string | ✅* | フィールド名（最大256文字） |
| fields[].value | string | ✅* | フィールド値（最大1024文字） |
| fields[].inline | boolean | ❌ | インライン表示（デフォルト: false） |

\* fieldsを使用する場合は必須

#### 使用例

**基本的なEmbed:**
```json
{
  "tool": "send_discord_embed",
  "arguments": {
    "title": "システム通知",
    "description": "処理が正常に完了しました",
    "color": 65280
  }
}
```

**フィールド付きEmbed:**
```json
{
  "tool": "send_discord_embed",
  "arguments": {
    "title": "ビルド結果",
    "description": "プロジェクトのビルドが完了しました",
    "color": 3066993,
    "fields": [
      {
        "name": "ステータス",
        "value": "✅ 成功",
        "inline": true
      },
      {
        "name": "ビルド時間",
        "value": "2.5秒",
        "inline": true
      },
      {
        "name": "出力ファイル",
        "value": "`dist/index.js` (2.68 MB)",
        "inline": false
      }
    ]
  }
}
```

**レスポンス:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "Embed message sent to Discord successfully"
    }
  ]
}
```

#### カラーコード参考

| 色 | 10進数 | 16進数 | 説明 |
|-----|---------|---------|------|
| 緑 | 65280 | 0x00ff00 | 成功・完了 |
| 赤 | 16711680 | 0xff0000 | エラー・失敗 |
| 黄 | 16776960 | 0xffff00 | 警告・注意 |
| 青 | 255 | 0x0000ff | 情報・通知 |
| 紫 | 10181046 | 0x9b59b6 | 重要 |
| グレー | 9807270 | 0x95a5a6 | 無効・完了 |

### 2. send_discord_embed_with_feedback

フィードバック機能付きのEmbedメッセージをDiscordチャンネルに送信します。Yes/Noボタンが表示され、ユーザーの選択を待機します。

#### パラメータ

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| title | string | ❌ | Embedのタイトル（最大256文字） |
| description | string | ❌ | Embedの説明文（最大4096文字） |
| color | number | ❌ | Embedの色（10進数、e.g., 0x00ff00 = 65280） |
| fields | Array | ❌ | フィールドの配列（最大25個） |
| fields[].name | string | ✅* | フィールド名（最大256文字） |
| fields[].value | string | ✅* | フィールド値（最大1024文字） |
| fields[].inline | boolean | ❌ | インライン表示（デフォルト: false） |
| feedbackPrompt | string | ❌ | ボタンの上に表示するテキスト（デフォルト: "Please select:"） |

\* fieldsを使用する場合は必須

#### 使用例

**フィードバック付きEmbed:**
```json
{
  "tool": "send_discord_embed_with_feedback",
  "arguments": {
    "title": "確認",
    "description": "この操作を実行してもよろしいですか？",
    "color": 16776960,
    "feedbackPrompt": "選択してください:"
  }
}
```

**レスポンス:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\n  \"message\": \"Embed message sent and feedback received\",\n  \"feedback\": {\n    \"response\": \"yes\",\n    \"userId\": \"123456789012345678\",\n    \"responseTime\": 2500\n  }\n}"
    }
  ]
}
```

#### フィードバックレスポンス

| フィールド | 型 | 説明 |
|-----------|-----|------|
| response | string | "yes", "no", または "timeout" |
| userId | string | ボタンをクリックしたユーザーのID（timeoutの場合は無し） |
| responseTime | number | レスポンスまでの時間（ミリ秒） |

## 型定義

### TypeScript インターフェース

```typescript
// MCPツール引数の型定義
interface SendDiscordEmbedArgs {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
}

interface SendDiscordEmbedWithFeedbackArgs {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  feedbackPrompt?: string;
}
```

## エラーハンドリング

すべてのツールは以下の共通エラーを返す可能性があります：

### 共通エラー

| エラーメッセージ | 原因 | 対処法 |
|-----------------|------|--------|
| Discord bot is not ready | Botが起動していない | Botの接続を待つ |
| Failed to send message to Discord | Discord API エラー | ログを確認、権限を確認 |

## 使用上の注意

### レート制限

Discord APIにはレート制限があります：
- **メッセージ送信**: 5メッセージ/5秒 per チャンネル
- **全体**: 50リクエスト/秒

大量のメッセージを送信する場合は適切な間隔を空けてください。

### メッセージの制限

- **テキストメッセージ**: 最大2000文字
- **Embed合計**: 最大6000文字
- **Embedフィールド**: 最大25個
- **Embedタイトル**: 最大256文字
- **Embed説明**: 最大4096文字

### セキュリティ

- ユーザー入力をそのまま送信する場合は、適切なサニタイズを実施
- センシティブな情報（トークン、パスワード等）を含めない
- `@everyone`や`@here`の使用は慎重に

## サンプルコード

### Claude Desktop での使用例

```javascript
// ステータス通知のEmbed送信
await use_mcp_tool({
  server_name: "discord-interface", 
  tool_name: "send_discord_embed",
  arguments: {
    title: "デプロイ完了",
    description: "本番環境へのデプロイが成功しました",
    color: 65280,
    fields: [
      {
        name: "バージョン",
        value: "v1.2.3",
        inline: true
      },
      {
        name: "環境",
        value: "production",
        inline: true
      }
    ]
  }
});
```

### エラー通知の例

```javascript
// エラー通知
await use_mcp_tool({
  server_name: "discord-interface",
  tool_name: "send_discord_embed", 
  arguments: {
    title: "❌ ビルドエラー",
    description: "TypeScriptのコンパイルに失敗しました",
    color: 16711680, // 赤色
    fields: [
      {
        name: "エラー内容",
        value: "```\nsrc/index.ts(10,5): error TS2304: Cannot find name 'foo'.\n```",
        inline: false
      },
      {
        name: "対処法",
        value: "変数 'foo' が定義されていません。スペルを確認してください。",
        inline: false
      }
    ]
  }
});
```

## トラブルシューティング

### よくある質問

**Q: Embedの色が反映されない**  
A: colorパラメータは10進数で指定する必要があります。16進数（0x00ff00）を使用する場合は、10進数（65280）に変換してください。

**Q: フィールドが表示されない**  
A: フィールドのname/valueが空文字の場合、Discordは表示しません。また、25個を超えるフィールドは無視されます。

**Q: メッセージが途中で切れる**  
A: Discordの文字数制限を超えています。長いメッセージは分割して送信してください。

**Q: Markdownが機能しない**  
A: DiscordはGFM（GitHub Flavored Markdown）の一部をサポートしています。利用可能な記法：
- `**太字**`
- `*斜体*`
- `~~取り消し線~~`
- `` `インラインコード` ``
- ` ```コードブロック``` `
- `> 引用`