# mukul975/Anthropic-Cybersecurity-Skills

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [mukul975/Anthropic-Cybersecurity-Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills) |
| 言語 | Python |
| 総スター数 | 8,465 |
| ライセンス | MIT |
| カテゴリ | AIコーディングツール / AIエージェント向けサイバーセキュリティスキル集 |

---

## 概要

**AIエージェント向けサイバーセキュリティスキル754個**を5つのセキュリティフレームワークにマッピングして提供。Claude Code等のAIコーディングエージェントがセキュリティタスクを実行できるようにする専門スキル集。

NIST CSF・MITRE ATT&CK・ISO 27001・CIS Controls・OWASP等の主要フレームワークを網羅。セキュリティエンジニアがAIエージェントを使ったセキュリティ自動化を構築する際の出発点となる。

---

## マッピングされているフレームワーク

| フレームワーク | カバーするスキル数 | 用途 |
|--------------|----------------|------|
| **NIST CSF** | ~200 | 特定・防護・検知・対応・復旧 |
| **MITRE ATT&CK** | ~250 | 攻撃戦術・技術・手順（TTP） |
| **ISO 27001** | ~150 | 情報セキュリティマネジメント |
| **CIS Controls** | ~100 | 実装優先度付きセキュリティ制御 |
| **OWASP** | ~54 | Webアプリケーションセキュリティ |

---

## あるとないとの違い

| 観点 | 汎用Claude Code | + Cybersecurity-Skills |
|------|----------------|----------------------|
| 脆弱性スキャン | 汎用的なコードレビュー | OWASP Top10に対応した専門スキャン |
| インシデント対応 | アドホックな指示 | NIST CSFに沿ったワークフロー |
| 脅威モデリング | 経験に依存 | MITRE ATT&CKベースの体系的分析 |
| コンプライアンス確認 | 手動チェック | ISO 27001・CIS Controls自動検証 |

---

## 環境構築方法

```bash
git clone https://github.com/mukul975/Anthropic-Cybersecurity-Skills
cd Anthropic-Cybersecurity-Skills

# Claude Codeにスキルを追加
/add-skill ./skills/owasp/
/add-skill ./skills/mitre-attack/
/add-skill ./skills/nist-csf/
```

### 代表的なスキルの使い方

```bash
# OWASPスキャン（Webアプリのセキュリティ診断）
/owasp-scan --target ./src/api/

# MITRE ATT&CK脅威モデリング
/threat-model --system "Webアプリ+DB+外部API" --framework mitre-attack

# NIST CSF対応状況の評価
/csf-assess --scope "認証・認可・セッション管理"

# インシデント対応プレイブックの生成
/incident-playbook --type "データ漏洩" --framework nist-csf

# CIS Controlsチェックリストの自動実行
/cis-audit --controls 1,2,3,6,16  # 優先度の高い制御を検証
```

---

## ベストプラクティス

1. **CI/CDパイプラインに組み込む:**
```yaml
# .github/workflows/security.yml
- name: Security Scan with Claude Code
  run: |
    claude-code run /owasp-scan --target ./src --report json
    claude-code run /secrets-detection --strict
    claude-code run /dependency-audit --cvss-threshold 7.0
```

2. **コードレビュー時のセキュリティチェック:**
```bash
# PRレビュー時に自動実行
/security-review --diff HEAD~1 --framework owasp
# → 変更箇所のOWASP Top10リスクを自動検出・コメント
```

3. **脅威モデリングをアーキテクチャ設計に活用:**
```bash
# 新機能の設計時
/threat-model \
  --description "ユーザーがファイルをアップロードしてAIで分析する機能" \
  --output markdown
# → STRIDE分析・攻撃ツリー・緩和策を自動生成
```

---

## セキュリティ観点

```python
# これ自体がセキュリティツールであるため:
# 1. 本番システムへの実行前にステージングで検証する
# 2. スキャン結果に含まれる脆弱性情報を安全に管理する
# 3. MITRE ATT&CKのスキルは攻撃シミュレーション用途
#    → 自社システムの検証目的のみ使用

# ペネトレーションテスト系スキルは
# 明示的な授権なしに外部システムに使用しない
```

---

## 周辺情報

| ツール | 特徴 |
|--------|------|
| [awesome-claude-code](./11_awesome-claude-code.md) | Claude Code汎用スキル集 |
| promptfoo | LLMのセキュリティテスト・レッドチーム |
| OpenLit | プロンプトインジェクション検知 |
| Semgrep | 静的解析によるコードセキュリティスキャン |

---

## 参考リンク

- [公式リポジトリ](https://github.com/mukul975/Anthropic-Cybersecurity-Skills)
