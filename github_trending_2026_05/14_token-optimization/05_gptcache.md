# zilliztech/GPTCache

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [zilliztech/GPTCache](https://github.com/zilliztech/GPTCache) |
| 言語 | Python |
| 総スター数 | 8,037 |
| ライセンス | MIT |
| カテゴリ | トークン最適化 / セマンティックキャッシュ |

---

## 概要

LLMのAPIレスポンスをセマンティックキャッシュするライブラリ。「東京の人口は？」と「Tokyo の人口を教えて」が**意味的に同じ質問と判断されてキャッシュから返る**のが通常のキャッシュとの違い。

LangChain・LlamaIndex・OpenAI SDKに透過的に統合でき、FAQボット・カスタマーサポート・定型レポートなど「同じ質問が繰り返されるアプリ」では呼び出しコストを60〜80%削減できる。

---

## 仕組み

```
ユーザーの質問
↓
1. ベクトル化（Embeddingモデル）
2. キャッシュDBで類似質問を検索
   - 類似度 > 閾値 → キャッシュから返す（LLM API呼び出しゼロ）
   - 類似度 < 閾値 → LLM APIを呼び出し → 結果をキャッシュに保存
↓
回答
```

---

## あるとないとの違い

| 観点 | キャッシュなし | GPTCache |
|------|-------------|---------|
| 同じ質問を100人が聞く | 100回APIを呼び出す | 1回呼び出してあとは0円 |
| 「東京の人口」と「東京の人口は？」 | 2回呼び出す | セマンティックに同一と判断して1回 |
| 表記揺れ | キャッシュヒットしない | 意味が同じなら方向 |
| レスポンス速度 | LLM推論時間（1〜5秒） | キャッシュヒット時は10ms以下 |

---

## 環境構築方法

### インストール
```bash
pip install gptcache
```

### OpenAI SDKへの最小統合
```python
from gptcache import cache
from gptcache.adapter import openai

# キャッシュを初期化（デフォルト: SQLiteとFAISSを使用）
cache.init()
cache.set_openai_key()  # OPENAI_API_KEY を環境変数から読み込む

# 以降は通常の openai SDK と同じ書き方（透過的に動作）
response = openai.ChatCompletion.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "東京の人口は？"}],
)
# → 2回目以降は同じ（または類似の）質問にはキャッシュから返す
```

### Anthropic SDKとの統合
```python
from gptcache import cache
from gptcache.manager import CacheBase, VectorBase, get_data_manager
from gptcache.similarity_evaluation import SearchDistanceEvaluation
from gptcache.embedding import Onnx

# キャッシュ設定（より細かく制御）
onnx = Onnx()  # 軽量なEmbeddingモデル（ローカル動作）

cache.init(
    embedding_func=onnx.to_embeddings,
    data_manager=get_data_manager(
        CacheBase("sqlite"),           # キャッシュ保存先
        VectorBase("faiss", dimension=onnx.dimension),  # ベクトルDB
    ),
    similarity_evaluation=SearchDistanceEvaluation(),
    similarity_threshold=0.75,  # 75%以上の類似度でキャッシュヒット
)
```

### Redisをキャッシュ先にする（本番向け）
```python
from gptcache.manager import CacheBase, VectorBase, get_data_manager

data_manager = get_data_manager(
    CacheBase("redis", url="redis://localhost:6379"),
    VectorBase("faiss", dimension=512),
)

cache.init(data_manager=data_manager)
```

---

## ベストプラクティス

1. **類似度閾値を調整してキャッシュヒット率と精度をバランス:**
```python
# threshold が低い → より多くキャッシュヒット（でも精度が落ちるリスク）
# threshold が高い → 精度は高いがキャッシュヒット率が下がる

# FAQボット（答えが決まっている）→ 閾値を低く（0.6〜0.7）
cache.init(similarity_threshold=0.65)

# 創作・分析系（毎回異なる答えが必要）→ 閾値を高く（0.9〜）
cache.init(similarity_threshold=0.92)
```

2. **LangChainと統合:**
```python
from langchain.globals import set_llm_cache
from langchain_community.cache import GPTCache
from gptcache import cache
from gptcache.embedding import Onnx

def init_gptcache(cache_obj, llm_string):
    onnx = Onnx()
    cache_obj.init(
        embedding_func=onnx.to_embeddings,
        data_manager=get_data_manager(
            CacheBase("sqlite"),
            VectorBase("faiss", dimension=onnx.dimension),
        ),
    )

set_llm_cache(GPTCache(init_gptcache))

# 以降は通常のLangChainの使い方でOK
# 自動的にGPTCacheが挟まる
```

3. **ユーザー別にキャッシュを分離:**
```python
# プライベートな情報を扱う場合はユーザー別キャッシュが必要
def get_user_cache(user_id: str):
    cache_obj = Cache()
    cache_obj.init(
        data_manager=get_data_manager(
            CacheBase("sqlite", sql_url=f"sqlite:///cache_{user_id}.db"),
            VectorBase("faiss", dimension=512),
        ),
    )
    return cache_obj
```

4. **キャッシュのTTLを設定して古い回答を削除:**
```python
from gptcache.manager import CacheBase

# SQLiteキャッシュにTTLを設定
data_manager = get_data_manager(
    CacheBase("sqlite"),
    VectorBase("faiss", dimension=512),
    max_size=1000,   # 最大1000件
    clean_size=200,  # 上限超えたら古い200件を削除
)

# または TTL を秒数で指定
cache.set_data_with_ttl(data=result, cache_key=key, ttl=3600)
# → 1時間後に自動削除（株価・天気などリアルタイム性が必要な情報に）
```

---

## セキュリティ観点

### キャッシュへの情報漏洩
```python
# 複数ユーザーが同じキャッシュを共有する場合
# ユーザーAの「私の口座残高は？」がキャッシュされて
# ユーザーBに返る可能性がある

# → パーソナル情報・認証情報を含む質問はキャッシュから除外
from gptcache.processor.pre import get_prompt

def skip_personal_info(data, **kwargs):
    prompt = get_prompt(data)
    if any(keyword in prompt for keyword in ["私の", "あなたの", "口座", "パスワード"]):
        return None  # キャッシュをスキップ
    return data

cache.init(pre_process_messages_func=skip_personal_info)
```

---

## ペルソナ設定と使い方

### ペルソナ：吉川 真理（31歳・エンジニア・社内ヘルプデスクAIボットを運用中）

吉川さんが構築した社内ヘルプデスクボット（Slack Bot）は、勤怠申請・経費精算・福利厚生に関する質問に答える。「有休はどう申請するの？」「経費精算の締め切りは？」といった同じ質問が毎日数十回飛んでくる。月のAPI費用が$800を超えており、同じ質問への重複コストを削減したい。

```python
from gptcache import cache
from gptcache.embedding import Onnx
from gptcache.manager import get_data_manager, CacheBase, VectorBase
import anthropic

# ヘルプデスク用キャッシュ設定
onnx = Onnx()
cache.init(
    embedding_func=onnx.to_embeddings,
    data_manager=get_data_manager(
        CacheBase("redis", url="redis://localhost:6379"),  # 永続化
        VectorBase("faiss", dimension=onnx.dimension),
    ),
    similarity_threshold=0.72,  # FAQ用なので低めに設定
)

client = anthropic.Anthropic()

def answer_helpdesk(question: str) -> dict:
    # GPTCacheが透過的にキャッシュを確認
    # （キャッシュヒットすればここでAPIは呼ばれない）
    
    # キャッシュ状況を記録するためのラッパー
    cache_hit = False
    
    try:
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=512,
            messages=[{
                "role": "user",
                "content": f"社内ヘルプデスクとして以下の質問に答えてください: {question}"
            }],
        )
        answer = response.content[0].text
    except Exception:
        cache_hit = True
        answer = cache.get(question)  # キャッシュから取得
    
    return {"answer": answer, "cache_hit": cache_hit}

# 1ヶ月後の効果:
# 総質問数: 2,400件/月
# キャッシュヒット率: 71%（よくある質問が繰り返された）
# API呼び出し: 2,400件 → 696件（-71%）
# API費用: $800/月 → $232/月（-71%）
# レスポンス速度: 平均2.3秒 → キャッシュヒット時50ms
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| LiteLLM (#02) | ゲートウェイ側でのキャッシング（Redisと統合） |
| Anthropic Prompt Caching | API側のプレフィックスキャッシュ（セマンティックキャッシュとは異なる） |
| Redis | 通常のキャッシュ（セマンティック類似度は判断しない） |
| Langfuse (#01) | キャッシュではなく可視化（問題発見に使う） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/zilliztech/GPTCache)
- [公式ドキュメント](https://gptcache.readthedocs.io/)
