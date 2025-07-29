# Discord Interface MCP 🛰️

> Discord の親しみやすい UI を活用し、AIとのやりとりをもっとどこでも、手軽に。

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/discord-interface-mcp)](https://www.npmjs.com/package/discord-interface-mcp)

## 目次

- [Discord Interface MCP 🛰️](#discord-interface-mcp-️)
  - [目次](#目次)
  - [主要機能](#主要機能)
  - [インストール](#インストール)
  - [必要な認証情報](#必要な認証情報)
  - [MCP Tools](#mcp-tools)
  - [プロジェクト構成](#プロジェクト構成)
  - [技術スタック](#技術スタック)
  - [ライセンス](#ライセンス)

## 主要機能

* **マルチユーザー対応** — チームやコミュニティで共同で利用可能
* **通知** — Discord の通知機能で情報を即座に受け取れる
* **リッチ UI** — Embed やボタンで直感的に閲覧・操作が可能
* **スレッド対応** — Discord スレッドで継続的な対話が可能
* **クロスプラットフォーム** — モバイルアプリ・ブラウザ・PC からアクセス可能
* **多言語対応** — 日本語・英語のメッセージに対応
* **自動情報付加** — Author情報・タイムスタンプ・状態色を自動設定
* **視覚的フィードバック** — テキスト応答時にEmbedの色を青→緑に変更して応答受信を視覚化

## インストール

[docs/install-guide.md](./docs/install-guide.md) を参照。

## 必要な認証情報

| 環境変数                  | 説明                          | 必須 | デフォルト値 |
| ------------------------- | ----------------------------- | ---- | ------------ |
| `DISCORD_BOT_TOKEN`       | Discord Bot のトークン        | ✅   | -            |
| `DISCORD_GUILD_ID`        | 使用するサーバー (Guild) ID   | ✅   | -            |
| `DISCORD_TEXT_CHANNEL_ID` | メッセージ送信用チャンネル ID | ✅   | -            |
| `DISCORD_LOCALE`          | メッセージ言語 (ja/en)        | ❌   | en           |
| `DISCORD_RESPONSE_TIMEOUT_SECONDS` | 応答待機タイムアウト（秒） | ❌   | -            |

[.env.exanple](./.env.exanple) を参照。

## MCP Tools

| コマンド                 | 説明                                                   |
| ------------------------ | ------------------------------------------------------ |
| `send_textchannel_message` | テキストチャンネルへ通知を送信                          |
| `create_thread`            | スレッドを作成                                         |
| `send_thread_message`      | スレッドへメッセージ送信（テキスト/ボタン応答待機対応） |

詳細は [docs/mcp-server-reference.md](./docs/mcp-server-reference.md) を参照。

## プロジェクト構成

```text
discord-interface-mcp/
├─ src/
│  ├─ discord/    # Discord bot
│  ├─ mcp/        # MCP server
│  ├─ types/      # TypeScript 型定義
│  └─ utils/      # 共通ユーティリティ
├─ .env.example    # 環境変数テンプレート
├─ package.json    # プロジェクト設定
└─ tsconfig.json   # TypeScript 設定
```

## 技術スタック

* **[TypeScript](https://github.com/microsoft/TypeScript)**
* **[Bun](https://bun.sh/)**
* **[discord.js](https://discord.js.org/)**
* **[@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)**

## ライセンス

[GPL-3.0](https://www.gnu.org/licenses/gpl-3.0.ja.html#license-text)
