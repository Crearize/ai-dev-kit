# ai-dev-helm v1.0.0 品質改善 設計書

## 概要

ai-dev-helm をv1.0.0として成立するレベルに引き上げるための品質改善を行う。法的基盤・テスト基盤・CLI品質・CI/CD・テンプレート・スキル設計の6領域を対象とする。

**対象外**: フロントエンド/バックエンドのドキュメント充実度差異（スキル充実は別途検討）

## セクション1: 法的基盤・OSS体裁

### 1.1 LICENSE ファイル

- MIT License 全文を `LICENSE` ファイルとしてリポジトリルートに追加
- `Copyright (c) 2026 Crearize`

### 1.2 CONTRIBUTING.md

以下の内容を記載:

- **開発フロー**: clone → `npm install` → `npm test` → ブランチ作成 → PR作成
- **Claude Code活用**: このプロジェクトはスキルの仕組み（superpowers）に乗っかっており、Claude Codeでの開発を推奨する旨を明記
- **PRルール**:
  - mainへの直接pushは不可、必ずPRを作成すること
  - PRには1名以上のレビュー承認が必要
  - レビュー後に新しいpushがあると承認はリセットされる
- **バージョニングポリシー**:
  - patch: 軽微な修正、ホットフィックス
  - minor: 新機能追加
  - major: 互換性のない変更、大幅な機能追加

### 1.3 CHANGELOG.md

- Keep a Changelog 形式を採用
- v1.0.0 の初回エントリを作成
- 今回の改善内容を記載

### 1.4 SECURITY.md

- 脆弱性報告は **GitHub Security Advisories** を使用（メールアドレスは公開しない）
- 対応目安: 「14営業日以内に確認」程度の緩めの記載
- 免責: あくまでベストエフォートであり、緊急対応を保証するものではない

### 1.5 CODE_OF_CONDUCT.md

- Contributor Covenant v2.1 を採用
- enforcement（違反時の報告先）: **GitHub Issues で報告**（メールアドレス不要）

## セクション2: テスト基盤・パッケージ整備

### 2.1 テストフレームワーク

- **Vitest** を devDependencies に追加
- 他プロジェクト（platform, MovieMarketer）と統一

### 2.2 テスト対象

#### ユニットテスト

| 対象関数 | テスト内容 |
|---------|-----------|
| `mergeSettings()` | JSON マージロジック、重複排除、既存設定の保持 |
| 入力バリデーション | projectName の空文字・制御文字チェック |
| テンプレート置換 | `{{PROJECT_NAME}}` 置換、特殊文字のエスケープ |

#### 統合テスト

| 対象 | テスト内容 |
|------|-----------|
| `copyDirSync()` | 再帰コピー、エラー時の挙動 |
| `linkOrCopy()` | シンボリックリンク作成、フォールバックのコピー |
| `init` フロー | 一時ディレクトリでのエンドツーエンド実行 |

### 2.3 テスト配置

- ソースファイルの隣にコロケーション
  - `lib/merge-settings.js` → `lib/merge-settings.test.js`
  - `lib/utils.js` → `lib/utils.test.js`
  - `lib/init.js` → `lib/init.test.js`
  - `lib/personal.js` → `lib/personal.test.js`

### 2.4 package.json 更新

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ci": "vitest run"
  },
  "engines": {
    "node": ">=18.17.0"
  },
  "devDependencies": {
    "vitest": "^latest"
  },
  "dependencies": {
    "yargs": "^latest"
  }
}
```

## セクション3: CLI品質改善

### 3.1 エラーハンドリング

#### エラー表示の改善
- 通常時: ユーザーフレンドリーなメッセージを表示
- `--verbose` 時: スタックトレースも表示
- エラーメッセージに「何をすべきか」のヒントを含める

#### 入力バリデーション
- `projectName`: 空文字、スペースのみ、制御文字を拒否。再入力を促す
- スタック選択: 無効な番号を入力した場合に警告メッセージを表示
- `promptSelect()` / `promptInput()`: EOF時にgracefulに終了（無限ループ防止）

#### コピー操作の堅牢性
- `copyDirSync()` にtry-catchを追加
- 失敗時は部分的にコピーされたファイルをクリーンアップ

### 3.2 セキュリティ

#### テンプレート置換の安全性
- `String.replace()` の置換文字列に `$&` 等の正規表現特殊文字が含まれる問題を修正
- 置換文字列をエスケープするユーティリティ関数を追加

### 3.3 CLI UX（yargs導入）

#### サブコマンド定義
- `ai-dev-helm init` — プロジェクトにセットアップ
- `ai-dev-helm personal` — 個人環境セットアップ

#### グローバルオプション
- `--help` / `-h` — ヘルプ表示（yargsが自動生成）
- `--version` / `-v` — バージョン表示（package.jsonから取得）
- `--dry-run` — ファイル操作を行わず、何がコピーされるかを表示
- `--verbose` — 詳細なログ出力・エラー時のスタックトレース表示

### 3.4 コード品質

#### DRY原則の適用
- `setupClaudeCode()` と `setupCursor()` の共通処理を抽出
  - ディレクトリ作成
  - ルールファイルの配置
  - シンボリックリンク作成
- 共通処理を内部関数として `init.js` 内に定義

#### JSDoc追加
- 主要な公開関数に `@param`, `@returns` の型情報を追加
- 対象: `copyDirSync`, `linkOrCopy`, `mergeSettings`, `createPrompter` 等

## セクション4: CI/CD・テンプレート・スキル設計

### 4.1 sync-superpowers.yml の堅牢性改善

| 項目 | 対応内容 |
|------|---------|
| git clone失敗 | clone ステップに明示的なエラーチェックを追加 |
| transform後検証 | `skills/superpowers/` が空でないことを確認するステップを追加 |
| create-pull-request | `peter-evans/create-pull-request` を最新バージョンに更新 |
| バージョン解析 | pre-release を除外するフィルタを追加、jq失敗時のハンドリング |
| バージョン注入 | PRタイトルに含まれるバージョン文字列のサニタイズ |

### 4.2 テンプレートのプレースホルダー統一

- `templates/CLAUDE.md.template` のプレースホルダー形式を `{{}}` に統一
- `[]` 形式のプレースホルダー（ユーザーが手動編集する箇所）は、コメントで「手動編集」と明示
- セットアップスクリプトが自動置換するものと、ユーザーが手動で編集するものを明確に区別

### 4.3 スキル間依存の解消

- `.quality-check-report.json` のスキーマを `skills/project/_schemas/quality-check-report.schema.md` として独立化
- `quality-check/SKILL.md` と `implementation-report/SKILL.md` の両方からこのスキーマを参照するよう修正
- スキーマドキュメントにはフィールド定義、型、必須/任意の区別を記載

## 対象外

- フロントエンド/バックエンドのドキュメント充実度差異（スキル充実は別途相談）
- スキル内容の追加・改善（database-migration, implementation-report 等の具体性向上）

## 技術的判断

| 判断 | 理由 |
|------|------|
| Vitest採用 | 既存プロジェクト（platform, MovieMarketer）との統一 |
| yargs採用 | 高機能なCLI引数パース、自動ヘルプ生成。既存プロジェクトとの一貫性 |
| コロケーションテスト配置 | 既存プロジェクトのパターンに従う |
| GitHub Security Advisories | メールアドレス非公開の方針に合致 |
| GitHub Issues for CoC | 同上 |
