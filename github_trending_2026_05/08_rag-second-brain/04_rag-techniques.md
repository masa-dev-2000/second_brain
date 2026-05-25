# NirDiamant/RAG_Techniques

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [NirDiamant/RAG_Techniques](https://github.com/NirDiamant/RAG_Techniques) |
| 言語 | Jupyter Notebook / Python |
| 総スター数 | 27,484 |
| ライセンス | MIT |
| カテゴリ | RAG・セカンドブレイン / RAG手法チュートリアル集 |

---

## 概要

30種類以上のRAG（Retrieval-Augmented Generation）手法を、実行可能なJupyterノートブックで解説した「RAGの教科書」リポジトリ。基礎的なシンプルRAGから、クエリ変換・ルーティング・リランキング・グラフRAG・適応型RAGまで体系的にカバー。

「どのRAG手法を使えばいいか」を理解するためのリファレンスとして、AIエンジニアが実際のシステム設計前に参照するリソース。

---

## カバーする手法

| カテゴリ | 手法 |
|---------|------|
| **基礎** | Simple RAG, Reliable RAG, Contextual Compression |
| **クエリ変換** | Query Transformations, Decomposition, Step-back |
| **検索改善** | Hybrid Search, Reranking, Contextual Chunk Headers |
| **ルーティング** | Semantic Router, Adaptive Retrieval |
| **グラフ** | Graph RAG, Knowledge Graph Integration |
| **評価** | RAGAS, Answer Correctness Metrics |
| **応用** | Multi-modal RAG, Agentic RAG, Self-RAG |

---

## あるとないとの違い

| 観点 | ない場合 | ある場合 |
|------|----------|----------|
| RAGシステムの改善 | ブログを探し回って断片的な情報を集める | 30種類の手法を比較して最適を選べる |
| 精度が上がらない原因 | 試行錯誤のみ | Reranking/HyDE/Query Decompositionなど原因別の解決策がある |
| 新しい手法のキャッチアップ | 論文を読む（難解） | 動くコードで直感的に理解できる |

---

## 環境構築方法

### リポジトリのクローン
```bash
git clone https://github.com/NirDiamant/RAG_Techniques
cd RAG_Techniques

pip install -r requirements.txt

# APIキーの設定
export OPENAI_API_KEY=sk-...
# または .env に記述
```

### Jupyterで実行
```bash
jupyter lab
# → all_rag_techniques/ フォルダの .ipynb を開いて実行
```

---

## ベストプラクティス

1. **まず Simple RAG を動かしてベースラインを作る:**
```python
# all_rag_techniques/simple_rag.ipynb の流れ
# 1. ドキュメントをチャンク分割
# 2. ベクトルDBに格納
# 3. 質問でベクトル検索
# 4. LLMで回答生成
# → ここから精度を測定して改善手法を選ぶ
```

2. **精度が低い原因に応じて手法を選ぶ:**
```
検索精度が低い → Hybrid Search, Reranking, Contextual Chunk Headers
質問が曖昧 → Query Decomposition, Step-back Prompting, HyDE
コンテキストが長すぎる → Contextual Compression
複数ドキュメントの関係が重要 → Graph RAG
回答の根拠が不明 → Self-RAG（自己検証付き）
```

3. **RAGASで評価してから手法を変える:**
```python
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_recall

# ベースライン評価
baseline_results = evaluate(
    dataset=test_dataset,
    metrics=[faithfulness, answer_relevancy, context_recall]
)

# 手法変更後に再評価して比較
# → 感覚ではなく数値で改善を確認
```

4. **Adaptive RAGで質問の複雑さに応じて自動切替:**
```python
# 簡単な質問 → シンプルRAG（速い）
# 複雑な質問 → Graph RAG or Decomposition（精度重視）
# ルーターが自動で判断するパターンをノートブックで解説
```

---

## セキュリティ観点

```python
# APIキーはノートブックに直書きしない
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ["OPENAI_API_KEY"]

# Jupyterのノートブックをコミットするとき
# → 出力セルをクリアしてからコミット（APIレスポンスに機密情報が含まれうる）
jupyter nbconvert --ClearOutputPreprocessor.enabled=True --to notebook notebook.ipynb
```

---

## ペルソナ設定と使い方

### ペルソナ：森 大地（26歳・AIエンジニア1年目・RAGシステムの精度改善を任された）

森さんは社内向けの問い合わせ対応RAGシステムを構築したが、「回答が的外れ」「関連するドキュメントが見つからない」という苦情が続いている。上司から「精度を上げろ」と言われたが、どこから手をつければいいか分からない。

```python
# Step 1: まず評価指標でどこが悪いか特定
# RAG_Techniques/evaluation/ragas_evaluation.ipynb を参考に

from ragas.metrics import faithfulness, context_recall, answer_relevancy

scores = evaluate(test_cases, metrics=[faithfulness, context_recall, answer_relevancy])

# 結果例:
# faithfulness: 0.85 (生成は信頼できる)
# context_recall: 0.42 (← 検索精度が低い！)
# answer_relevancy: 0.78

# → context_recall が低い = 関連ドキュメントを見つけられていない問題

# Step 2: 検索精度改善の手法を試す
# RAG_Techniques/retrieval/hybrid_search.ipynb

# Hybrid Search（ベクトル検索 + BM25の組み合わせ）を実装
# → context_recall: 0.42 → 0.71 に改善

# Step 3: さらにRerankingを追加
# RAG_Techniques/retrieval/reranking.ipynb

# → context_recall: 0.71 → 0.84 に改善
# → 3週間で苦情がほぼゼロに
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| LightRAG (#02) | RAGの実装（手法解説ではなく動くシステム） |
| ai-engineering-from-scratch | Module 3でRAGを体系的に学べるカリキュラム |
| langchain/langgraph | RAGパイプラインを構築するフレームワーク |
| RAGAS | RAG評価フレームワーク |

---

## 参考リンク

- [公式リポジトリ](https://github.com/NirDiamant/RAG_Techniques)
