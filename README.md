# ai-dev-helm

AI コーディングツール（Claude Code, Cursor）のための汎用開発基盤テンプレートです。

「AI に開発を手伝ってもらいたいけど、毎回同じことを教えるのが面倒」「チーム全員が同じ品質基準で AI を使いたい」——そんな課題を解決します。

## ai-dev-helm でできること

- **スキル**: AI に「やり方」を教える手順書。設計→計画→実装→テスト→レビューの開発フロー全体をカバー
- **ルール**: AI が守るべきコーディング規約。言語・フレームワークごとに定義
- **レビューガイド**: AI がコードレビューする際のチェックリスト
- **開発ドキュメント**: コーディング規約、命名規則、API 設計規約などのベストプラクティス集
- **セットアップ自動化**: 1 コマンドでプロジェクトに導入。Claude Code と Cursor の両方に対応

---

## 目次

- [クイックスタート](#クイックスタート)
- [セットアップの流れ（詳細）](#セットアップの流れ詳細)
- [スキル一覧](#スキル一覧)
- [リポジトリ構造](#リポジトリ構造)
- [セットアップ後のプロジェクト構造](#セットアップ後のプロジェクト構造)
- [カスタマイズ方法](#カスタマイズ方法)
- [技術スタックの追加](#技術スタックの追加)
- [superpowers 自動同期](#superpowers-自動同期)
- [FAQ](#faq)

---

## クイックスタート

### 前提条件

- Node.js 18 以上がインストールされていること
- Claude Code または Cursor がインストールされていること

### 1. プロジェクトに導入（npx で即実行）

```bash
# プロジェクトのルートに移動
cd /path/to/your-project

# セットアップ実行（git clone 不要）
npx @crearize/ai-dev-helm init
```

### 2. 個人環境のセットアップ（任意）

破壊的なコマンドの実行を防止するグローバル設定を追加します。

```bash
npx @crearize/ai-dev-helm personal
```

### ローカルインストールで実行する場合

```bash
# リポジトリを取得
git clone https://github.com/Crearize/ai-dev-helm.git

# プロジェクトのルートに移動して実行
cd /path/to/your-project
node /path/to/ai-dev-helm/bin/cli.js init
```

---

## セットアップの流れ（詳細）

### `ai-dev-helm init` の対話フロー

セットアップは対話形式で進みます。以下が実際の流れです。

#### Step 1: プロジェクト名の入力

```
ai-dev-helm Setup
=================

Project initialization mode

Project name: MyApp
```

ここで入力した名前が `CLAUDE.md` や `.cursorrules` のヘッダーに反映されます。

#### Step 2: AI ツールの選択

```
Select AI tool(s):
  1) Claude Code only
  2) Cursor only
  3) Claude Code + Cursor
> 3
```

使用する AI ツールを選びます。両方使う場合は `3` を選択してください。

#### Step 3: スキル範囲の選択

```
Select skill scope:
  1) All skills (superpowers + project)
  2) superpowers skills only
  3) project skills only
> 1
```

| 選択肢 | 内容 |
|--------|------|
| All skills | 開発プロセス（superpowers）+ プロジェクト運用（project）の全スキル |
| superpowers only | 設計・計画・デバッグなど開発プロセスのスキルのみ |
| project only | 品質チェック・ブランチ管理などプロジェクト運用のスキルのみ |

#### Step 4: 技術スタックの選択

```
Available tech stacks (enter numbers separated by spaces):
  1) java-springboot
  2) nextjs-react
> 1 2
```

プロジェクトで使う技術スタックを選びます（複数可、スペース区切り）。
選んだスタックに応じて、対応するコーディングルール・レビューガイド・ドキュメントが配置されます。

> **Note**: スタックが 1 つしかない場合は自動適用されるため、この選択は表示されません。

#### Step 5: セットアップ完了

```
--- Setting up skills ---
  Skills copied to skills/

--- Setting up documents and review guides ---
  Documents and review guides copied
  PR template copied

--- Setting up AI tool configuration ---
Setting up Claude Code...
  Symlink created: .claude/skills -> ../skills
  settings.json created
  CLAUDE.md created
  Claude Code setup complete
Setting up Cursor...
  Symlink created: .cursor/skills -> ../skills
  Rule created: backend-coding.mdc
  Rule created: frontend-coding.mdc
  .cursorrules created
  Cursor setup complete

Setup complete!

Next steps:
  1. Review and customize CLAUDE.md / .cursorrules
  2. Update tech stack and port information
  3. Add project-specific coding rules
  4. Commit the generated files
```

### `ai-dev-helm personal` の対話フロー

個人のグローバル環境に安全設定を追加します。

```
ai-dev-helm Setup
=================

Personal environment setup

Available options:

  1) Claude Code global settings
     Block destructive commands, safety hooks

  2) Cursor global settings guide
     Copy recommended rules to clipboard

Select options (space-separated): 1 2
```

| 選択肢 | 何が起きるか |
|--------|-------------|
| 1) Claude Code | `~/.claude/settings.json` に破壊的コマンドのブロックルールを追加（既存設定は自動バックアップ） |
| 2) Cursor | 推奨ルールをクリップボードにコピー（Cursor の設定画面に手動で貼り付け） |

**ブロックされるコマンドの例:**
- `rm -rf /`, `rm -rf ~`, `rm -rf .`
- `git push --force` (main/master ブランチ)
- `git reset --hard`
- `git clean -fd`
- `docker system prune`
- `npm publish`, `pnpm publish`, `yarn publish`

---

## スキル一覧

スキルは AI に「どうやって作業するか」を教える手順書です。Claude Code では `/スキル名` で呼び出せます。

### superpowers スキル（開発プロセス）

[superpowers](https://github.com/obra/superpowers) プラグインから抽出した、開発プロセス全体をカバーするスキルです。

| スキル名 | 概要 | いつ使うか |
|---------|------|-----------|
| **brainstorming** | アイデアを設計に落とし込む | 新機能を作る前に要件・設計を探索する |
| **writing-plans** | 実装計画を策定する | 設計完了後、コードに触る前に計画を書く |
| **executing-plans** | 計画を実行する | 書いた計画に基づいてタスクを実行する |
| **subagent-driven-development** | サブエージェントで並列実装 | 独立したタスクを並列に実行する |
| **test-driven-development** | TDD で実装する | テストを先に書き、実装を後から行う |
| **systematic-debugging** | 体系的にデバッグする | バグ・テスト失敗に遭遇した時 |
| **dispatching-parallel-agents** | 並列エージェントを活用 | 2 つ以上の独立タスクを同時に処理する |
| **requesting-code-review** | コードレビューを依頼する | 実装完了後、マージ前の品質確認 |
| **receiving-code-review** | コードレビューを受ける | レビューフィードバックを受けた時の対応 |
| **verification-before-completion** | 完了前の検証 | 作業完了を宣言する前に証拠を確認する |
| **finishing-a-development-branch** | ブランチ完了処理 | 実装・テスト完了後のマージ/PR/クリーンアップ判断 |
| **using-git-worktrees** | Git Worktree を活用 | 現在の作業を中断せずに別機能を開発する |
| **using-superpowers** | スキルシステムの初期化 | 会話開始時に関連スキルを自動検出する |
| **writing-skills** | 新しいスキルを書く | カスタムスキルの作成・テスト |

### project スキル（プロジェクト運用）

日々の開発作業を支援するプロジェクト運用スキルです。プロジェクトに合わせてカスタマイズして使います。

| スキル名 | 概要 | いつ使うか |
|---------|------|-----------|
| **branch-workflow** | ブランチ作業フロー | 作業開始時の Issue 作成・ブランチ作成 |
| **quality-check** | 品質チェック | push 前の静的チェック・テスト・レビュー |
| **server-startup** | サーバー起動 | 開発サーバーの起動手順 |
| **backend-development** | バックエンド開発 | バックエンド実装時の規約・パターン |
| **frontend-development** | フロントエンド開発 | フロントエンド実装時の規約・パターン |
| **database-migration** | DB マイグレーション | マイグレーションファイルの作成手順 |
| **browser-agent** | ブラウザテスト | UI 実装後のブラウザ上の動作検証 |
| **implementation-report** | 実装レポート | PR 作成時の実装レポート生成 |

### スキルの仕組み

各スキルは `SKILL.md` というファイルで定義されています。

```
skills/
├── superpowers/
│   ├── brainstorming/
│   │   ├── SKILL.md              ← スキル定義（名前・説明・手順）
│   │   ├── visual-companion.md   ← 補助ドキュメント
│   │   └── spec-document-reviewer-prompt.md
│   ├── writing-plans/
│   │   ├── SKILL.md
│   │   └── plan-document-reviewer-prompt.md
│   └── ...
└── project/
    ├── quality-check/
    │   └── SKILL.md
    └── ...
```

`SKILL.md` の先頭には YAML フロントマターがあり、AI ツールがスキルの名前と用途を認識します。

```yaml
---
name: quality-check
description: プッシュ前に必ず実行。静的チェック・テスト・レビューを実施。
---

# Quality Check

（以下、スキルの詳細な手順）
```

---

## リポジトリ構造

```
ai-dev-helm/
├── package.json                # npm パッケージ定義
├── bin/
│   └── cli.js                  # CLI エントリポイント
├── lib/
│   ├── init.js                 # init モードのロジック
│   ├── personal.js             # personal モードのロジック
│   ├── merge-settings.js       # JSON 設定ファイルのマージ
│   └── utils.js                # 共通ユーティリティ
│
├── skills/                     # AI スキル定義
│   ├── superpowers/            #   開発プロセス系（14 スキル）
│   └── project/                #   プロジェクト運用系（8 スキル）
│
├── stacks/                     # 技術スタック別リソース
│   ├── java-springboot/        #   Java + Spring Boot
│   │   ├── rules/              #     コーディングルール
│   │   ├── review-guides/      #     レビューチェックリスト
│   │   └── documents/          #     詳細な規約ドキュメント
│   ├── nextjs-react/           #   Next.js + React
│   │   ├── rules/
│   │   ├── review-guides/
│   │   └── documents/
│   └── _template/              #   新規スタック追加用テンプレート
│
├── shared/                     # 技術スタック非依存のリソース
│   ├── review-guides/          #   共通レビュー基準
│   │   ├── review-docs.md      #     ドキュメントレビュー
│   │   ├── review-infra.md     #     インフラ/CI レビュー
│   │   └── review-prompt.md    #     統合レビュー指示
│   └── documents/              #   共通開発ドキュメント
│       ├── development-policy.md
│       ├── quick-checklist.md
│       ├── error-codes.md
│       ├── naming-conventions.md
│       └── coding-rules/
│           ├── common-rules.md
│           └── api-design-rules.md
│
├── templates/                  # 生成ファイルの雛形
│   ├── CLAUDE.md.template
│   ├── cursorrules.template
│   ├── settings.json.template
│   ├── settings-global.json.template
│   ├── cursor-rule.mdc.template
│   └── PULL_REQUEST_TEMPLATE.md
│
├── configs/                    # AI ツール別ドキュメント
│   ├── claude-code/README.md
│   └── cursor/README.md
│
├── scripts/
│   └── transform-skills.sh    # superpowers スキル変換（CI 用）
│
└── .github/workflows/
    └── sync-superpowers.yml   # superpowers 自動同期ワークフロー
```

---

## セットアップ後のプロジェクト構造

`ai-dev-helm init` を実行すると、以下のファイルがプロジェクトに生成されます。

### Claude Code + Cursor を両方選択した場合

```
your-project/
├── CLAUDE.md                       # Claude Code のメイン設定ファイル
├── .cursorrules                    # Cursor のメイン設定ファイル
│
├── .claude/                        # Claude Code 用ディレクトリ
│   ├── skills -> ../skills         #   スキルへのシンボリックリンク
│   ├── rules/                      #   コーディングルール
│   │   ├── frontend/coding.md
│   │   └── backend/coding.md
│   └── settings.json               #   フック・権限設定
│
├── .cursor/                        # Cursor 用ディレクトリ
│   ├── skills -> ../skills         #   スキルへのシンボリックリンク
│   └── rules/                      #   コーディングルール（.mdc 形式）
│       ├── frontend-coding.mdc
│       └── backend-coding.mdc
│
├── skills/                         # AI スキル（両ツール共有）
│   ├── superpowers/                #   開発プロセススキル
│   └── project/                    #   プロジェクト運用スキル
│
├── .github/                        # GitHub 設定
│   ├── PULL_REQUEST_TEMPLATE.md    #   PR テンプレート
│   ├── review-frontend.md          #   フロントエンドレビューガイド
│   ├── review-backend.md           #   バックエンドレビューガイド
│   ├── review-docs.md              #   ドキュメントレビューガイド
│   ├── review-infra.md             #   インフラレビューガイド
│   └── review-prompt.md            #   統合レビュー指示
│
└── documents/development/          # 開発ドキュメント
    ├── development-policy.md
    ├── quick-checklist.md
    ├── error-codes.md
    ├── naming-conventions.md
    └── coding-rules/
        ├── common-rules.md
        ├── api-design-rules.md
        ├── frontend-rules.md       # (nextjs-react 選択時)
        └── backend-rules.md        # (java-springboot 選択時)
```

### 各ファイルの役割

| ファイル | 役割 |
|---------|------|
| `CLAUDE.md` | Claude Code が会話開始時に読み込む設定ファイル。プロジェクト概要、ルール、コマンド一覧を記述 |
| `.cursorrules` | Cursor が参照するプロジェクト設定ファイル |
| `.claude/settings.json` | Claude Code のフック設定。品質チェック未実施の push をブロックするフックなど |
| `.claude/rules/` | Claude Code が自動読み込みするコーディングルール |
| `.cursor/rules/*.mdc` | Cursor が自動読み込みするコーディングルール（glob パターンで適用ファイルを制御） |
| `skills/` | AI スキル。`.claude/skills` と `.cursor/skills` からシンボリックリンクで参照 |
| `.github/review-*.md` | AI がコードレビューする際に参照するチェックリスト |
| `documents/development/` | コーディング規約・命名規則などの開発ドキュメント |

---

## カスタマイズ方法

セットアップ後、プロジェクトに合わせてカスタマイズしてください。

### 1. CLAUDE.md / .cursorrules の編集

生成された `CLAUDE.md` にはプレースホルダーやテンプレート的な記述が含まれています。以下を更新してください。

- プロジェクト概要・アーキテクチャの説明
- 技術スタック（使用ライブラリ、バージョン）
- ポート番号
- よく使うコマンド
- プロジェクト固有のルール

### 2. コーディングルールの追加

**Claude Code の場合:**

`.claude/rules/` にカテゴリ別のディレクトリを作成し、`.md` ファイルを追加します。

```markdown
---
title: My Custom Rule
description: プロジェクト固有のルール
globs:
  - "src/**/*.ts"
---

# My Custom Rule

ルールの内容...
```

**Cursor の場合:**

`.cursor/rules/` に `.mdc` ファイルを追加します。

```markdown
---
description: "My Custom Rule"
globs:
  - "src/**/*.ts"
alwaysApply: false
---

# My Custom Rule

ルールの内容...
```

### 3. スキルのカスタマイズ

`skills/project/` 内のスキルはプロジェクトに合わせて編集してください。例えば:

- `server-startup/SKILL.md` — 起動コマンドやポート番号を実際のものに変更
- `quality-check/SKILL.md` — チェック項目やテストコマンドを調整
- `backend-development/SKILL.md` — 使用フレームワークに合わせた規約に変更

> **Note**: `skills/superpowers/` は汎用的な開発プロセススキルのため、通常はカスタマイズ不要です。

### 4. レビューガイドの調整

`.github/review-*.md` のチェックリストを、プロジェクトの技術スタックや要件に合わせて調整してください。

---

## 技術スタックの追加

ai-dev-helm に新しい技術スタック（例: Python + Django）を追加する方法です。

### 1. テンプレートをコピー

```bash
cp -r stacks/_template stacks/python-django
```

### 2. ファイルを編集

```
stacks/python-django/
├── rules/
│   └── coding.md            ← コーディングルール（AI が自動読み込み）
├── review-guides/
│   └── review.md            ← レビューチェックリスト
└── documents/
    └── coding-rules/
        └── rules.md         ← 詳細なコーディング規約
```

各テンプレートファイルにはセクション構成のガイドが含まれているので、それに沿って記述してください。

### 3. セットアップで選択可能に

`stacks/` ディレクトリに配置するだけで、セットアップが自動的に検出します。
次回 `ai-dev-helm init` を実行すると、選択肢に表示されます。

---

## superpowers 自動同期

`skills/superpowers/` は [superpowers](https://github.com/obra/superpowers) プラグイン（v5.0.6）から抽出したスキルです。

### 自動同期の仕組み

GitHub Actions ワークフロー（`.github/workflows/sync-superpowers.yml`）が毎日実行され:

1. 現在同期中のバージョン（`.superpowers-version`）を確認
2. superpowers リポジトリの最新リリースを取得
3. 新バージョンがあれば、スキルを変換・コピーして PR を自動作成

### 手動で同期する

GitHub の Actions タブから `Sync Superpowers Skills` ワークフローを手動実行できます。

---

## FAQ

### Q: Claude Code と Cursor のどちらを使えばいいですか？

どちらでも問題なく使えます。両方を併用する場合は、セットアップ時に `3) Claude Code + Cursor` を選択してください。スキルは共有ディレクトリ（`skills/`）を通じて両ツールで共有されます。

### Q: セットアップ後に ai-dev-helm リポジトリは必要ですか？

`ai-dev-helm init` はファイルをコピーするため、セットアップ後は不要です。ただし、以下の場合に再度必要になります:

- 新しいプロジェクトにセットアップしたい時（`npx` なら都度ダウンロードされるので不要）
- `personal` モードでグローバル設定を更新したい時
- 新しいバージョンのスキル・ルールを取得したい時

### Q: 既存の CLAUDE.md や .cursorrules がある場合は？

既存ファイルがある場合は上書きされません。スキップされてそのまま残ります。

### Q: スキルが多すぎて全部は使わない場合は？

セットアップ時にスキル範囲を選択できます。また、セットアップ後に不要なスキルディレクトリを削除しても問題ありません。

### Q: Windows で動作しますか？

Node.js ベースの CLI なので、Windows / macOS / Linux すべてで動作します。シンボリックリンクの代わりに NTFS ジャンクション（管理者権限不要）を使用し、失敗時はコピーにフォールバックします。

### Q: 技術スタックが Next.js + Spring Boot 以外の場合は？

共通のドキュメント（`shared/`）はどの技術スタックでも活用できます。スタック固有のルール・ガイドは、`stacks/_template/` をベースに新しいスタックを追加してください。

---

## ライセンス

MIT
