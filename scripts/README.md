# 🛠️ Scripts Directory

このディレクトリには、ビルドプロセスで使用されるユーティリティスクリプトが含まれています。

## 📁 ファイル一覧

### `add-shebang.cjs`

**目的**: ビルドされたCLIファイルにshebang行を追加する

**機能詳細**:
- `dist/cli.js`ファイルの先頭に`#!/usr/bin/env node`を追加
- すでにshebangが存在する場合は処理をスキップ
- Unix/Linux/macOSでCLIを実行可能バイナリとして動作させるために必要

**実行タイミング**: 
- `bun run build`コマンドの最終ステップで自動実行
- Bunビルダーがshebangを保持しないため、ビルド後処理として必要

**使用例**:
```bash
# 手動実行
node scripts/add-shebang.cjs

# ビルドプロセスの一部として自動実行
bun run build
```

**技術的背景**:
- Bunビルダーでバンドルされたファイルからはshebangが削除される
- npmパッケージとして配布されるCLIツールには実行可能な形式が必要
- Unix系システムでの実行権限とshebangが必要

## 🔧 開発者向け情報

### スクリプト追加時の注意点

1. **ES Module対応**: プロジェクトは`"type": "module"`を使用しているため、CommonJSスクリプトは`.cjs`拡張子を使用
2. **パス解決**: `__dirname`を使用して相対パスでファイルを参照
3. **エラーハンドリング**: ファイルが見つからない場合は適切にエラー終了

### 関連ファイル

- `package.json`: buildスクリプトでの実行設定
- `dist/cli.js`: shebang追加対象ファイル
- `src/cli.js`: 元のCLIエントリーポイント（shebang付き）