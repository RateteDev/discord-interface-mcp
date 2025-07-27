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
* **クロスプラットフォーム** — モバイルアプリ・ブラウザ・PC からアクセス可能

## インストール

[docs/install-guide.md](./docs/install-guide.md) を参照。

## 必要な認証情報

| 環境変数                  | 説明                          |
| ------------------------- | ----------------------------- |
| `DISCORD_BOT_TOKEN`       | Discord Bot のトークン        |
| `DISCORD_GUILD_ID`        | 使用するサーバー (Guild) ID   |
| `DISCORD_TEXT_CHANNEL_ID` | メッセージ送信用チャンネル ID |

## MCP Tools

| コマンド                           | 説明                            |
| ---------------------------------- | ------------------------------- |
| `send_discord_embed`               | Embed メッセージを送信          |
| `send_discord_embed_with_feedback` | フィードバック付き Embed を送信 |

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

* **TypeScript**
* **[Bun](https://bun.sh/)**
* **[discord.js](https://discord.js.org/)**
* **[@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)**

## ライセンス

GPL-3.0 © 2025 Discord Interface MCP Contributors
