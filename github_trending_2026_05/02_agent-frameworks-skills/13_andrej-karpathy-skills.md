# multica-ai/andrej-karpathy-skills

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) |
| 総スター数 | 152,551 |
| ライセンス | MIT |
| カテゴリ | エージェントフレームワーク・スキル / CLAUDE.md最適化 |

---

## 概要

**LLMコーディングの落とし穴観察から導き出された単一CLAUDE.mdファイル**。Andrej Karpathyのコーディングスタイルと知見を元に、Claude Codeの挙動を大幅に改善するシステムプロンプト集。

「どう指示すればClaude Codeがより良いコードを書くか」を徹底的に研究した結果を、誰でも即座に適用できるCLAUDE.mdとして提供。152k starsはClaude Code設定リポジトリとしては最大規模。

---

## 何が改善されるか

```
Before（デフォルトのClaude Code）:
  - 過剰なコメントを書く
  - 不要な抽象化を導入する
  - エラーハンドリングを過剰に追加する
  - 変数名が冗長になる
  - 既存のスタイルを無視してリファクタする

After（このCLAUDE.mdを適用後）:
  - シンプルで読みやすいコードを優先
  - 実際に必要な抽象化のみ導入
  - コメントはWHYのみ・WHATは書かない
  - 既存コードのスタイルに合わせる
  - 小さく確実な変更を積み重ねる
```

---

## 環境構築方法

### プロジェクトに適用する

```bash
# リポジトリからCLAUDE.mdをコピー
curl -o CLAUDE.md https://raw.githubusercontent.com/multica-ai/andrej-karpathy-skills/main/CLAUDE.md

# プロジェクトのルートに配置
# → Claude Codeが自動的に読み込む
```

### グローバルに適用する

```bash
# 全プロジェクトで有効にする場合
cp CLAUDE.md ~/.claude/CLAUDE.md
```

### CLAUDE.mdの主要な指示内容（抜粋）

```markdown
## コーディング原則

### シンプルさを最優先する
- 動く最もシンプルなコードを書け
- 抽象化は3回以上の繰り返しが出てから導入する
- 将来の要件に備えた設計は不要

### コメントの書き方
- WHATは書くな（コードが説明する）
- WHYだけ書け（制約・意図・落とし穴）
- 自明なコメントは削除する

### 変更の単位
- 一度に変更するのは1つの概念のみ
- 変更理由を明確にしてから実装する
- 既存のパターンに従う

### エラーハンドリング
- 実際に起きうるエラーのみハンドリングする
- 防御的プログラミングは境界のみ
- ネストしたtry/catchは避ける
```

---

## ベストプラクティス

1. **プロジェクト固有の内容を追記する:**
```markdown
# CLAUDE.md（このリポジトリのベース + 追記）

<!-- ↑ andrej-karpathy-skillsのCLAUDE.mdをベースに -->

## このプロジェクト固有のルール
- APIはすべて /api/v1/ プレフィックス
- テストは pytest + fixtures パターン
- DBはSQLAlchemy ORM・生SQLは禁止
```

2. **チームで共有する:**
```bash
# CLAUDE.mdをGitで管理してチーム全員が同じ設定を使う
git add CLAUDE.md
git commit -m "Add CLAUDE.md from karpathy-skills"
# → チーム全員のClaude Codeが同じ原則で動く
```

---

## 周辺情報

| ツール | 特徴 |
|--------|------|
| [awesome-claude-code](../01_ai-coding-tools/11_awesome-claude-code.md) | SkillやHookの集積 |
| [learn-claude-code](../07_media-learning/05_learn-claude-code.md) | Claude Code内部を実装で学ぶ |
| [claude-code-best-practice](https://github.com/shanraisshan/claude-code-best-practice) | 同系のベストプラクティス集（54k stars） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/multica-ai/andrej-karpathy-skills)
