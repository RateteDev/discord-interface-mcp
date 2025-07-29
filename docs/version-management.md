# バージョン管理ガイド

## 📋 概要

このドキュメントでは、`discord-interface-mcp`パッケージのバージョン管理方法について説明します。

## 🔄 自動公開システム

### GitHub Actions による自動公開の流れ

mainブランチへプッシュされると、**常に**以下の処理が実行されます：

1. **ビルド&テスト**: コードの品質確認
2. **バージョン一致チェック**: `package.json`と`manifest.json`のバージョンが一致することを確認
3. **バージョンチェック**: `package.json`のバージョンと既公開版を比較

**バージョンが変更されている場合のみ**、以下が追加実行されます：

4. **npm公開**: 新しいバージョンをnpmレジストリに公開
5. **タグ作成**: `v{version}`形式でGitタグを自動作成
6. **DXTパッケージビルド**: Desktop Extensions形式のパッケージを生成
7. **GitHub Release作成**: リリースノートとDXTファイルを含む自動リリース

## 📝 新バージョンをリリースする手順

### ステップ1: バージョン番号を決める

まず、どのレベルのバージョンアップかを決定します：

- **PATCH（例: 1.0.0 → 1.0.1）**: バグ修正のみ
- **MINOR（例: 1.0.0 → 1.1.0）**: 新機能追加（破壊的変更なし）
- **MAJOR（例: 1.0.0 → 2.0.0）**: 破壊的変更あり

### ステップ2: バージョンファイルを更新

以下のファイルのバージョンを**同じ値**に変更する：

#### package.json
```json
{
  "version": "1.0.1"  // 新しいバージョン番号に変更
}
```

#### manifest.json (DXT形式)
```json
{
  "version": "1.0.1"  // package.jsonと同じバージョン番号に変更
}
```

**⚠️ 重要**: `package.json`と`manifest.json`のバージョンは必ず一致させてください。CIでバージョン不一致を検知します。

### ステップ3: mainブランチに反映

#### PullRequestを使用

```bash
# 1. 新しいブランチを作成
git checkout -b release/v1.0.1

# 2. バージョンファイルを編集
# package.json と manifest.json の "version": "1.0.1" に変更

# 3. 変更をコミット
git add package.json manifest.json
git commit -m "chore: version bump to 1.0.1"
git push origin release/v1.0.1

# 4. GitHubでPRを作成→mainにマージ
```

**PRマージ後、自動的に以下が実行されます：**
- ✅ npm公開
- ✅ GitHub Release作成（DXTファイル付き）
- ✅ Gitタグ作成

## 📝 GitHubリリースの自動作成

バージョンが更新されると、GitHub Actionsが**自動的に**GitHubリリースを作成します。

### 自動生成される内容

npm公開成功時に以下が自動実行されます：

1. **リリースタグの作成**: `v{version}`形式
2. **DXTファイルの添付**: One-clickインストール用パッケージ
3. **リリースノートの生成**: 定型フォーマットでの自動作成

### 自動生成されるリリースノート形式

```markdown
## 🚀 Discord Interface MCP v{version}

### 📦 インストール方法

#### One-click インストール (DXT)
1. discord-interface-mcp-{version}.dxt をダウンロード
2. Claude Desktop > File> Settings > Add Extension > Select DXT file
3. ダウンロードしたファイルを選択
4. 必要な設定を入力

### 📝 変更内容
[完全な変更履歴を見る](比較リンク)

---
🤖 Generated with Claude Code
```

