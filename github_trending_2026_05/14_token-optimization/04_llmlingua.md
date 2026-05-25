# microsoft/LLMLingua

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [microsoft/LLMLingua](https://github.com/microsoft/LLMLingua) |
| 言語 | Python |
| 総スター数 | ~4,200 |
| ライセンス | MIT |
| カテゴリ | トークン最適化 / プロンプト圧縮 |

---

## 概要

Microsoftが発表したプロンプト圧縮ライブラリ。小さなLM（Llama-2-7B等）を使って長いプロンプトから「LLMが回答に必要な情報」を残しながら不要なトークンを削除する。**典型的な圧縮率は2〜5倍（rate=0.4〜0.5）**で、精度を許容できる設定では最大20倍まで圧縮できる。

RAGのコンテキスト・長い会話履歴・大量のドキュメントをLLMに渡す前に圧縮することで、API費用とレイテンシを大幅に削減できる。精度を保ちながら圧縮率を調整できる。

---

## 圧縮の仕組み

```
元のプロンプト（1000トークン）
↓ 小さなLM（Llama-7B等）が各トークンの「重要度スコア」を計算
↓ スコアが低いトークンを削除
圧縮後のプロンプト（200〜400トークン）
↓ 大きなLLM（Claude/GPT等）に渡す
回答（精度はほぼ変わらない）
```

圧縮前後で意味は保たれるが、文章は不自然になる（LLMにとっては問題ない）。

---

## あるとないとの違い

| 観点 | ない場合 | LLMLingua |
|------|----------|----------|
| RAGコンテキスト | 長い文書チャンクをそのまま渡す（高コスト） | 圧縮して3〜20倍安くなる |
| 長い会話履歴 | 全履歴を渡すかカットするか二択 | 重要な部分を保ちながら圧縮 |
| コンテキストウィンドウ制限 | 制限に引っかかって切り捨て | 圧縮して制限内に収める |
| レイテンシ | トークン数に比例して遅くなる | 圧縮分だけ推論が速くなる |

---

## 環境構築方法

### インストール
```bash
pip install llmlingua

# 圧縮用の小さなモデルをダウンロード
# 初回実行時に自動ダウンロード（数GB）
# 推奨: microsoft/llmlingua-2-bert-base-multilingual（軽量・日本語対応）
```

### 基本的な使い方
```python
from llmlingua import PromptCompressor

# 軽量モデル（多言語対応・日本語可）
compressor = PromptCompressor(
    model_name="microsoft/llmlingua-2-bert-base-multilingual-cased-meetingbank",
    use_llmlingua2=True,
    device_map="cpu"  # GPUがない場合はcpu
)

long_prompt = """
[非常に長い文章...]
株式会社ABCの2025年度決算報告書によると、売上高は前年比15%増の
1,200億円を達成した。主な成長要因は...（中略）...
一方でコスト増加も見られ、特に原材料費が...（中略）...
"""

compressed = compressor.compress_prompt(
    long_prompt,
    rate=0.3,          # 元の30%に圧縮（70%削減）
    force_tokens=["売上", "利益", "リスク"]  # 必ず残すキーワード
)

print(f"元: {compressed['origin_tokens']}トークン")
print(f"圧縮後: {compressed['compressed_tokens']}トークン")
print(f"削減率: {compressed['ratio']}")
# 元: 1200トークン → 圧縮後: 360トークン（70%削減）
```

### RAGパイプラインへの組み込み
```python
from llmlingua import PromptCompressor
import anthropic

compressor = PromptCompressor(
    "microsoft/llmlingua-2-bert-base-multilingual-cased-meetingbank",
    use_llmlingua2=True,
)
client = anthropic.Anthropic()

def rag_with_compression(question: str, retrieved_docs: list[str]) -> str:
    context = "\n\n".join(retrieved_docs)
    
    # RAGコンテキストを圧縮（質問は圧縮しない）
    compressed = compressor.compress_prompt(
        context,
        question=question,   # 質問を考慮して関連部分を残す
        rate=0.4,            # 40%に圧縮
        force_tokens=["重要", "注意", "ただし"],
    )
    
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"以下の文書を参考に質問に答えてください。\n\n{compressed['compressed_prompt']}\n\n質問: {question}"
        }]
    )
    return response.content[0].text
```

---

## ベストプラクティス

1. **圧縮率は0.3〜0.5の間で試す:**
```python
# 精度と圧縮率のトレードオフ
# rate=0.5: 元の50%に圧縮（精度影響が小さい、推奨スタートポイント）
# rate=0.3: 元の30%に圧縮（大幅削減だが精度への影響を要確認）
# rate=0.2: 20%（英語の事実QAでも精度劣化が出始める）

# まず rate=0.5 で試して精度を測定してから絞り込む
```

2. **force_tokens で重要キーワードを保護:**
```python
# 必ず残したいキーワードを指定
# 数値・固有名詞・専門用語は特に重要
compressed = compressor.compress_prompt(
    context,
    force_tokens=[
        "2025",          # 年号
        "1,200億円",      # 金額
        "ABC社",          # 固有名詞
        "ただし",         # 条件を表す接続詞
        "注意事項",        # 重要見出し
    ]
)
```

3. **バッチ処理でスループットを上げる:**
```python
# 複数のコンテキストをまとめて圧縮
contexts = [doc1, doc2, doc3, ...]  # リストで渡す

compressed_list = compressor.compress_prompt_list(
    contexts,
    rate=0.4,
    question=user_question,
)
```

4. **コスト削減効果を測定してから本番投入:**
```python
# A/Bテスト用のラッパー
import random

def rag_call(context, question):
    if random.random() < 0.5:
        # 通常（圧縮なし）
        prompt = context
        group = "control"
    else:
        # 圧縮あり
        compressed = compressor.compress_prompt(context, rate=0.4)
        prompt = compressed["compressed_prompt"]
        group = "compressed"
    
    response = llm_call(prompt, question)
    
    # 結果をログに記録（コスト・精度・レイテンシ）
    log_experiment(group=group, tokens=count_tokens(prompt), answer=response)
    
    return response

# 1週間で十分なサンプルが集まったら精度とコストを比較
```

---

## セキュリティ観点

### ローカルで動作するため機密情報に安全
```python
# 圧縮処理はすべてローカルで実行
# 機密文書が外部サービスに送信されない
# → 社外秘の契約書・社内ドキュメントの圧縮に適している

# ただし圧縮後のプロンプトはLLM APIに送信される
# 完全プライベートにするにはOllamaと組み合わせる
```

---

## ペルソナ設定と使い方

### ペルソナ：藤田 洋介（33歳・AIエンジニア・法律事務所向けRAGシステムを構築中）

藤田さんは法律事務所向けに過去の判例・契約書を検索するRAGシステムを構築した。精度向上のため検索ヒット数を増やしたところ、コンテキストが長大になり1リクエストのAPI費用が跳ね上がった。精度を犠牲にせずにコストを削減したい。

```python
# 判例検索RAGにLLMLinguaを組み込む

from llmlingua import PromptCompressor
import anthropic

compressor = PromptCompressor(
    "microsoft/llmlingua-2-bert-base-multilingual-cased-meetingbank",
    use_llmlingua2=True,
)
client = anthropic.Anthropic()

def legal_rag(question: str, case_documents: list[str]) -> str:
    # 判例文書はしばしば1件あたり3,000〜5,000トークン
    # 10件検索 = 30,000〜50,000トークン → 高コスト

    compressed_docs = []
    for doc in case_documents:
        result = compressor.compress_prompt(
            doc,
            question=question,
            rate=0.45,
            force_tokens=[
                "判示", "主文", "理由", "最高裁", "高裁",
                "損害賠償", "契約", "無効", "有効",
            ],
        )
        compressed_docs.append(result["compressed_prompt"])

    combined_context = "\n---\n".join(compressed_docs)

    response = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=2000,
        messages=[{
            "role": "user",
            "content": f"以下の判例を参考に法的見解を示してください。\n\n{combined_context}\n\n質問: {question}"
        }]
    )
    return response.content[0].text

# 導入前後の比較（10件の判例を使うケース）:
# 導入前: 平均45,000トークン × $15/MTok = $0.675/リクエスト
# 導入後: 平均20,000トークン × $15/MTok = $0.300/リクエスト（-55%）
# 精度評価: 正答率 87% → 85%（-2%、許容範囲内）
# 月100リクエスト × 削減効果 $0.375 = 月約$37.5削減
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| rtk（03_ai-platforms収録） | シェル出力をLLMに渡す前に圧縮（60〜90%削減） |
| Selective Context | Entropy-basedのプロンプト圧縮（LLMLinguaより軽量） |
| GPTCache (#05) | 同一質問のキャッシュ（圧縮ではなくキャッシュ）|
| Anthropic Prompt Caching | API側の機能（クライアント側圧縮とは異なる） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/microsoft/LLMLingua)
- [論文（LLMLingua-2）](https://arxiv.org/abs/2403.12968)
