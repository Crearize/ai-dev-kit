# ai-dev-kit

AI コーディングツール（Claude Code, Cursor）のための汎用開発基盤テンプレート。

スキル、ルール、レビューガイド、開発ドキュメントを一元管理し、セットアップスクリプトで任意のプロジェクト・個人環境に導入できます。

## クイックスタート

### プロジェクト初期化

```bash
# macOS / Linux
./setup.sh init

# Windows (PowerShell)
.\setup.ps1 init
```

### 個人環境セットアップ

```bash
# macOS / Linux
./setup.sh personal

# Windows (PowerShell)
.\setup.ps1 personal
```

## 対応 AI ツール

- **Claude Code** — `.claude/skills/`, `.claude/rules/`, `CLAUDE.md`
- **Cursor** — `.cursor/skills/`, `.cursor/rules/*.mdc`, `.cursorrules`

## リポジトリ構造

| ディレクトリ | 内容 |
|-------------|------|
| `skills/superpowers/` | superpowers から抽出した開発プロセススキル（GitHub Actions で自動同期） |
| `skills/project/` | 汎用プロジェクトスキル（品質チェック、ブランチワークフロー等） |
| `stacks/` | 技術スタック別のルール・レビューガイド・ドキュメント |
| `shared/` | 技術スタック非依存のドキュメント・レビュー基準 |
| `templates/` | CLAUDE.md 等の雛形（プレースホルダー付き） |
| `configs/` | AI ツール別セットアップロジック |
| `scripts/` | 内部ユーティリティ |

## 技術スタック

> **Note**: ルール・レビューガイド・ドキュメント類は Next.js (React) + Spring Boot (Java) をベースに記述されています。
> 他の技術スタックを使用する場合は、プロジェクトに合わせてカスタマイズしてください。

### 利用可能なスタック

- `nextjs-react` — Next.js + React（フロントエンド）
- `java-springboot` — Java + Spring Boot（バックエンド）

新しいスタックを追加するには、`stacks/_template/` をコピーして記述してください。

## superpowers 自動同期

`skills/superpowers/` は [superpowers](https://github.com/obra/superpowers) プラグインから抽出したスキルです。
GitHub Actions が毎日新バージョンをチェックし、更新があれば自動で PR を作成します。

## ライセンス

MIT
