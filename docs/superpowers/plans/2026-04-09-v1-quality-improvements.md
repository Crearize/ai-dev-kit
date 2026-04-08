# ai-dev-helm v1.0.0 品質改善 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ai-dev-helm をv1.0.0として成立するレベルに引き上げる（法的基盤・テスト・CLI品質・CI/CD・テンプレート・スキル設計の改善）

**Architecture:** 6つの独立した改善領域を順序付きで実装する。まず法的基盤（変更なしの静的ファイル）、次にパッケージ整備（yargs・vitest導入）、CLI改修（yargs移行・エラーハンドリング・DRY・JSDoc）、テスト作成、CI/CD改善、最後にテンプレート・スキル修正の順。

**Tech Stack:** Node.js, yargs, Vitest

**Spec:** `docs/superpowers/specs/2026-04-09-v1-quality-improvements-design.md`

---

## Task 1: OSS標準ファイルの追加

**Files:**
- Create: `LICENSE`
- Create: `CONTRIBUTING.md`
- Create: `CHANGELOG.md`
- Create: `SECURITY.md`
- Create: `CODE_OF_CONDUCT.md`

- [ ] **Step 1: LICENSE ファイルを作成**

```
MIT License

Copyright (c) 2026 Crearize

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 2: CONTRIBUTING.md を作成**

以下の内容を含む:
- 開発フロー: clone → `npm install` → `npm test` → ブランチ作成 → PR作成
- Claude Code活用: superpowersスキルの仕組みに乗っかっている旨
- PRルール: mainへの直接push不可、1名以上のレビュー承認必須、stale review自動dismiss
- バージョニング: patch（軽微修正）、minor（新機能）、major（破壊的変更）

- [ ] **Step 3: CHANGELOG.md を作成**

Keep a Changelog 形式。v1.0.0 の初回エントリとして今回の改善内容を記載。

- [ ] **Step 4: SECURITY.md を作成**

GitHub Security Advisoriesで報告。14営業日以内に確認。ベストエフォートの免責事項。

- [ ] **Step 5: CODE_OF_CONDUCT.md を作成**

Contributor Covenant v2.1。違反報告先はGitHub Issues。

- [ ] **Step 6: コミット**

```bash
git add LICENSE CONTRIBUTING.md CHANGELOG.md SECURITY.md CODE_OF_CONDUCT.md
git commit -m "docs: add OSS standard files (LICENSE, CONTRIBUTING, CHANGELOG, SECURITY, CODE_OF_CONDUCT)"
```

---

## Task 2: パッケージ整備（yargs・vitest導入）

**Files:**
- Modify: `package.json`

- [ ] **Step 1: yargs と vitest をインストール**

```bash
npm install yargs
npm install --save-dev vitest
```

- [ ] **Step 2: package.json を更新**

以下を変更:
- `scripts` に `"test": "vitest run"`, `"test:watch": "vitest"`, `"test:ci": "vitest run"` を追加
- `engines.node` を `">=18.17.0"` に変更

- [ ] **Step 3: vitest.config.mjs を作成**

NOTE: プロジェクトはCJSだが、vitest設定ファイルは `.mjs` 拡張子を使いESM構文で記述する（vitest公式推奨）。

```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
  },
});
```

- [ ] **Step 4: テストが実行可能か確認**

```bash
npm test
```

Expected: テストファイルがまだないため 0 tests のような出力（エラーなし）

- [ ] **Step 5: コミット**

```bash
git add package.json package-lock.json vitest.config.mjs
git commit -m "chore: add yargs, vitest and npm scripts"
```

---

## Task 3: CLI を yargs に移行

**Files:**
- Modify: `bin/cli.js`
- Modify: `lib/init.js:14-23` (doInit の引数にオプションを受け取れるようにする)
- Modify: `lib/personal.js:13` (doPersonal の引数にオプションを受け取れるようにする)

- [ ] **Step 1: bin/cli.js を yargs ベースに書き換え**

```javascript
#!/usr/bin/env node
'use strict';

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { printHeader } = require('../lib/utils');

