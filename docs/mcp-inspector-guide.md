# 🔍 MCP Inspector ガイド

## 📚 概要

MCP Inspector は、MCP (Model Context Protocol) サーバーのテストとデバッグを行うための開発者向けツールです。視覚的なWebUIとCLIの両方を提供し、MCPサーバーの動作を効率的にテストできます。

## 📦 使い方

```bash
DISCORD_BOT_TOKEN=foo
DISCORD_GUILD_ID=bar
DISCORD_TEXT_CHANNEL_ID=baz
npx @modelcontextprotocol/inspector node dist/index.js \
    -e DISCORD_BOT_TOKEN=${DISCORD_BOT_TOKEN:?DISCORD_BOT_TOKEN not set} \
    -e DISCORD_GUILD_ID=${DISCORD_GUILD_ID:?DISCORD_GUILD_ID not set} \
    -e DISCORD_TEXT_CHANNEL_ID=${DISCORD_TEXT_CHANNEL_ID:?DISCORD_TEXT_CHANNEL_ID not set}
```

## 🔗 関連リンク

- [MCP Inspector GitHub リポジトリ](https://github.com/modelcontextprotocol/inspector)
- [Model Context Protocol 公式ドキュメント](https://modelcontextprotocol.io/)
- [Online MCP Inspector](https://onlinemcpinspector.com/)
