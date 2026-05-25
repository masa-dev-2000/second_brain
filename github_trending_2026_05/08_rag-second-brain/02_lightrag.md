# HKUDS/LightRAG

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [HKUDS/LightRAG](https://github.com/HKUDS/LightRAG) |
| 言語 | Python |
| 総スター数 | 35,498 |
| ライセンス | MIT |
| カテゴリ | RAG・セカンドブレイン / グラフRAGエンジン |

---

## 概要

香港大学発のRAGエンジン（EMNLP 2025採択論文の実装）。ドキュメントからエンティティと関係をグラフとして抽出し、ベクトル検索とグラフ構造を組み合わせることで、従来のチャンクベースRAGより複雑な質問に正確に答えられる。

「NvidiaとAMDの競合関係がAI市場にどう影響するか」のような**複数エンティティをまたぐ複雑な質問**に強い。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **グラフ構築** | ドキュメントからエンティティ・関係を自動抽出してナレッジグラフを構築 |
| **ハイブリッド検索** | ベクトル検索 + グラフトラバーサルで高精度な回答 |
| **4つの検索モード** | naive/local/global/hybrid から用途に応じて選択 |
| **インクリメンタル更新** | ドキュメント追加時に差分のみ更新（全再インデックス不要） |
| **多様なストレージ** | Neo4j・NetworkX・AGE等のグラフDBに対応 |
| **マルチLLM対応** | OpenAI・Anthropic・Ollama等で動作 |

---

## あるとないとの違い

| 観点 | 従来のRAG（チャンク検索） | LightRAG |
|------|------------------------|---------|
| 単純な事実の質問 | ○ 得意 | ○ 得意 |
| 複数ドキュメントにまたがる関係 | △ 関連チャンクを見つけにくい | ○ グラフで関係を明示的に保持 |
| 「なぜ？」「どう影響するか？」 | △ 文脈が断片化する | ○ エンティティ間の関係から推論 |
| 大規模ドキュメントセット | △ チャンク数が増えると精度低下 | ○ グラフ構造のため相対的に安定 |

---

## 環境構築方法

### インストール
```bash
pip install lightrag-hku

# または開発版
git clone https://github.com/HKUDS/LightRAG
cd LightRAG
pip install -e .
```

### 基本セットアップ
```python
import os
from lightrag import LightRAG, QueryParam
from lightrag.llm.openai import gpt_4o_mini_complete, openai_embed

os.environ["OPENAI_API_KEY"] = "sk-..."

rag = LightRAG(
    working_dir="./my_rag",
    llm_model_func=gpt_4o_mini_complete,
    embedding_func=openai_embed,
)
```

### Ollamaでローカル動作
```python
from lightrag.llm.ollama import ollama_model_complete, ollama_embed

rag = LightRAG(
    working_dir="./my_rag",
    llm_model_func=ollama_model_complete,
    llm_model_name="qwen2.5:7b",
    embedding_func=ollama_embed,
    embedding_dim=768,
)
```

### 動作確認
```python
# ドキュメントを挿入
with open("document.txt") as f:
    rag.insert(f.read())

# 検索
result = rag.query("主要なテーマは何ですか？", param=QueryParam(mode="hybrid"))
print(result)
```

---

## ベストプラクティス

1. **検索モードを使い分ける:**
```python
from lightrag import QueryParam

# naive: シンプルなベクトル検索（速い）
result = rag.query("XXXとは何ですか？", param=QueryParam(mode="naive"))

# local: 局所的な文脈を重視
result = rag.query("XXXの詳細を教えて", param=QueryParam(mode="local"))

# global: ドキュメント全体のテーマを重視
result = rag.query("全体的な傾向は？", param=QueryParam(mode="global"))

# hybrid: local + global を組み合わせ（推奨）
result = rag.query("XXXとYYYの関係は？", param=QueryParam(mode="hybrid"))
```

2. **大量ドキュメントをバッチ挿入:**
```python
import asyncio
from lightrag import LightRAG

async def insert_batch(rag, texts):
    await rag.ainsert(texts)  # 非同期バッチ挿入

texts = [open(f).read() for f in pdf_files]
asyncio.run(insert_batch(rag, texts))
```

3. **Neo4jでグラフを可視化:**
```python
rag = LightRAG(
    working_dir="./my_rag",
    graph_storage="Neo4JStorage",
    addon_params={
        "neo4j_url": "bolt://localhost:7687",
        "neo4j_auth": ("neo4j", "password"),
    },
)
# → Neo4j Browserでエンティティ関係グラフを視覚的に確認できる
```

4. **コスト削減のためにキャッシュを活用:**
```python
rag = LightRAG(
    working_dir="./my_rag",
    enable_llm_cache=True,  # LLM呼び出し結果をキャッシュ
    enable_llm_cache_for_entity_extract=True,  # エンティティ抽出もキャッシュ
)
# → 同一ドキュメントの再インデックス時にAPI費用が大幅削減
```

---

## セキュリティ観点

### APIキーの管理
```python
# 環境変数から読み込む
import os
from dotenv import load_dotenv
load_dotenv()

os.environ["OPENAI_API_KEY"]  # .envに記述
```

### ローカルモデルで完全プライベート化
```python
# Ollamaを使えばドキュメントが外部に送信されない
# 企業の機密文書やプライベートなナレッジベースに最適
rag = LightRAG(
    llm_model_func=ollama_model_complete,
    llm_model_name="llama3.1:8b",  # or qwen2.5:7b
    embedding_func=ollama_embed,
)
```

---

## ペルソナ設定と使い方

### ペルソナ：橋本 理恵（41歳・コンサルタント・業界レポートを大量にインプットして提案書に活かしたい）

橋本さんはクライアントへの提案書作成前に、業界レポート・競合他社の決算資料・ニュース記事を50〜100本読む。「A社とB社の価格戦略がC社のシェアにどう影響しているか」という複雑な関係を理解するのに時間がかかっていた。

```python
import glob
from lightrag import LightRAG, QueryParam
from lightrag.llm.openai import gpt_4o_mini_complete, openai_embed

rag = LightRAG(
    working_dir="./industry_research",
    llm_model_func=gpt_4o_mini_complete,
    embedding_func=openai_embed,
)

# 業界レポートを一括インデックス化
for report in glob.glob("reports/*.txt"):
    with open(report) as f:
        rag.insert(f.read())

# 複雑な関係性の質問
questions = [
    "A社の値下げ戦略はB社とC社のシェアにどう影響しているか？",
    "半導体不足が自動車・家電・AI業界に与える連鎖的な影響は？",
    "規制強化によってこの業界の競争構造はどう変わるか？",
]

for q in questions:
    result = rag.query(q, param=QueryParam(mode="hybrid"))
    print(f"Q: {q}\nA: {result}\n---")

# 従来: 50本を読んで関係性を頭でまとめる（2日）
# LightRAG: インデックス化1時間 + クエリ数秒 = 数時間で提案書の骨格が完成
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| microsoft/graphrag (#03) | Microsoftのグラフ RAG（より重厚・コストが高い） |
| RAG_Techniques (#04) | RAG手法の解説集（実装はない） |
| khoj (#01) | 個人向けセカンドブレイン（LightRAGはライブラリ） |
| llama_index | RAGフレームワーク（グラフより通常のベクトル検索が主） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/HKUDS/LightRAG)
- [論文（EMNLP 2025）](https://arxiv.org/abs/2410.05779)
