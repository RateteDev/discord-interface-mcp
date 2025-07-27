# Discord Interface MCP ドキュメント

Discord Interface MCPの技術ドキュメントです。このプロジェクトはModel Context Protocol (MCP)を通じてDiscordにメッセージを送信する機能を提供します。

## 📚 ドキュメント一覧

### 基本情報
- [インストールガイド](install-guide.md) - インストールと初期設定
- [アーキテクチャ](architecture.md) - システム構成と設計思想

### 開発者向け
- [MCPサーバーリファレンス](mcp-server-reference.md) - ツールとインターフェースの詳細
- [実装ガイド](implementation-guide.md) - 拡張開発のための実装詳細


## 🚀 クイックスタート

1. Discord Botを作成し、サーバーに招待
2. 環境変数を設定（`.env`ファイル）
3. `bun install` で依存関係をインストール
4. `bun run build` でビルド
5. MCPクライアントに設定を追加

詳細は[インストールガイド](install-guide.md)を参照してください。

## 📝 バージョン情報

- **現在のバージョン**: 0.1.0
- **Phase**: 1（一方向通信実装済み）
- **更新日**: 2025-07-25