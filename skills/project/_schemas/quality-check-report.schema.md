# .quality-check-report.json Schema

品質チェックスキル (`/quality-check`) が出力し、実装レポートスキル (`/implementation-report`) が入力として読み取るJSONファイルのスキーマ定義。

## フィールド定義

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `cycles` | `Cycle[]` | 必須 | レビューサイクルの配列 |
| `total_cycles` | `number` | 必須 | 完了したサイクル総数 |
| `e2e_result` | `"pass" \| "fail" \| "skipped"` | 必須 | E2Eテスト結果 |
| `e2e_issues` | `string[]` | 必須 | E2Eで検出された問題（なければ空配列） |

### Cycle オブジェクト

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `cycle_number` | `number` | 必須 | サイクル番号（1始まり） |
| `findings` | `Finding[]` | 必須 | このサイクルで検出された指摘事項 |

### Finding オブジェクト

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `source` | `string` | 必須 | 指摘元ペルソナ名（例: "セキュリティエンジニア"） |
| `severity` | `"高" \| "中" \| "低"` | 必須 | 優先度 |
| `description` | `string` | 必須 | 指摘内容の概要 |
| `action` | `"対応済" \| "未対応" \| "対象外"` | 必須 | 対応状況 |
| `detail` | `string` | 任意 | 対応の詳細説明 |

## JSON 例

```json
{
  "cycles": [
    {
      "cycle_number": 1,
      "findings": [
        {
          "source": "セキュリティエンジニア",
          "severity": "高",
          "description": "SQLインジェクション対策確認",
          "action": "対応済",
          "detail": "バインドパラメータ使用を確認"
        }
      ]
    }
  ],
  "total_cycles": 4,
  "e2e_result": "pass",
  "e2e_issues": []
}
```
