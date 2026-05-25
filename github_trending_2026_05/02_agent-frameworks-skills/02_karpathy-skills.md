# multica-ai/andrej-karpathy-skills

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) |
| 言語 | Markdown（設定ファイル） |
| 総スター数 | 143,089 |
| 本日のスター | +2,590 |
| ライセンス | MIT |
| トレンド順位 | #3（2026/05/22） |
| カテゴリ | エージェントフレームワーク / 行動制御 |

---

## 概要

Andrej Karpathy（元OpenAI共同創業者・元Tesla AIディレクター）がLLMのコーディング上の問題点として指摘した課題を解決するための `CLAUDE.md` 1ファイル。

「AIが勝手な仮定を立てて進んでしまう」「不必要なコードを書きすぎる」「関係ない箇所まで書き換える」「完了を検証しない」という4つの問題を、4原則によって根本から修正する。

---

## 4つの原則

| 原則 | 問題 | 解決 |
|------|------|------|
| **Think Before Coding** | 黙って仮定を立ててコードを書き始める | 前提・不確実な点を先に明示してから行動 |
| **Simplicity First** | 「ついでに」余分な機能を追加してしまう | 要求された最小限のコードだけ書く |
| **Surgical Changes** | 近くにある「改善できそう」なコードも変える | 必要な箇所だけを変更する、それ以外は触らない |
| **Goal-Driven Execution** | 「できました」で終わる（検証なし） | 検証可能な成功基準を定義して達成を確認する |

---

## あるとないとの違い

### Simplicity First の例
```
依頼: 「ログイン関数にバリデーションを追加して」

【なし】
→ バリデーション追加 + エラーメッセージのi18n対応 + ローディングスピナー + 
  既存のエラーハンドリングのリファクタリング + ユニットテスト3つ追加

【あり】
→ バリデーション追加のみ（依頼された内容だけ）
```

### Think Before Coding の例
```
依頼: 「このAPIを最適化して」

【なし】
→ 即座にコードを書き始める（どの観点で最適化するか確認なし）

【あり】
→ 「レイテンシ削減ですか？スループット向上ですか？メモリ削減ですか？
   具体的なボトルネックの測定結果はありますか？」と先に確認
```

---

## 環境構築方法

### 方法1：プロジェクトに直接配置（最もシンプル）
```bash
# リポジトリからCLAUDE.mdをダウンロードしてプロジェクトルートに配置
curl -fsSL https://raw.githubusercontent.com/multica-ai/andrej-karpathy-skills/main/CLAUDE.md \
  -o CLAUDE.md

# または既存のCLAUDE.mdに追記
cat karpathy-skills/CLAUDE.md >> CLAUDE.md
```

### 方法2：Claude Codeプラグインとして全プロジェクトに適用
```bash
/plugin install karpathy-skills@claude-plugins-official
# → 全プロジェクトで自動適用
```

### 方法3：Cursor
```bash
# .cursorrules に内容をコピー
cp karpathy-skills/CLAUDE.md .cursorrules
```

### 方法4：他ツールへの適用
```bash
# GitHub Copilot CLI
gh copilot skill add karpathy-skills

# Gemini CLI
cp karpathy-skills/CLAUDE.md .gemini/rules.md
```

### 動作確認
```bash
# Claude Codeに曖昧な依頼をして、確認質問が来るかテスト
claude "このコードをよくして"
# → "よくする" の意味を確認してから行動するようになっていればOK
```

---

## ベストプラクティス

1. **プロジェクト固有のコンテキストを追記:**
```markdown
# CLAUDE.md（karpathy-skillsの後に追記）
## プロジェクト固有ルール
- このプロジェクトではRESTではなくGraphQLを使用
- テストフレームワークはVitestのみ（Jestは使わない）
- 関数は100行以内に収める
```

2. **チームで共有する:**
```bash
# CLAUDE.mdをgitで管理して全員が同じルールで作業
git add CLAUDE.md
git commit -m "Add Karpathy coding guidelines for AI agents"
```

3. **原則の優先度を調整する:**
```markdown
# 特定のフェーズでは別のルールを優先
# 例: プロトタイプ段階では Simplicity First を緩める
## Prototype Phase Rules
- 動作することを最優先にする（コードの整合性は後で改善可）
```

4. **Surgical Changes の境界を明示する:**
```
# 依頼時のベストプラクティス
"src/auth/login.ts の validatePassword 関数のみ変更して。
他のファイルや関数には手を触れないこと"
```

---

## セキュリティ観点

このファイル自体はMarkdownの設定ファイルなのでセキュリティリスクは低い。ただし：

### 注意点
- **「Think Before Coding」の副作用:** AIが敏感な情報（パスワードポリシー・内部API構造）を質問することがある。これはCLAUDE.mdの意図通りだが、回答内容は機密扱いにする
- **「Goal-Driven Execution」でのテスト実行:** 成功基準の確認のために自動テストが実行されるが、テストが外部APIを叩かないよう事前に確認

### CLAUDE.mdに書かないこと
```markdown
# NG: 機密情報をCLAUDE.mdに書かない
API_KEY=sk-...    # ← 絶対ダメ
DB_PASSWORD=...   # ← 絶対ダメ

# OK: 方針・ルールのみ記述
認証にはJWTを使用する（詳細は .env.example を参照）
```

---

## ペルソナ設定と使い方

### ペルソナ：原田 大介（40歳・フリーランスエンジニア・1人でWebアプリを複数保守）

原田さんはClaude Codeで作業効率を上げようとしているが、「ちょっとしたバグ修正を頼むと、AIが大量の関連ファイルまで書き換えてしまう」「頼んでいないテストが大量に生成される」「コードの目的が変わってしまうことがある」という問題に悩んでいた。

```bash
# CLAUDE.mdをプロジェクトルートに配置

# 以前の悩み
claude "getUserById のエラーハンドリングを改善して"
→ エラーハンドリング修正 + 全エラーメッセージのリファクタリング + 
   関連する全関数のJSDoc追加 + 3つの新しいテスト
→ 原田さん: 「頼んでないことまでやってる...レビューが大変」

# karpathy-skills適用後
claude "getUserById のエラーハンドリングを改善して"
→ "何を改善しますか？ null の場合のハンドリング？ネットワークエラー？
   それとも別の観点ですか？"
原田: "nullの場合に404エラーを返すようにして"
→ getUserById の null チェック1箇所のみ変更
→ 原田さん: 「これだけ変わったのか、一目でわかる！」

# 1ヶ月後の変化:
# - 「頼んでないことをされた」イライラがほぼゼロに
# - PRのレビュー時間が半分に
# - git diffが読みやすくなった
```

---

## 周辺情報

### 参考：Karpathy氏の指摘（原文）
> "The models make wrong assumptions on your behalf and just run along with them without checking."

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| superpowers (#5) | より包括的なワークフロー強制（7フェーズ） |
| agency-agents (#17) | 専門エージェント役割の定義 |
| awesome-claude-code | Claude Code設定・スキル集（コミュニティ） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/multica-ai/andrej-karpathy-skills)
- [Andrej Karpathy のTweet（元の指摘）](https://twitter.com/karpathy)