yargs(hideBin(process.argv))
  .scriptName('ai-dev-helm')
  .usage('$0 <command> [options]')
  .command(
    'init',
    'Set up development foundation in a project',
    (yargs) => {
      return yargs
        .option('dry-run', {
          type: 'boolean',
          describe: 'Show what would be done without making changes',
          default: false,
        })
        .option('verbose', {
          type: 'boolean',
          describe: 'Show detailed output and stack traces on error',
          default: false,
        });
    },
    async (argv) => {
      printHeader();
      console.log('Project initialization mode');
      console.log('');
      const { doInit } = require('../lib/init');
      await doInit({ dryRun: argv.dryRun, verbose: argv.verbose });
    }
  )
  .command(
    'personal',
    'Apply global settings to personal environment',
    (yargs) => {
      return yargs
        .option('verbose', {
          type: 'boolean',
          describe: 'Show detailed output and stack traces on error',
          default: false,
        });
    },
    async (argv) => {
      printHeader();
      const { doPersonal } = require('../lib/personal');
      await doPersonal({ verbose: argv.verbose });
    }
  )
  .demandCommand(1, 'Please specify a command: init or personal')
  .strict()
  .help()
  .version()
  .fail((msg, err, yargs) => {
    if (err) {
      console.error(`Error: ${err.message}`);
      if (process.argv.includes('--verbose')) {
        console.error(err.stack);
      }
      console.error('');
      console.error('Run with --verbose for more details.');
    } else {
      console.error(msg);
      console.error('');
      yargs.showHelp();
    }
    process.exit(1);
  })
  .parse();
```

- [ ] **Step 2: lib/init.js — doInit にオプション引数を追加**

`doInit()` のシグネチャを `async function doInit(options = {})` に変更。`options.dryRun` と `options.verbose` を受け取る。
`console.log('Project initialization mode')` の行は cli.js 側に移動済みなので削除。

- [ ] **Step 3: lib/personal.js — doPersonal にオプション引数を追加**

`doPersonal()` のシグネチャを `async function doPersonal(options = {})` に変更。

- [ ] **Step 4: 動作確認**

```bash
node bin/cli.js --help
node bin/cli.js init --help
node bin/cli.js --version
node bin/cli.js unknown-command
```

Expected:
- `--help` でヘルプ表示
- `--version` で 1.0.0 表示
- unknown-command でエラー + ヘルプ表示

- [ ] **Step 5: コミット**

```bash
git add bin/cli.js lib/init.js lib/personal.js
git commit -m "feat: migrate CLI to yargs with --help, --version, --dry-run, --verbose"
```

---

## Task 4: エラーハンドリング・入力バリデーション・セキュリティ改善

**Files:**
- Modify: `lib/utils.js:42-55` (getLine EOF対応)
- Modify: `lib/utils.js:52-55` (promptInput バリデーション)
- Modify: `lib/utils.js:57-71` (promptSelect EOF対応)
- Modify: `lib/utils.js:88-99` (copyDirSync エラーハンドリング)
- Modify: `lib/init.js:23` (projectName バリデーション)
- Modify: `lib/init.js:54-59` (スタック選択の無効入力警告)
- Modify: `lib/init.js:141-143` (テンプレート置換のセキュリティ)

- [ ] **Step 1: utils.js — getLine の EOF 対応**

`rl` の `'close'` イベントを監視し、EOF時にlineWaiterを `null` で resolve する。`promptInput` / `promptSelect` はnullを受け取ったら graceful に終了。

```javascript
let closed = false;

rl.on('close', () => {
  closed = true;
  if (lineWaiter) {
    const resolve = lineWaiter;
    lineWaiter = null;
    resolve(null);
  }
});

