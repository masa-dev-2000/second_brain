# LearningCircuit/local-deep-research

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [LearningCircuit/local-deep-research](https://github.com/LearningCircuit/local-deep-research) |
| 言語 | Python |
| 総スター数 | 7,882 |
| ライセンス | MIT |
| カテゴリ | RAG・セカンドブレイン / ローカルDeepResearch |

---

## 概要

完全ローカル動作のDeep Researchシステム。Qwen3.6-27B + ローカル検索エンジンでSimpleQAベンチマーク約95%を達成。OpenAI Deep Research・Perplexityと同等の調査能力を、自分のPCで・無料で・プライベートに実行できる。

arXiv・PubMed・Wikipedia・自前ドキュメントに対応し、検索結果を統合して長文レポートを自動生成。すべての処理が暗号化されてローカルで完結する。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **マルチソース検索** | arXiv・PubMed・Wikipedia・DuckDuckGo・SearXNG等10+検索エンジン対応 |
| **プライベートドキュメント** | 自前のPDF・テキストを検索対象に追加 |
| **ローカルLLM** | llama.cpp・Ollama・OpenAI・Anthropic・Gemini対応 |
| **長文レポート生成** | 複数の検索結果を統合して構造化レポートを自動生成 |
| **完全暗号化** | すべてのデータがローカルに留まる |
| **SimpleQA 95%** | Qwen3-27Bで業界最高水準の精度 |

---

## あるとないとの違い

| 観点 | Perplexity / OpenAI Deep Research | local-deep-research |
|------|----------------------------------|---------------------|
| プライバシー | 検索内容がサービスに送信 | 完全ローカル |
| 費用 | $20〜$200/月 | 電気代のみ |
| カスタムソース | 限定的 | 自前ドキュメントを追加できる |
| オフライン利用 | 不可 | ローカルモデルなら可能 |
| 精度 | 高い | ほぼ同等（SimpleQA ~95%） |

---

## 環境構築方法

### インストール
```bash
git clone https://github.com/LearningCircuit/local-deep-research
cd local-deep-research

pip install -e .
# または
pip install local-deep-research
```

### 設定ファイル
```bash
cp config/settings.toml.example config/settings.toml
```

```toml
# config/settings.toml

[llm]
provider = "ollama"          # ollama / openai / anthropic / google
model = "qwen2.5:7b"         # ローカルモデル名
# api_key = "sk-..."         # クラウドLLMの場合

[search]
engines = ["searxng", "arxiv", "wikipedia"]
searxng_url = "http://localhost:8080"  # SearXNGを使う場合

[privacy]
encrypt_results = true
local_only = true
```

### SearXNGの起動（推奨）
```bash
# SearXNG = プライバシー重視の自己ホスト検索エンジン
docker run -d -p 8080:8080 searxng/searxng:latest
```

### Ollamaのセットアップ
```bash
# Ollamaインストール後
ollama pull qwen2.5:7b       # 軽量（4.7GB）
ollama pull qwen2.5:32b      # 高精度（19GB）・GPU推奨
```

### 動作確認
```bash
# CLIで調査を実行
ldr search "量子コンピューティングが暗号技術に与える影響"

# → レポートが生成されれば成功
```

---

## ベストプラクティス

1. **調査の深さを用途に応じて設定:**
```bash
# 素早く概要をつかむ
ldr search "テーマ" --depth quick

# 詳細なレポート（デフォルト）
ldr search "テーマ" --depth moderate

# 最高精度の深掘り（時間がかかる）
ldr search "テーマ" --depth comprehensive
```

2. **自前ドキュメントを検索対象に追加:**
```python
from local_deep_research import ResearchEngine

engine = ResearchEngine()

# 社内文書・論文PDFをインデックス化
engine.add_documents("./my_documents/")

# 通常の検索ソースと組み合わせて調査
result = engine.research(
    "AIガバナンスに関する自社の方針と業界動向を統合してレポート化して"
)
```

3. **arXiv特化モードで最新論文を調査:**
```python
engine = ResearchEngine(search_engines=["arxiv"])
result = engine.research(
    "2025年以降のトランスフォーマーアーキテクチャの改善手法",
    date_filter="2025-01-01:"  # 2025年以降の論文のみ
)
```

4. **Pythonから呼び出してパイプラインに組み込む:**
```python
from local_deep_research import quick_summary

# 短い要約を素早く取得
summary = quick_summary("Rustのメモリ安全性モデル")

# 長文レポートを取得
from local_deep_research import generate_report
report = generate_report(
    query="LLMエージェントのセキュリティリスク",
    output_format="markdown"
)
with open("research_report.md", "w") as f:
    f.write(report)
```

---

## セキュリティ観点

### 完全プライベート設定
```toml
[privacy]
local_only = true          # 外部APIへの通信を完全禁止
encrypt_results = true     # 結果を暗号化して保存
clear_cache_on_exit = true # 終了時にキャッシュを削除

[llm]
provider = "ollama"        # ローカルLLMのみ使用

[search]
engines = ["searxng"]      # 自己ホスト検索エンジンのみ
```

### 企業利用での注意点
- 外部LLMを使う場合は検索クエリとドキュメントのコンテキストがAPIに送信される
- 機密情報を含む調査はOllama + SearXNGの完全ローカル構成を使用する

---

## ペルソナ設定と使い方

### ペルソナ：野口 淳（38歳・製薬会社の研究員・競合パイプラインの文献調査を毎月実施）

野口さんは月に1回、競合他社の創薬パイプラインに関する文献調査レポートを作成する。PubMed・ClinicalTrials・arXivを横断して最新情報を収集し、10〜20ページのレポートにまとめるのに3〜4日かかっていた。また、調査内容（競合情報）を外部のAIサービスに入力することを会社のポリシーで禁じられていた。

```python
from local_deep_research import ResearchEngine

# 完全ローカル設定（機密データのため）
engine = ResearchEngine(
    llm_provider="ollama",
    llm_model="qwen2.5:32b",  # 高精度モデル
    search_engines=["pubmed", "arxiv", "clinicaltrials"],
    local_only=True,
)

# 競合パイプライン調査
topics = [
    "A社のGLP-1受容体作動薬 Phase 3 試験",
    "B社のADC（抗体薬物複合体）2025年以降のパイプライン",
    "mRNAがん治療薬の最新臨床試験動向",
]

reports = []
for topic in topics:
    report = engine.research(
        topic,
        depth="comprehensive",
        output_format="markdown",
    )
    reports.append(report)

# 統合レポートを生成
final_report = engine.synthesize(
    reports,
    title="2026年Q2 競合パイプライン調査レポート"
)

with open("pipeline_report_2026Q2.md", "w") as f:
    f.write(final_report)

# 効果:
# 調査時間: 3〜4日 → 数時間（自動収集・統合）
# 外部サービス不使用: 社内ポリシー準拠
# 毎月の調査をほぼ自動化
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| Perplexity | 高品質なクラウドDeepResearch（プライバシーなし・月額課金） |
| OpenAI Deep Research | ChatGPT Plus/Pro限定のDeepResearch機能 |
| khoj (#01) | 個人ノートとWebを横断する調査（常時稼働型） |
| LightRAG (#02) | RAGエンジン（調査自動化機能なし） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/LearningCircuit/local-deep-research)
