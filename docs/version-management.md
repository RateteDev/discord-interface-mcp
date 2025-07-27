# バージョン管理ガイド

## 📋 概要

このドキュメントでは、`discord-interface-mcp`パッケージのバージョン管理方法について説明します。

## 🔄 自動公開システム

### GitHub Actions による自動公開

mainブランチへのプッシュ時に以下の処理が自動実行されます：

1. **ビルド&テスト**: コードの品質確認
2. **バージョンチェック**: 既公開版との比較
3. **npm公開**: バージョンが異なる場合のみ公開
4. **タグ作成**: `v{version}`形式でGitタグを自動作成

### 🎯 動作条件

- ✅ **mainブランチへの直プッシュ**
- ✅ **PRマージ後のmainプッシュ**
- ✅ **バージョンが変更されている場合のみ**

## 📝 バージョンアップ手順

### 1. バージョン番号の更新

`package.json`のバージョンを更新：

```json
{
  "version": "1.0.1"  // 例: 1.0.0 → 1.0.1
}
```

### 2. 変更内容の確認

現在のプロジェクトでは、以下のファイルのみ更新が必要：

| ファイル | 更新内容 | 必須 |
|---------|---------|------|
| `package.json` | `version`フィールド | ✅ |
| `bun.lock` | 自動更新（手動変更不要） | - |

### 3. 公開方法

#### 方法1: PRを使用（推奨）

```bash
# フィーチャーブランチを作成
git checkout -b release/v1.0.1

# package.jsonのバージョンを更新
# エディタで "version": "1.0.1" に変更

# コミットしてPR作成
git add package.json
git commit -m "chore: version bump to 1.0.1"
git push origin release/v1.0.1

# GitHubでPRを作成してmainにマージ
```

#### 方法2: 直接mainにプッシュ

```bash
# mainブランチで直接更新
git checkout main
git pull origin main

# package.jsonのバージョンを更新
# エディタで "version": "1.0.1" に変更

# コミットしてプッシュ
git add package.json
git commit -m "chore: version bump to 1.0.1"
git push origin main
```

## 🏷️ セマンティックバージョニング

以下の規則に従ってバージョンを決定：

### MAJOR.MINOR.PATCH (例: 1.2.3)

- **MAJOR**: 破壊的な変更
  - APIの仕様変更
  - 設定形式の変更
  - Node.js要件の変更
- **MINOR**: 後方互換性のある機能追加
  - 新しいツールの追加
  - 新しいオプションの追加
- **PATCH**: 後方互換性のあるバグ修正
  - バグ修正
  - ドキュメント修正
  - パフォーマンス改善

### 例

```
1.0.0 → 1.0.1  (バグ修正)
1.0.1 → 1.1.0  (新機能追加)
1.1.0 → 2.0.0  (破壊的変更)
```

## 🔍 公開状況の確認

### npmでの確認

```bash
# 最新の公開バージョンを確認
npm view discord-interface-mcp version

# 詳細情報を確認
npm view discord-interface-mcp
```

### GitHub Actionsでの確認

1. GitHubリポジトリの**Actions**タブを開く
2. **Publish to npm**ワークフローを確認
3. 実行ログで公開状況を確認

### Gitタグでの確認

```bash
# ローカルのタグ一覧
git tag

# リモートのタグ一覧
git ls-remote --tags origin
```

## 📝 GitHubリリースの作成

npm公開後に手動でGitHubリリースを作成することを推奨します。

### 🖱️ GitHubのWebUIから

1. GitHubリポジトリの**Releases**セクションを開く
2. **Create a new release**をクリック
3. 作成されたタグ（`v{version}`）を選択
4. リリースタイトルとノートを記入

### 💻 GitHub CLIから

```bash
# 現在のバージョンでリリースを作成
VERSION=$(node -p "require('./package.json').version")
gh release create "v$VERSION" \
  --title "Release v$VERSION" \
  --notes "リリース内容をここに記述" \
  --generate-notes
```

### 📋 リリースノートテンプレート

```markdown
## 🚀 Version {version}

### ✨ 新機能
- 

### 🐛 バグ修正
- 

### 📚 ドキュメント
- 

### 🔧 その他
- 

---
📦 **インストール**
\`\`\`bash
npx discord-interface-mcp@{version}
\`\`\`

🔗 **リンク**
- [npm package](https://www.npmjs.com/package/discord-interface-mcp/v/{version})
- [インストールガイド](./docs/install-guide.md)
```

## 🎨 npxを使用するメリット

このパッケージは`npx`での使用を推奨しています：

### ✅ ユーザーのメリット

- **事前インストール不要**: `npm install -g`が不要
- **常に最新版**: 実行時に最新版を自動取得
- **複数バージョン対応**: プロジェクトごとに異なるバージョンを使用可能
- **グローバル汚染なし**: システムを汚染しない

### 🔄 自動更新の仕組み

```bash
# ユーザーが実行
npx discord-interface-mcp

# 内部的に以下が実行される:
# 1. 最新版のチェック
# 2. 必要に応じてダウンロード
# 3. 実行
```

## 🚨 注意事項

### セキュリティ

- **NPM_TOKEN**: GitHub Secretsで安全に管理
- **自動タグ**: 公開成功時のみ作成
- **権限確認**: npm公開権限の定期確認

### リリース前の確認

- [ ] ローカルでのビルド確認: `bun run build`
- [ ] テストの実行: `bun test`
- [ ] ドキュメントの更新
- [ ] CHANGELOGの更新（今後実装予定）

## 🔗 関連リンク

- [npm package](https://www.npmjs.com/package/discord-interface-mcp)
- [GitHub Repository](https://github.com/RateteDev/discord-interface-mcp)
- [GitHub Actions Workflow](./.github/workflows/publish.yml)