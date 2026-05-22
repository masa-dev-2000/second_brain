# rtk-ai/rtk（Rust Token Killer）

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [rtk-ai/rtk](https://github.com/rtk-ai/rtk) |
| 言語 | Rust |
| 総スター数 | 52,397 |
| 本日のスター | +609 |
| ライセンス | Apache 2.0 |
| トレンド順位 | #24相当（2026/05/22） |
| カテゴリ | AIプラットフォーム / トークンコスト最適化 |

---

## 概要

AIコーディングエージェントが実行するシェルコマンド（git・cargo・npm・docker等）の出力をAIに渡す前にフィルタリング・圧縮するCLIツール。単一のRustバイナリで動作し、ゼロ依存で導入できる。

100以上のコマンドに対応し、標準的な開発セッションでトークン消費を60〜90%削減する。Claude Code・Copilot CLI・Cursor・Gemini CLI等9以上のAIツールと透過的に統合できる。

---

## 4つの最適化戦略

| 戦略 | 動作 | 効果 |
|------|------|------|
| **スマートフィルタリング** | 重要な行だけを残す（エラー・変更・サマリー） | 出力量-70% |
| **グループ化** | 類似した行をまとめる（同じエラーが100行→1行+「99件省略」） | 繰り返し除去 |
| **インテリジェント切り捨て** | 最初と最後の重要部分を保持して中間を省略 | 大規模出力を処理可能に |
| **重複排除** | 同一内容の繰り返し行を1行に圧縮 | ログ出力の圧縮 |

---

## あるとないとの違い

| コマンド | 通常の出力行数 | RTK後の出力行数 |
|---------|-------------|----------------|
| `git status`（変更50ファイル） | 60行 | 8行 |
| `cargo test`（テスト1000件） | 2,000行 | 15行 |
| `npm install`（依存関係100件） | 400行 | 12行 |
| `docker logs --tail 500` | 500行 | 30行 |
| 30分のセッション合計 | 約118,000トークン | 約40,000トークン（-66%） |

---

## 環境構築方法

### 前提条件
- なし（単一バイナリ、ゼロ依存）

### インストール手順
```bash
# Mac（Homebrew）
brew install rtk-ai/tap/rtk

# または curl でバイナリをダウンロード（Mac/Linux）
curl -fsSL https://rtk.ai/install.sh | sh

# Windows（PowerShell）
irm https://rtk.ai/install.ps1 | iex

# または cargo でビルド
cargo install rtk
```

### Claude Code との統合
```bash
# 自動フックを設定（推奨）
rtk setup --tool claude-code
# → ~/.claude/settings.json に自動でフックを追加

# 手動設定の場合
# ~/.claude/settings.json
{
  "hooks": {
    "postToolUse": "rtk optimize --tool claude-code"
  }
}
```

### 他ツールとの統合
```bash
rtk setup --tool copilot   # GitHub Copilot CLI
rtk setup --tool cursor    # Cursor
rtk setup --tool gemini    # Gemini CLI
rtk setup --tool aider     # Aider
```

### 動作確認
```bash
rtk --version

# 単体でテスト
git status | rtk optimize --command git-status
# → 圧縮された出力が表示される

# 統計を確認
rtk stats
# → 今週の節約量が表示される
```

---

## ベストプラクティス

1. **特定コマンドのチューニング:**
```bash
# カスタムフィルタリングルールを追加
rtk config add-rule \
  --command "npm test" \
  --keep-lines "PASS|FAIL|Error|Coverage" \
  --remove-lines "console.log"
```

2. **プロジェクト固有の設定:**
```yaml
# .rtk.yaml（プロジェクトルートに置く）
rules:
  - command: "pytest"
    max_lines: 50
    keep_patterns:
      - "PASSED"
      - "FAILED"
      - "ERROR"
      - "=== short test summary ==="
```

3. **統計ダッシュボードで節約を可視化:**
```bash
# 週次レポートを確認
rtk stats --period week
# → 例: "この週: 847,000トークン節約 / 推定$25.40節約"
```

4. **過度な圧縮に注意:**
```bash
# 詳細なエラー情報が必要な場合は詳細モードで確認
rtk disable  # 一時的に無効化
cargo build  # 完全な出力で確認
rtk enable   # 再有効化
```

---

## セキュリティ観点

### データの流れ
- RTKはローカルで動作し、コマンド出力を処理する
- **クラウドには何も送信しない**（プライバシーオプトインのテレメトリのみ・デフォルトOFF）

```bash
# テレメトリが無効であることを確認
rtk config show | grep telemetry
# → "telemetry: disabled" が表示されることを確認

# または明示的に無効化
rtk config set telemetry disabled
```

### フィルタリングの注意点
- RTKが圧縮したコマンド出力には、本来重要なエラーメッセージが省略される可能性がある
- 重要な作業（本番デプロイ・データベース移行等）では `rtk disable` で一時的に無効化する

```bash
# 本番デプロイ時
rtk disable
kubectl apply -f deployment.yaml    # 完全な出力を確認
rtk enable
```

---

## ペルソナ設定と使い方

### ペルソナ：渡辺 光（26歳・個人開発者・副業でSaaSを構築中）

渡辺さんはClaude Codeを使って副業SaaSを開発中だが、先月のAPI代が$150を超えて焦っていた。コスト削減策を探してRTKを発見した。

```bash
# インストール（2分）
brew install rtk-ai/tap/rtk
rtk setup --tool claude-code

# 翌日のClaude Code作業
# → 自動でRTKが全コマンド出力を最適化

# 1週間後
rtk stats --period week
"この週:
  処理コマンド数: 423
  節約トークン: 284,000
  推定節約額: $8.52"

# 1ヶ月後
rtk stats --period month
"この月:
  節約トークン: 1,240,000
  推定節約額: $37.20"

# API代: $150 → $113 (25%削減)
# さらにcodegraph(#2)と組み合わせで $150 → $55まで削減できた
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| codegraph (#2) | コード構造のインデックス化によるツール呼び出し削減 |
| free-claude-code (#27) | バックエンドを無料モデルに切り替え |
| sub2api (#31) | チームでのコスト配分・管理 |

### トークン節約の組み合わせ効果
```
RTK単独:            -60〜70%
codegraph単独:      -35%
RTK + codegraph:    -75〜80%（試算）
```

---

## 参考リンク

- [公式リポジトリ](https://github.com/rtk-ai/rtk)
