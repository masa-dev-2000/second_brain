# google-gemini/gemini-cli

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) |
| 言語 | TypeScript |
| 総スター数 | 104,451 |
| 本日のスター | +100 |
| ライセンス | Apache 2.0 |
| トレンド順位 | #37相当（2026/05/22） |
| カテゴリ | AIコーディングツール / ターミナルエージェント |

---

## 概要

Google DeepMindが開発するターミナル向けGemini AIエージェント。Google AI Studioから無料APIキーを取得するだけで使用可能で、Google検索との統合により最新情報をリアルタイムで参照できる。

コード生成・編集・デバッグ・プロジェクト理解を自然言語で指示でき、Claude Code/Codex等の代替として無料で使い始められる入門向けツール。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| コード生成・編集 | ファイルの作成・変更を自然言語で指示 |
| Google検索統合 | リアルタイムの情報でグラウンディング |
| シェルコマンド実行 | テスト・ビルド・デプロイの自動化 |
| ファイル操作 | 複数ファイルの読み取り・編集・作成 |
| 長いコンテキスト | Geminiの1M tokenコンテキストウィンドウを活用 |

---

## あるとないとの違い

| 観点 | ない場合 | ある場合 |
|------|----------|----------|
| 最新情報へのアクセス | カットオフ以降の情報は不明 | Google検索で最新ドキュメントをリアルタイム参照 |
| 費用 | Claude Code・Codex は有料 | Google AI Studio無料枠で開始可能 |
| コンテキスト量 | 通常数万トークン | 最大100万トークン（大規模コードベースも一度に読める） |

---

## 環境構築方法

### 前提条件
- Node.js 18以上
- Google アカウント（無料）
- Google AI Studio APIキー（無料取得可）

### APIキーの取得（無料）
```
1. https://aistudio.google.com/ にアクセス
2. 「Get API key」をクリック
3. 「Create API key in new project」
4. 生成されたキーをコピー
# 無料枠: 1分60リクエスト、1日1500リクエスト
```

### インストール手順
```bash
# npmでグローバルインストール
npm install -g @google/gemini-cli

# または npx で即実行
npx @google/gemini-cli
```

### 認証設定
```bash
# APIキーを環境変数に設定
export GEMINI_API_KEY="AIza..."

# または ~/.gemini/config.json に設定
mkdir -p ~/.gemini
cat > ~/.gemini/config.json << 'EOF'
{
  "api_key": "AIza...",
  "model": "gemini-2.5-pro"
}
EOF
```

### 動作確認
```bash
gemini --version
gemini "Hello! Pythonで簡単なFizzBuzzを書いて"
```

---

## ベストプラクティス

1. **Google検索を活用して最新ドキュメントを参照:**
```bash
gemini "Next.js 15の新しいApp Routerの機能を調べて、このプロジェクトに適用して"
# → Google検索でNext.js 15の最新ドキュメントを参照した上で実装
```

2. **大規模コードベースへの対応:**
```bash
# 1Mトークンコンテキストを活用
gemini "このモノレポ全体のアーキテクチャを理解して、テスト戦略を提案して"
# → 他のツールより多くのファイルを一度に読める
```

3. **無料枠の効率的な使い方:**
```bash
# 無料枠内（1分60req）で使うために、バッチ処理より対話形式で
gemini  # 対話モードで起動（1セッションで連続作業）
```

4. **Codex・Claude Codeと使い分ける:**
- 最新情報を調べながらコードを書く → Gemini CLI
- 高品質なコード生成・複雑なリファクタリング → Claude Code
- ChatGPT Plusユーザーのコスト節約 → openai/codex

---

## セキュリティ観点

### Googleへのデータ送信
- コードはGoogleのAPIに送信される
- Google AI Studio（無料）では送信データがモデル改善に使われる場合がある
- **対策:** 機密コードを扱う場合はVertex AI（企業向け・データ処理合意書あり）を使用する

```bash
# 企業向け：Vertex AI経由（DPAあり）
export GEMINI_BACKEND=vertex
gcloud auth application-default login
gemini --project my-project "..."
```

### 検索グラウンディングの注意
- Google検索の結果に悪意あるコンテンツが含まれる可能性（まれだが）
- AIが検索結果のコードをそのまま採用しないよう、生成コードは必ずレビュー

---

## ペルソナ設定と使い方

### ペルソナ：橋本 あおい（20歳・情報系学生・個人開発始めたばかり）

橋本さんはAIコーディングツールを使いたいが学生なので有料ツールに月$20は痛い。Claude CodeもGitHub Copilotも試用期間で使ったが、その後コストが気になって使えていない。

```bash
# Google AI Studioで無料APIキーを取得（1分）
export GEMINI_API_KEY="AIza..."
npm install -g @google/gemini-cli

cd my-flask-app

# 授業の課題（最新のFlaskドキュメントを調べながら実装）
gemini "Flask 3.0の新しい非同期サポートを使って、
        ユーザー登録APIエンドポイントを実装して。
        最新のベストプラクティスも教えて"
→ Google検索でFlask 3.0のドキュメントを参照した上で実装

# ポートフォリオ開発
gemini "ReactとFastAPIで作ったこのプロジェクトのREADMEを書いて"

# 就活対策
gemini "このコードをコードレビューして、改善点を指摘して"

# 費用: 月$0（無料枠内で十分）
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| Claude Code | 最高品質・有料 |
| openai/codex (#29) | ChatGPT Plus契約者なら無料 |
| oh-my-pi (#11) | マルチモデル・デバッガー統合 |
| Aider | オープンソース・マルチプロバイダー |

### 無料枠の比較
| サービス | 無料枠 |
|---------|-------|
| Gemini CLI (AI Studio) | 1分60req、1日1500req |
| OpenAI (free tier) | なし（無料ユーザーはChatGPT Webのみ） |
| Claude (free tier) | claude.ai Webのみ（API無料枠なし） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/google-gemini/gemini-cli)
- [Google AI Studio（無料APIキー取得）](https://aistudio.google.com/)
- [Gemini API ドキュメント](https://ai.google.dev/docs)
