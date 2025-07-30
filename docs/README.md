# Discord Interface MCP ドキュメント

Discord Interface MCPの技術ドキュメントです。このプロジェクトはModel Context Protocol (MCP)を通じてDiscordにメッセージを送信する機能を提供します。

## 📚 ドキュメント一覧

### 基本情報
- [インストールガイド](install-guide.md) - インストールと初期設定
- [アーキテクチャ](architecture.md) - システム構成と設計思想

### 開発者向け
- [MCPサーバーリファレンス](mcp-server-reference.md) - ツールとインターフェースの詳細
- [MCP Inspector ガイド](mcp-inspector-guide.md) - MCP Inspectorの使い方とテスト方法
- [バージョン管理方法](version-management.md) - バージョンアップにおける仕組みとCDプロセス

## 🚀 クイックスタート

1. Discord Botを作成し、サーバーに招待
2. 環境変数を設定（`.env`ファイル）
3. `bun install` で依存関係をインストール
4. `bun run build` でビルド
5. MCPクライアントに設定を追加

詳細は[インストールガイド](install-guide.md)を参照してください。