function getLine() {
  return new Promise((resolve) => {
    if (lineQueue.length > 0) {
      resolve(lineQueue.shift());
    } else if (closed) {
      resolve(null);
    } else {
      lineWaiter = resolve;
    }
  });
}
```

- [ ] **Step 2: utils.js — promptSelect の EOF 対応**

```javascript
async function promptSelect(prompt, options) {
  console.log(prompt);
  options.forEach((opt, i) => {
    console.log(`  ${i + 1}) ${opt}`);
  });

  while (true) {
    const answer = await promptInput('> ');
    if (answer === null) {
      console.log('');
      console.log('Input ended. Exiting.');
      process.exit(0);
    }
    const num = parseInt(answer, 10);
    if (num >= 1 && num <= options.length) {
      return num - 1;
    }
    console.log(`Enter a number between 1 and ${options.length}`);
  }
}
```

`promptInput` と `promptMultiple` にも同様の null チェックを追加。

- [ ] **Step 3: utils.js — copyDirSync にエラーハンドリング追加**

```javascript
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  try {
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copyDirSync(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  } catch (err) {
    // Clean up partially copied directory
    try {
      fs.rmSync(dest, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
    throw new Error(`Failed to copy ${src} to ${dest}: ${err.message}`);
  }
}
```

- [ ] **Step 4: init.js — projectName のバリデーション**

`promptInput` の後に空文字・スペースのみ・制御文字のチェックを追加。不正な場合は再入力を促すループ。

```javascript
let projectName;
while (true) {
  projectName = await prompter.promptInput('Project name: ');
  if (projectName === null) {
    console.log('');
    console.log('Input ended. Exiting.');
    process.exit(0);
  }
  if (projectName.length > 0 && /^[^\x00-\x1f]+$/.test(projectName)) {
    break;
  }
  console.log('Invalid project name. Please enter a non-empty name without control characters.');
}
```

- [ ] **Step 5: init.js — スタック選択の無効入力警告**

`lib/init.js:54-59` のループに、無効な番号の警告を追加:

```javascript
for (const idx of stackInput) {
  const num = parseInt(idx, 10);
  if (num >= 1 && num <= stacks.length) {
    selectedStacks.push(stacks[num - 1]);
  } else {
    console.log(`  Warning: "${idx}" is not a valid stack number, skipping`);
  }
}
```

- [ ] **Step 6: init.js — テンプレート置換のセキュリティ修正**

`$&` 等の正規表現特殊文字をエスケープ:

```javascript
// lib/init.js:141-143 を修正
for (const file of ['CLAUDE.md', '.cursorrules']) {
  const filePath = path.join(projectDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Escape special replacement patterns ($&, $`, $', $1, etc.)
    const safeProjectName = projectName.replace(/\$/g, '$$$$');
    content = content.replace(/\{\{PROJECT_NAME\}\}/g, safeProjectName);
    fs.writeFileSync(filePath, content, 'utf8');
  }
}
```

- [ ] **Step 7: コミット**

```bash
git add lib/utils.js lib/init.js
git commit -m "fix: add error handling, input validation, and template replacement security"
```

---

## Task 5: DRY リファクタリング・JSDoc 追加

**Files:**
- Modify: `lib/init.js:160-273` (setupClaudeCode / setupCursor の共通化)
- Modify: `lib/personal.js:49-115` (setupClaudeCodeGlobal / setupCursorGlobal の共通化)
- Modify: `lib/utils.js` (JSDoc 追加)
- Modify: `lib/merge-settings.js` (JSDoc 追加)

- [ ] **Step 1: init.js — 共通処理の抽出**

`setupClaudeCode()` と `setupCursor()` の共通部分（ディレクトリ作成、スキルリンク、ルール配置）を抽出:

```javascript
/**
 * @param {Object} params
 * @param {string} params.projectDir - プロジェクトルートパス
 * @param {string} params.toolDir - ツール固有ディレクトリ（.claude / .cursor）
 * @param {string[]} params.selectedStacks - 選択された技術スタック
 * @param {string} params.toolName - ツール名（表示用）
 */
function setupToolBase({ projectDir, toolDir, selectedStacks, toolName }) {
  console.log(`Setting up ${toolName}...`);

  // Create rules directory
  fs.mkdirSync(path.join(toolDir, 'rules'), { recursive: true });

  // Link skills
  const skillsDir = path.join(projectDir, 'skills');
  if (fs.existsSync(skillsDir)) {
    linkOrCopy(skillsDir, path.join(toolDir, 'skills'));
  }
}
```

`setupClaudeCode()` と `setupCursor()` はこれを呼び出した上で、固有の処理のみ実装。

- [ ] **Step 2: personal.js — JSDoc追加による明確化**

`setupClaudeCodeGlobal()` と `setupCursorGlobal()` は構造が大きく異なる（前者はJSON設定マージ、後者はクリップボードコピー）ため、共通化は行わない。代わりに各関数にJSDocを追加して責務を明確化する。

NOTE: スペックでは「同様に抽出」としているが、2関数は入出力の性質が全く異なり（ファイルI/O vs クリップボードI/O）、無理な共通化はかえって可読性を下げる。JSDoc追加で責務を明確にするアプローチを採用。

- [ ] **Step 3: utils.js — JSDoc 追加**

主要な公開関数に `@param`, `@returns` を追加:
- `copyDirSync(src, dest)`
- `copyFilesSync(src, dest)`
- `linkOrCopy(target, linkPath)`
- `detectStacks()`
- `createPrompter()`

- [ ] **Step 4: merge-settings.js — JSDoc 追加**

`mergeSettings()` の既存JSDocを更新し、`@param` タグを追加。

- [ ] **Step 5: コミット**

```bash
git add lib/init.js lib/personal.js lib/utils.js lib/merge-settings.js
git commit -m "refactor: extract common setup logic and add JSDoc to public functions"
```

---

## Task 6: --dry-run の実装

**Files:**
- Modify: `lib/utils.js` (dryRun対応のラッパー関数)
- Modify: `lib/init.js` (dryRunオプションの伝播)

- [ ] **Step 1: utils.js — dryRun対応のファイル操作関数**

`copyDirSync`, `copyFilesSync`, `linkOrCopy` に `dryRun` パラメータを追加。`dryRun: true` の場合はファイル操作を行わず、何をするかをログ出力する。

```javascript
/**
 * @param {string} src
 * @param {string} dest
 * @param {Object} [options]
 * @param {boolean} [options.dryRun=false]
 */
function copyDirSync(src, dest, options = {}) {
  if (options.dryRun) {
    console.log(`  [dry-run] Would copy directory: ${src} -> ${dest}`);
    return;
  }
  // ... existing implementation
}
```

同様に `linkOrCopy`, `copyFilesSync` にも適用。

- [ ] **Step 2: init.js — dryRun オプションの伝播**

`doInit(options)` から各ファイル操作関数に `{ dryRun: options.dryRun }` を渡す。ファイル書き込み（`fs.writeFileSync`, `fs.copyFileSync`）も条件分岐する。

- [ ] **Step 3: 動作確認**

```bash
node bin/cli.js init --dry-run
```

Expected: プロンプトは通常通り表示されるが、ファイルは作成されず `[dry-run]` プレフィックス付きのログのみ出力。

- [ ] **Step 4: コミット**

```bash
git add lib/utils.js lib/init.js
git commit -m "feat: implement --dry-run option for init command"
```

---

## Task 7: テスト作成（ユニットテスト）

**Files:**
- Create: `lib/merge-settings.test.js`
- Create: `lib/utils.test.js`

- [ ] **Step 1: merge-settings.test.js — テストを書く**

NOTE: `globals: true` を設定しているため、vitest API (describe, it, expect等) はインポート不要。テスト対象のCJSモジュールは `require()` でインポートする。

```javascript
const fs = require('fs');
const path = require('path');
const os = require('os');
const { mergeSettings } = require('./merge-settings');

describe('mergeSettings', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'merge-settings-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates new settings file from template when target does not exist', () => {
    // ...
  });

  it('merges deny lists as union and sorts', () => {
    // ...
  });

  it('preserves existing values over template defaults', () => {
    // ...
  });

  it('creates backup before modifying existing file', () => {
    // ...
  });

  it('preserves existing allow list', () => {
    // ...
  });

  it('preserves hooks from existing file', () => {
    // ...
  });
});
```

- [ ] **Step 2: テストを実行して pass を確認**

```bash
npm test
```

- [ ] **Step 3: utils.test.js — ユニットテストを書く**

テスト対象:
- `copyDirSync`: 再帰コピーの正常系、失敗時のクリーンアップ
- `copyFilesSync`: ファイルのみコピー、存在しないsrcのスキップ
- `linkOrCopy`: フォールバックのコピー動作
- `detectStacks`: _templateの除外、空ディレクトリ
- 入力バリデーション関連（promptInput のnullチェック等はモック困難なのでスキップ可）

- [ ] **Step 4: テストを実行して pass を確認**

```bash
npm test
```

- [ ] **Step 5: personal.test.js — テストを書く**

テスト対象:
- `setupClaudeCodeGlobal()`: `mergeSettings` が正しく呼ばれるか（mergeSettingsをモック）
- `setupCursorGlobal()`: クリップボードコマンドの実行（execSyncをモック）、クリップボード利用不可時のフォールバック出力

NOTE: `execSync` と `mergeSettings` はモックし、実際のクリップボード操作やグローバル設定変更は行わない。

- [ ] **Step 6: テストを実行して pass を確認**

```bash
npm test
```

- [ ] **Step 7: コミット**

```bash
git add lib/merge-settings.test.js lib/utils.test.js lib/personal.test.js
git commit -m "test: add unit tests for mergeSettings, utils, and personal"
```

---

## Task 8: テスト作成（統合テスト）

**Files:**
- Create: `lib/init.test.js`

- [ ] **Step 1: init.test.js — 統合テストを書く**

一時ディレクトリを作成し、`doInit` の内部関数（`setupClaudeCode`, `setupCursor`）をテスト。対話入力はモック。

テスト内容:
- Claude Code セットアップ: `.claude/` ディレクトリ構造、settings.json、CLAUDE.md生成
- Cursor セットアップ: `.cursor/` ディレクトリ構造、.mdc ルール生成
- スキルコピー: superpowers / project の選択的コピー
- テンプレート置換: `{{PROJECT_NAME}}` が正しく置換される
- テンプレート置換セキュリティ: `$&` を含むプロジェクト名で予期しない置換が起きない
- 既存ファイルスキップ: CLAUDE.md が既存の場合は上書きされない
- `--dry-run`: ファイルが作成されない

- [ ] **Step 2: テストを実行して pass を確認**

```bash
npm test
```

- [ ] **Step 3: コミット**

```bash
git add lib/init.test.js
git commit -m "test: add integration tests for init flow"
```

---

## Task 9: sync-superpowers.yml の堅牢性改善・自動マージ

**Files:**
- Modify: `.github/workflows/sync-superpowers.yml`

- [ ] **Step 1: git clone 失敗時のハンドリング追加**

clone ステップにエラーチェックを追加:

```yaml
- name: Clone superpowers
  if: steps.check.outputs.needed == 'true'
  run: |
    if ! git clone --depth 1 --branch "v${{ steps.latest.outputs.version }}" \
      https://github.com/obra/superpowers.git /tmp/superpowers; then
      echo "::error::Failed to clone superpowers v${{ steps.latest.outputs.version }}"
      exit 1
    fi
```

- [ ] **Step 2: バージョン解析の堅牢性改善**

pre-release除外とjq失敗ハンドリング:

```yaml
- name: Get latest superpowers release
  id: latest
  run: |
    LATEST=$(gh api repos/obra/superpowers/releases \
      --jq '[.[] | select(.prerelease == false and .draft == false)][0].tag_name' \
      | sed 's/^v//')
    if [ -z "$LATEST" ]; then
      echo "::error::Failed to get latest release version"
      exit 1
    fi
    echo "version=$LATEST" >> "$GITHUB_OUTPUT"
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

- [ ] **Step 3: transform後の検証ステップ追加**

```yaml
- name: Verify transformed skills
  if: steps.check.outputs.needed == 'true'
  run: |
    SKILL_COUNT=$(find skills/superpowers -name "SKILL.md" | wc -l)
    if [ "$SKILL_COUNT" -eq 0 ]; then
      echo "::error::No skills found after transformation"
      exit 1
    fi
    echo "Verified: $SKILL_COUNT skills found"
```

- [ ] **Step 4: create-pull-request のバージョン更新 + 自動マージ追加**

```yaml
- name: Create Pull Request
  if: steps.check.outputs.needed == 'true'
  id: create-pr
  uses: peter-evans/create-pull-request@v7
  with:
    title: "chore: sync superpowers v${{ steps.current.outputs.version }} → v${{ steps.latest.outputs.version }}"
    body: |
      ## superpowers スキル自動同期

      **更新**: v${{ steps.current.outputs.version }} → v${{ steps.latest.outputs.version }}

      [リリースノート](https://github.com/obra/superpowers/releases/tag/v${{ steps.latest.outputs.version }})を確認してください。
    branch: chore/sync-superpowers
    commit-message: "chore: sync superpowers skills to v${{ steps.latest.outputs.version }}"
    labels: auto-merge-superpowers

- name: Enable auto-merge
  if: steps.create-pr.outputs.pull-request-number
  run: |
    gh pr merge ${{ steps.create-pr.outputs.pull-request-number }} \
      --auto --squash
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

- [ ] **Step 5: コミット**

```bash
git add .github/workflows/sync-superpowers.yml
git commit -m "fix: improve sync-superpowers robustness and add auto-merge with label"
```

---

## Task 10: テンプレートのプレースホルダー統一

**Files:**
- Modify: `templates/CLAUDE.md.template`

- [ ] **Step 1: プレースホルダー形式を調査・分類**

現在のテンプレートで:
- `{{PROJECT_NAME}}`: セットアップスクリプトが自動置換（行1, 108）
- `[Add project description here]`, `[Add backend stack]`, `[PORT]` 等: ユーザーが手動編集

- [ ] **Step 2: ユーザー手動編集箇所にコメントを追加**

`[...]` 形式のプレースホルダーはそのまま残すが、セクションの先頭に `<!-- 手動編集: プロジェクトに合わせて以下を更新してください -->` を追加。

自動置換 (`{{}}`) と手動編集 (`[...]`) の区別が明確になるようにする。

- [ ] **Step 3: コミット**

```bash
git add templates/CLAUDE.md.template
git commit -m "docs: clarify placeholder types in CLAUDE.md template"
```

---

## Task 11: スキル間依存の解消

**Files:**
- Create: `skills/project/_schemas/quality-check-report.schema.md`
- Modify: `skills/project/quality-check/SKILL.md:194-218`
- Modify: `skills/project/implementation-report/SKILL.md:41-43`

- [ ] **Step 1: スキーマドキュメントを作成**

`skills/project/_schemas/quality-check-report.schema.md` を作成。`quality-check/SKILL.md` の行194-218にあるJSON構造を移植し、各フィールドの型・必須/任意を明記。

- [ ] **Step 2: quality-check/SKILL.md からスキーマ定義を参照に変更**

インラインのJSON例を残しつつ、「完全なスキーマ定義は `_schemas/quality-check-report.schema.md` を参照」とリンクを追加。

- [ ] **Step 3: implementation-report/SKILL.md にスキーマ参照を追加**

`.quality-check-report.json` を読み取る箇所（行41付近）に、スキーマ参照を追加:
「フォーマットの詳細は `_schemas/quality-check-report.schema.md` を参照」

- [ ] **Step 4: コミット**

```bash
git add skills/project/_schemas/quality-check-report.schema.md \
       skills/project/quality-check/SKILL.md \
       skills/project/implementation-report/SKILL.md
git commit -m "refactor: extract quality-check-report schema to shared document"
```

---

## Task 12: GitHub リポジトリ設定（手動ステップ）

以下はGitHub UIまたはAPIで手動設定が必要:

- [ ] **Step 1: Auto-merge を有効化**

リポジトリ Settings → General → Pull Requests → 「Allow auto-merge」を有効化

- [ ] **Step 2: ブランチ保護ルールの bypass list に `github-actions[bot]` を追加**

Settings → Branches → main の保護ルール → 「Allow specified actors to bypass required pull requests」に `github-actions[bot]` を追加

- [ ] **Step 3: `auto-merge-superpowers` ラベルを作成**

```bash
gh label create auto-merge-superpowers --description "Auto-merge for superpowers sync PRs" --color "0E8A16"
```

---

## Task 13: 最終検証・品質チェック

- [ ] **Step 1: 全テスト実行**

```bash
npm test
```

Expected: すべてのテストが pass

- [ ] **Step 2: CLI動作確認**

```bash
node bin/cli.js --help
node bin/cli.js --version
node bin/cli.js init --help
node bin/cli.js init --dry-run
```

- [ ] **Step 3: CHANGELOG.md を最終更新**

実装した内容に基づいて CHANGELOG.md の v1.0.0 エントリを最終化

- [ ] **Step 4: 品質チェックスキルを実行**

`/quality-check` を実行し、全チェックをパス

- [ ] **Step 5: コミット**

```bash
git add CHANGELOG.md
git commit -m "docs: finalize CHANGELOG for v1.0.0"
```
