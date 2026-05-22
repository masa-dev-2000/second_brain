# openai/codex

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [openai/codex](https://github.com/openai/codex) |
| 言語 | Rust |
| 総スター数 | 84,407 |
| 本日のスター | +321 |
| ライセンス | Apache 2.0 |
| トレンド順位 | #29相当（2026/05/22） |
| カテゴリ | AIコーディングツール / ターミナルエージェント |

---

## 概要

OpenAIが開発するターミナル向けAIコーディングエージェント。Rustで書かれた軽量CLIで、ChatGPT Plus/Pro/Business/Edu/Enterpriseプランのユーザーは追加費用なしで使用できる。

VS Code・Cursor・WindsurfのIDE拡張としても利用可能で、コードベースを直接参照しながらAIが実装・修正・テストを実行する。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| コード生成・編集 | 自然言語でファイルの作成・変更を指示 |
| シェルコマンド実行 | テストの実行・ビルド・デプロイを自動化 |
| コードベース参照 | プロジェクト全体のコンテキストを把握して提案 |
| 多段階タスク実行 | 「テスト書いてパスするまで修正して」を自律実行 |
| マルチファイル編集 | 複数ファイルにまたがる変更を一括処理 |

---

## あるとないとの違い

| 観点 | ない場合（ChatGPT Web） | ある場合 |
|------|------------------------|----------|
| コードの参照 | コピペして貼り付け | プロジェクト全体を直接参照 |
| 実行確認 | 手動でターミナルに貼り付けて実行 | エージェントが自動実行・結果確認 |
| 反復修正 | エラーを手動でコピーして再質問 | エラーを自分で読んで自動修正 |
| コスト | ChatGPT Plus（$20/月）の範囲内 | 追加費用なし（Plusユーザーなら） |

---

## 環境構築方法

### 前提条件
- ChatGPT Plus/Pro/Business/Edu/Enterprise アカウント（API別課金でも可）
- Node.js 18以上（npmインストールの場合）

### インストール手順
```bash
# npmでグローバルインストール（推奨）
npm install -g @openai/codex

# またはHomebrew（Mac）
brew install openai-codex

# またはpipx
pipx install openai-codex
```

### 認証設定
```bash
# ChatGPTアカウントでログイン
codex login
# → ブラウザでOpenAIの認証画面が開く

# または APIキーで設定（APIユーザー向け）
export OPENAI_API_KEY="sk-..."
```

### IDE拡張のインストール
```bash
# VS Code
code --install-extension openai.codex

# Cursor: Extensions > OpenAI Codex で検索
# Windsurf: Extensions > OpenAI Codex で検索
```

### 動作確認
```bash
codex --version
cd my-project
codex "このプロジェクトの構成を説明して"
```

---

## ベストプラクティス

1. **作業前にgit commitしておく:**
```bash
git add -A && git commit -m "codex作業前のスナップショット"
codex "ユーザー認証機能を追加して"
```

2. **タスクを具体的に指示する:**
```bash
# 曖昧（避ける）
codex "バグを直して"

# 具体的（推奨）
codex "src/api/users.ts の createUser 関数でメールアドレスの重複チェックをしていない。
      既存ユーザーのメールが入力された場合に409エラーを返すようにして"
```

3. **テストファーストで依頼する:**
```bash
codex "まず失敗するテストを書いて、次にそのテストが通るように実装して"
```

4. **大きな変更は段階的に:**
```bash
# 一度に全部やらせない
codex "まずモデル層だけ変更して、動作を確認してから次のステップに進もう"
```

---

## セキュリティ観点

### シェルコマンド実行のリスク
- エージェントが `rm -rf` や `git push --force` など破壊的なコマンドを実行する可能性
- **対策:** `--safe-mode` フラグでシェルコマンド実行を制限

```bash
# 安全モード（シェルコマンド実行前に確認を求める）
codex --safe-mode "全ファイルのインポートを整理して"

# 読み取り専用モード
codex --read-only "このコードベースのアーキテクチャを説明して"
```

### 機密情報の扱い
- コードベース全体がOpenAIのAPIに送信される
- `.env` ファイルや `secrets/` ディレクトリは `.codexignore` で除外する

```bash
# .codexignore
.env*
secrets/
*.pem
*.key
config/credentials.yml.enc
```

### API利用規約
- ChatGPTプランで使う場合、入力データはOpenAIのポリシーに従って処理される
- 企業の機密コードを扱う場合はEnterprise契約でデータ処理合意書（DPA）を締結する

---

## ペルソナ設定と使い方

### ペルソナ：山田 翔（24歳・新卒エンジニア・Rails担当）

山田さんはClaude CodeはAnthropicのAPIキーが必要で費用が心配。でもChatGPTのコピペ作業に時間を取られていた。ChatGPT Plusは契約済みで月$20払っているのに、ターミナルで使えないことが不満だった。

```bash
# ChatGPT Plusユーザーなので追加費用ゼロで使える
npm install -g @openai/codex
codex login  # ChatGPTアカウントでログイン

cd rails-app

# N+1クエリの修正
codex "このアプリのN+1クエリを全部見つけて修正して。
      Bullet gemのログを参考にして"
→ コードベースを読んで includes() を適切な箇所に追加

# 新機能の追加
codex "商品レビュー機能を追加して。モデル・マイグレーション・コントローラー・
      ビューまで全部作って。テストも書いて"
→ 一連のファイルを作成・テスト実行まで自動化

# 先輩に聞く前に
codex "このdeviseの設定で2FAを有効にする方法を教えて。実装もして"
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| Claude Code | Anthropic製・高品質・有料 |
| oh-my-pi (#11) | マルチモデル対応・LSP・デバッガー統合 |
| Gemini CLI (#37) | Google製・無料枠あり |
| Aider | オープンソース・マルチモデル |

---

## 参考リンク

- [公式リポジトリ](https://github.com/openai/codex)
- [OpenAI公式ドキュメント](https://platform.openai.com/docs)
