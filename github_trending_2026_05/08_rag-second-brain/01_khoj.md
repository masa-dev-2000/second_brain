# khoj-ai/khoj

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [khoj-ai/khoj](https://github.com/khoj-ai/khoj) |
| 言語 | Python |
| 総スター数 | 34,646 |
| ライセンス | AGPL-3.0 |
| カテゴリ | RAG・セカンドブレイン / 自己ホスト型AIセカンドブレイン |

---

## 概要

自己ホスト可能なAIセカンドブレイン。Obsidian・Notion・ローカルファイル・Webを横断してRAGで検索・回答し、カスタムエージェントの作成・定期実行・ディープリサーチも行える。GPT・Claude・Gemini・Llama・Qwen・Mistralなど任意のLLMに対応。

WhatsApp・Emacs・Obsidianプラグイン経由でアクセスでき、「自分のドキュメントに聞く」という体験をフル機能で提供する。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **RAG検索** | Obsidian/Notion/ローカルファイル/Webを横断して回答 |
| **カスタムエージェント** | 専門特化エージェントを作成して使い分け |
| **ディープリサーチ** | 複数ソースを調査して長文レポートを自動生成 |
| **スケジュール実行** | 定期的に調査・要約を自動実行してメール/通知 |
| **画像生成** | Stable Diffusion/DALL-E連携 |
| **マルチアクセス** | Web UI・WhatsApp・Obsidianプラグイン・Emacs |

---

## あるとないとの違い

| 観点 | ない場合 | ある場合 |
|------|----------|----------|
| 自分のノートへの質問 | 全文検索でキーワードを探す | 「先月の会議で決まったAWS移行の理由は？」と自然言語で聞ける |
| Web+ノートの横断検索 | 別々にタブを開いて手動統合 | 自分のノート・Web・ドキュメントを同時に参照して回答 |
| 週次まとめ | 手動でノートを読み返す | 毎週月曜にメールで自動サマリーが届く |
| データの場所 | ChatGPTに送信される | 自サーバーで完結 |

---

## 環境構築方法

### Docker（推奨）
```bash
# docker-compose.yml を作成
curl -o docker-compose.yml https://raw.githubusercontent.com/khoj-ai/khoj/master/docker-compose.yml

# 起動
docker-compose up -d

# → http://localhost:42110 でWeb UIにアクセス
```

### pip インストール
```bash
pip install khoj

# 起動
khoj

# → http://localhost:42110 でアクセス
```

### Obsidianプラグインとの連携
```
1. Obsidianのコミュニティプラグインで「Khoj」を検索・インストール
2. プラグイン設定でKhojのURL（http://localhost:42110）を指定
3. ObsidianのVault全体がKhojのインデックスに追加される
4. Obsidian内のチャットパネルから直接質問できる
```

### LLMの設定
```python
# 設定ページ（http://localhost:42110/settings）で以下を選択
# OpenAI: OPENAI_API_KEY を設定
# Anthropic: ANTHROPIC_API_KEY を設定
# ローカル: Ollama を http://localhost:11434 に向ける
```

### 動作確認
```bash
# ドキュメントをインデックス化
# 設定 > データソース > フォルダを追加
# → 「あなたのノートを要約して」と質問して答えが返れば成功
```

---

## ベストプラクティス

1. **Obsidianと統合して「思考の外部化」を実現:**
```
Obsidianでノートを書く
→ Khojが自動インデックス化
→ 「先月読んだ本でAIに関するものは？」と聞くと
  Khojがノートを横断して答えてくれる
→ Obsidianを「外付け脳」として機能させられる
```

2. **週次レビューエージェントを作成:**
```python
# Khoj Web UIでカスタムエージェントを作成
# エージェント名: 週次レビュアー
# プロンプト:
"""
あなたは週次レビューアシスタントです。
毎週月曜日に以下を実行してください:
1. 先週のObsidianノートを読んで主要な学びを3点まとめる
2. 未完了タスクを一覧にする
3. 今週のフォーカスエリアを提案する
"""
# スケジュール: 毎週月曜 9:00
# 通知: メール
```

3. **ディープリサーチで調査を自動化:**
```
「量子コンピューティングがサイバーセキュリティに与える影響について、
 自分のノートとWebの最新情報を統合してレポートを作成して」
→ Khojが自動的に複数ソースを調査して長文レポートを生成
```

4. **WhatsApp経由でモバイルからアクセス:**
```bash
# WhatsApp統合設定（Twilio または WhatsApp Business API）
# 設定 > 統合 > WhatsApp でトークンを設定
# → スマホのWhatsAppからKhojに質問できる
# 外出先で「あの論文のポイントは？」とメッセージを送るだけ
```

---

## セキュリティ観点

### データのプライバシー
```yaml
# docker-compose.yml でローカルのみに制限
services:
  khoj:
    ports:
      - "127.0.0.1:42110:42110"  # localhostのみ（外部からアクセス不可）
```

### 認証の設定
```bash
# 本番環境では認証を有効化
KHOJ_ADMIN_PASSWORD=your-strong-password
KHOJ_DJANGO_SECRET_KEY=your-secret-key
```

### ドキュメントの取り扱い
- インデックス化されたドキュメントは自サーバーのDBに保存
- LLM API使用時は**質問とコンテキスト**がAPIプロバイダに送信される
- 完全にプライベートにするにはOllamaのローカルモデルを使用する

---

## ペルソナ設定と使い方

### ペルソナ：伊藤 学（34歳・リサーチャー・Obsidianに3年分のノート5,000件）

伊藤さんはObsidianに読書メモ・論文サマリー・会議メモを3年分蓄積している。「確かあの本にそれと関連することが書いてあったはず」という記憶は正確だが、Obsidianの全文検索では目的の情報に辿り着くのに10〜20分かかることがある。

```
# Khojとの統合後

# ObsidianのKhojパネルで質問:
「機械学習のバイアス問題について自分のノートに何が書いてある？」

→ Khojの回答:
「2024年3月の『Weapons of Math Destruction』読書メモに
 アルゴリズムが再犯率予測に使われる問題が記録されています。
 また2024年8月の論文サマリー（Buolamwini 2023）に
 顔認識のジェンダーバイアスについてのメモがあります。
 さらに先月の社内勉強会メモにも関連する議論が...」

# 検索時間: 15分 → 30秒
# 「あの本に書いてあった」という曖昧な記憶でも引き出せる
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| Obsidian + Smart Connections | Obsidian専用のRAGプラグイン（Webは参照できない） |
| Notion AI | Notion内AIアシスタント（自己ホスト不可・月額課金） |
| local-deep-research (#05) | リサーチ特化（ノート管理機能はない） |
| LightRAG (#02) | RAGエンジン（UI・管理機能はない） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/khoj-ai/khoj)
- [公式ドキュメント](https://docs.khoj.dev/)
- [Obsidianプラグイン](https://obsidian.md/plugins?id=khoj)
