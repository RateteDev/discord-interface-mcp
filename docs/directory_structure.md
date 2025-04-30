# ディレクトリ構造

## assets
- プロジェクトで使用するデータを格納する

## docs
- プロジェクトのドキュメントを格納する

## src

### utils
- env.ts: znvを使用して環境変数を管理、必ず環境変数を利用する場合はここからインポートする
- logger.ts: pinoを使用してログ出力、NODE_ENVがproductionの場合はpino-prettyを使用して色付き・整形しての表示

### index.ts
- プロジェクトのエントリーポイント

## tests
- プロジェクトのテストを格納する


