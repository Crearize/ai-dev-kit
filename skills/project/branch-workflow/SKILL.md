---
name: branch-workflow
description: 作業開始時に使用。mainブランチでの作業禁止。Issue先行作成必須。
---

# Branch Workflow Skill - ブランチ・Issue作業フロー

## 禁止事項（最重要）

> **以下は絶対に禁止。違反は許容されない。**

- **mainブランチでの直接作業禁止**: すべての変更は機能ブランチで行う
- **Issue番号なしのブランチ作成禁止**: 必ずIssue番号をブランチ名に含める

## 作業開始前の必須チェック

### Step 1: 現在のブランチを確認

```bash
git branch --show-current
```

- `main` と表示された場合 → **作業禁止！** Step 2へ
- `main` 以外の場合 → 作業内容とブランチ名が一致しているか確認

### Step 2: Issue作成（mainの場合必須）

```bash
gh issue create --title "機能名" --body "詳細説明"
```

### Step 3: ブランチ作成

```bash
git checkout -b [タイプ]/[作業内容]-[Issue番号]
```

## ブランチ命名規則

| タイプ | 用途 | 例 |
|--------|------|-----|
| `feature/` | 新機能開発 | `feature/add-login-123` |
| `fix/` | バグ修正 | `fix/auth-bug-456` |
| `docs/` | ドキュメント更新 | `docs/update-readme-789` |
| `refactor/` | リファクタリング | `refactor/user-service-101` |
| `test/` | テスト追加・修正 | `test/add-api-tests-102` |

## PR作成時の必須事項

```bash
git commit -m "feat: [機能名]の実装 (closes #[Issue番号])"
```
