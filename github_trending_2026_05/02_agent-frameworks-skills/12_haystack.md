# deepset-ai/haystack

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [deepset-ai/haystack](https://github.com/deepset-ai/haystack) |
| 言語 | Python |
| 総スター数 | 25,328 |
| ライセンス | Apache-2.0 |
| カテゴリ | AIオーケストレーション / RAG・エージェント・セマンティック検索 |

---

## 概要

Haystackは、本番環境に耐えうるAIアプリケーションを構築するためのオーケストレーションフレームワーク。deepset社が開発・メンテナンスしており、RAG（Retrieval-Augmented Generation）、セマンティック検索、AIエージェントを「パイプライン」という概念でモジュラーに組み合わせられる。

LangChainと並ぶ主要フレームワークだが、Haystackは「本番運用」に特化した設計が特徴。コンポーネントの入出力型が静的に定義されるため、パイプラインの構造をコードを読まずに把握できる。ドキュメント処理（PDF・HTML・CSV等）から検索・生成・評価まで一貫したパイプラインで完結する。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **モジュラーパイプライン** | コンポーネントを接続してRAGや検索フローを構築 |
| **ドキュメント処理** | PDF・HTML・CSV・Markdownなど多形式のインジェスト |
| **ベクトルストア統合** | Elasticsearch・Weaviate・Qdrant・Pinecone等に対応 |
| **マルチLLMサポート** | OpenAI・Anthropic・Cohere・ローカルモデル等に対応 |
| **エージェント機能** | ツール呼び出し・マルチステップ推論のパイプライン |
| **評価フレームワーク** | RAGの精度（MRR・MAP・RAGAS等）を計測する組み込み評価 |
| **YAML設定** | パイプラインをYAMLで定義・バージョン管理が容易 |

---

## あるとないとの違い

| 観点 | 自前実装 | Haystack |
|------|---------|----------|
| ドキュメント変換 | 形式ごとにパーサを自作 | FileTypeRouter + 各Converterで自動ルーティング |
| 検索精度 | キーワード検索のみ | BM25 + ベクトル検索のハイブリッド検索が標準 |
| LLM切り替え | コード全体に依存が散らばる | コンポーネント交換だけで切り替え完了 |
| パイプラインの再利用 | コピペ・分岐が困難 | YAMLで定義・テスト・共有が簡単 |
| RAG精度の測定 | 評価基盤の構築に数日 | 組み込みEvaluatorで即計測 |

---

## 環境構築方法

### インストール
```bash
pip install haystack-ai

# ベクトルストアを使う場合（例: Qdrant）
pip install qdrant-haystack

# ドキュメント変換を使う場合
pip install pypdf trafilatura
```

### 環境変数
```bash
export OPENAI_API_KEY=sk-...
# または Anthropic を使う場合
export ANTHROPIC_API_KEY=sk-ant-...
```

### 最小RAGパイプラインの動作確認
```python
from haystack import Pipeline
from haystack.components.retrievers.in_memory import InMemoryBM25Retriever
from haystack.components.generators import OpenAIGenerator
from haystack.components.builders import PromptBuilder
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack import Document

# ドキュメントストアの準備
store = InMemoryDocumentStore()
store.write_documents([
    Document(content="Haystackはdeepset社が開発したオーケストレーションフレームワークです。"),
    Document(content="RAGとはRetrieval-Augmented Generationの略で、検索と生成を組み合わせた手法です。"),
])

# パイプラインの構築
template = """
以下のドキュメントを参考に質問に答えてください。

ドキュメント:
{% for doc in documents %}
{{ doc.content }}
{% endfor %}

質問: {{ question }}
"""

pipeline = Pipeline()
pipeline.add_component("retriever", InMemoryBM25Retriever(document_store=store))
pipeline.add_component("prompt", PromptBuilder(template=template))
pipeline.add_component("llm", OpenAIGenerator(model="gpt-4o-mini"))

pipeline.connect("retriever", "prompt.documents")
pipeline.connect("prompt", "llm")

result = pipeline.run({"retriever": {"query": "Haystackとは？"}, "prompt": {"question": "Haystackとは？"}})
print(result["llm"]["replies"][0])
```

---

## ベストプラクティス

1. **ドキュメントインジェストパイプラインをファイルタイプ別に自動ルーティングする:**
```python
from haystack.components.routers import FileTypeRouter
from haystack.components.converters import PyPDFToDocument, HTMLToDocument, TextFileToDocument
from haystack.components.preprocessors import DocumentSplitter
from haystack.components.writers import DocumentWriter

ingestion = Pipeline()
ingestion.add_component("router", FileTypeRouter(mime_types=["application/pdf", "text/html", "text/plain"]))
ingestion.add_component("pdf_converter", PyPDFToDocument())
ingestion.add_component("html_converter", HTMLToDocument())
ingestion.add_component("text_converter", TextFileToDocument())
ingestion.add_component("splitter", DocumentSplitter(split_by="sentence", split_length=5))
ingestion.add_component("writer", DocumentWriter(document_store=store))

ingestion.connect("router.application/pdf", "pdf_converter.sources")
ingestion.connect("router.text/html", "html_converter.sources")
ingestion.connect("router.text/plain", "text_converter.sources")
ingestion.connect("pdf_converter", "splitter")
ingestion.connect("html_converter", "splitter")
ingestion.connect("text_converter", "splitter")
ingestion.connect("splitter", "writer")

# 混在ファイル群を一括インジェスト
from pathlib import Path
files = list(Path("./docs").glob("**/*"))
ingestion.run({"router": {"sources": files}})
```

2. **ハイブリッド検索でRAG精度を向上させる:**
```python
from haystack.components.retrievers import InMemoryBM25Retriever, InMemoryEmbeddingRetriever
from haystack.components.joiners import DocumentJoiner
from haystack.components.rankers import MetaFieldRanker

pipeline = Pipeline()
pipeline.add_component("bm25", InMemoryBM25Retriever(document_store=store, top_k=10))
pipeline.add_component("embedding", InMemoryEmbeddingRetriever(document_store=store, top_k=10))
pipeline.add_component("joiner", DocumentJoiner(join_mode="reciprocal_rank_fusion"))
pipeline.add_component("prompt", PromptBuilder(template=template))
pipeline.add_component("llm", OpenAIGenerator(model="gpt-4o"))

pipeline.connect("bm25", "joiner")
pipeline.connect("embedding", "joiner")
pipeline.connect("joiner", "prompt.documents")
pipeline.connect("prompt", "llm")
```

3. **パイプラインをYAMLで保存・バージョン管理する:**
```python
# パイプラインをYAMLに保存
with open("rag_pipeline.yaml", "w") as f:
    pipeline.dump(f)

# YAMLから読み込み
from haystack.core.serialization import default_from_dict
import yaml

with open("rag_pipeline.yaml") as f:
    loaded = Pipeline.load(f)

result = loaded.run({"retriever": {"query": "質問"}})
```

4. **組み込み評価器でRAGの品質を継続的に計測する:**
```python
from haystack.components.evaluators import (
    ContextRelevanceEvaluator,
    FaithfulnessEvaluator,
    SASEvaluator,
)

eval_pipeline = Pipeline()
eval_pipeline.add_component("context_relevance", ContextRelevanceEvaluator())
eval_pipeline.add_component("faithfulness", FaithfulnessEvaluator())

# 評価データセットで実行
questions = ["Haystackとは？", "RAGの利点は？"]
contexts = [retrieved_docs_1, retrieved_docs_2]
responses = ["回答1", "回答2"]

results = eval_pipeline.run({
    "context_relevance": {"questions": questions, "contexts": contexts},
    "faithfulness": {"questions": questions, "contexts": contexts, "responses": responses},
})
print(f"Context Relevance: {results['context_relevance']['score']:.3f}")
print(f"Faithfulness: {results['faithfulness']['score']:.3f}")
```

---

## セキュリティ観点

### プロンプトインジェクション対策
```python
import re
from haystack import component

@component
class InputSanitizer:
    """ユーザー入力をサニタイズするカスタムコンポーネント"""

    @component.output_types(sanitized_query=str)
    def run(self, query: str) -> dict:
        # プロンプトインジェクションを示すパターンを検出
        dangerous_patterns = [
            r"ignore previous instructions",
            r"disregard.*system",
            r"you are now",
        ]
        for pattern in dangerous_patterns:
            if re.search(pattern, query, re.IGNORECASE):
                raise ValueError(f"不正な入力が検出されました: {query[:50]}")
        return {"sanitized_query": query.strip()[:500]}  # 長さも制限
```

### APIキーの安全な管理
```bash
# .env ファイルを使用し、コードにAPIキーを直接書かない
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# 本番環境ではAWS Secrets ManagerやVaultを使用
```

### ドキュメントストアへのアクセス制御
- Qdrant・Weaviate等のセルフホスト型ストアにはAPIキー認証を必ず設定する
- マルチテナント環境では、ユーザーごとにフィルタリングを実施してドキュメントの混在を防ぐ
- インジェストパイプラインへのアクセスは管理者権限に限定し、一般ユーザーはクエリのみ可能にする

---

## ペルソナ設定と使い方

### ペルソナ：佐藤 恵（38歳・法律事務所のシステム担当・契約書検索システムを構築中）

佐藤さんは数百件の契約書（PDF）を弁護士がすばやく検索・質問できるシステムを求めている。既存のキーワード検索では条項の意味的な検索ができず、弁護士から「もっとインテリジェントな検索を」と要望があった。

```python
# 契約書RAGシステムの実装例

from haystack import Pipeline, Document
from haystack.components.converters import PyPDFToDocument
from haystack.components.preprocessors import DocumentSplitter, DocumentCleaner
from haystack.components.embedders import OpenAIDocumentEmbedder, OpenAITextEmbedder
from haystack.components.writers import DocumentWriter
from haystack.components.retrievers import QdrantEmbeddingRetriever
from haystack.components.generators import OpenAIGenerator
from haystack.components.builders import PromptBuilder
from haystack_integrations.document_stores.qdrant import QdrantDocumentStore

# --- Step 1: インジェストパイプライン ---
store = QdrantDocumentStore(url="http://localhost:6333", index="contracts", embedding_dim=1536)

ingest = Pipeline()
ingest.add_component("converter", PyPDFToDocument())
ingest.add_component("cleaner", DocumentCleaner(remove_extra_whitespaces=True))
ingest.add_component("splitter", DocumentSplitter(split_by="word", split_length=300, split_overlap=50))
ingest.add_component("embedder", OpenAIDocumentEmbedder(model="text-embedding-3-small"))
ingest.add_component("writer", DocumentWriter(document_store=store))

ingest.connect("converter", "cleaner")
ingest.connect("cleaner", "splitter")
ingest.connect("splitter", "embedder")
ingest.connect("embedder", "writer")

# 契約書PDFを一括インジェスト（メタデータ付き）
from pathlib import Path
pdf_files = list(Path("/contracts").glob("*.pdf"))
ingest.run({"converter": {"sources": pdf_files}})

# --- Step 2: 質問応答パイプライン ---
template = """
あなたは法律の専門家アシスタントです。
以下の契約書の条項を参照して、質問に正確に答えてください。
根拠となる条項番号があれば明示してください。

参照条項:
{% for doc in documents %}
[{{ loop.index }}] {{ doc.content }}
{% endfor %}

質問: {{ question }}

回答（根拠となる条項を示してください）:
"""

rag = Pipeline()
rag.add_component("embedder", OpenAITextEmbedder(model="text-embedding-3-small"))
rag.add_component("retriever", QdrantEmbeddingRetriever(document_store=store, top_k=5))
rag.add_component("prompt", PromptBuilder(template=template))
rag.add_component("llm", OpenAIGenerator(model="gpt-4o"))

rag.connect("embedder.embedding", "retriever.query_embedding")
rag.connect("retriever", "prompt.documents")
rag.connect("prompt", "llm")

# 弁護士からの質問
answer = rag.run({
    "embedder": {"text": "解約通知期間は何日前までに行う必要がありますか？"},
    "prompt": {"question": "解約通知期間は何日前までに行う必要がありますか？"}
})
print(answer["llm"]["replies"][0])
# → "第12条(解約)によれば、解約通知は30日前までに書面で行う必要があります。..."
```

**導入前後の変化:**
- 導入前: 弁護士がPDF全文をCtrl+Fで手動検索 → 1件の確認に平均15分
- 導入後: 自然言語で質問 → 関連条項を5秒以内に提示、根拠条項も明示

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| LangChain | 最大のエコシステム、柔軟性が高いが複雑になりやすい |
| LlamaIndex | データインデクシングに特化、Haystack同様の本番志向 |
| LangGraph (#08) | グラフ型エージェントフロー、LangChainの上位レイヤー |
| Semantic Kernel (Microsoft) | .NET/.Python対応、エンタープライズ向け |
| khoj (#08フォルダ) | セルフホスト型パーソナルAI、Haystack製 |

---

## 参考リンク

- [公式リポジトリ](https://github.com/deepset-ai/haystack)
- [公式ドキュメント](https://docs.haystack.deepset.ai/)
- [チュートリアル集](https://haystack.deepset.ai/tutorials)
- [コンポーネント一覧](https://docs.haystack.deepset.ai/docs/components)
