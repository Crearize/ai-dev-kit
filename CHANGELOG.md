# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `personal` コマンドに Claude モデルバージョン自動検出＆アップグレード機能
  - 既存設定の `model` がテンプレートと異なる場合、対話プロンプトで確認
  - `--upgrade-model` フラグで非対話アップグレード対応
- `mergeSettings` に `upgradeKeys` オプション（指定キーをテンプレート値で強制上書き）

### Changed

- グローバル設定テンプレートのモデルを `claude-opus-4-6` → `claude-opus-4-7` に更新

## [1.0.0] - 2026-04-09

### Added

- Node.js CLI with `init` and `personal` subcommands
- Interactive setup for Claude Code and Cursor
- superpowers skills (14 development process skills)
- Project skills (8 project operation skills)
- Tech stack support: java-springboot, nextjs-react
- Shared development documents and review guides
- PR template generation
- Global safety settings for personal environments
- `--help`, `--version`, `--dry-run`, `--verbose` CLI options
- Vitest test suite (unit and integration tests)
- OSS standard files (LICENSE, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT)
- Automated superpowers sync via GitHub Actions with auto-merge

### Security

- Input validation for project names (reject control characters)
- Safe template replacement (escape regex special characters)
- EOF handling to prevent infinite loops in prompts
- Error handling with cleanup for partial file operations
