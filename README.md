# Bun Template

Bunで開発するためのテンプレート

## Scripts
```bash
# Run in development mode
bun run dev

# Build, output to dist/index.js
bun run build

# Run dist/index.js
bun run start

# Deploy, Replace with your deploy script
bun run deploy
```

## Dependencies

### Dependencies
- [Pino](https://github.com/pinojs/pino): ログ出力
- [zod](https://github.com/colinhacks/zod): 型バリデーション
- [znv](https://github.com/lostfictions/znv/tree/master): 環境変数管理


### DevDependencies
- [@types/bun](https://www.npmjs.com/package/@types/bun): bunの型定義
- [pino-pretty](https://github.com/pinojs/pino-pretty): pinoのpretty print(色付き・整形しての表示)

