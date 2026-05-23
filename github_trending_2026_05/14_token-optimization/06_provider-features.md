# プロバイダー側のトークン最適化機能

## 概要

OSSツールではなく、AnthropicやOpenAI等のAPIプロバイダーが提供する公式のトークン削減機能。コード変更が少なく効果が大きいため**最初に試すべき施策**。

---

## 1. Anthropicのプロンプトキャッシング

### 概要

同一プレフィックス（システムプロンプト・長文ドキュメント等）を繰り返し送る場合、**2回目以降の入力トークンが90%割引**になる機能。数行の変更で有効化できる。

### 料金

| | 通常 | キャッシュ書き込み | キャッシュ読み取り |
|--|------|--------------|--------------|
| claude-opus-4-7 | $15/MTok | $18.75/MTok | **$1.5/MTok（-90%）** |
| claude-haiku-4-5 | $0.80/MTok | $1.00/MTok | **$0.08/MTok（-90%）** |

### 使い方

```python
import anthropic

client = anthropic.Anthropic()

# 毎回送る長いシステムプロンプト・ドキュメントに cache_control を付与
response = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": "あなたは法律の専門家です。以下の法律文書に基づいて回答してください。",
        },
        {
            "type": "text",
            "text": very_long_legal_document,  # 10,000トークンの法律文書
            "cache_control": {"type": "ephemeral"},  # ← これだけ追加
        }
    ],
    messages=[{"role": "user", "content": user_question}],
)

# 2回目以降:
# very_long_legal_document（10,000トークン）のコストが90%削減
# 10,000トークン × $15/MTok = $0.15 → $0.015（毎リクエスト$0.135節約）
```

### 有効なユースケース

```python
# 1. RAGのドキュメントコンテキストを毎回再送する場合
retrieved_docs = search_documents(query)  # 検索結果を毎回送る
# → retrieved_docs に cache_control を付与

# 2. 長いシステムプロンプト（ルール・ガイドライン）
# → system プロンプトの末尾に cache_control を付与

# 3. Few-shot例（同じ例を毎回送る場合）
# → examples に cache_control を付与
```

---

## 2. AnthropicのBatch API

### 概要

リアルタイム応答が不要なリクエストを非同期でバッチ処理し、**通常の50%のコスト**で実行。24時間以内に結果が返る。

### 使い方

```python
import anthropic

client = anthropic.Anthropic()

# 大量のリクエストをバッチで送信
requests = [
    {"custom_id": f"task-{i}", "params": {
        "model": "claude-haiku-4-5-20251001",
        "max_tokens": 1024,
        "messages": [{"role": "user", "content": text}]
    }}
    for i, text in enumerate(documents_to_summarize)
]

# バッチ作成（即時レスポンスではなく非同期処理）
batch = client.messages.batches.create(requests=requests)
print(f"Batch ID: {batch.id}")  # このIDで結果を確認

# 数時間〜24時間後に結果を取得
results = client.messages.batches.results(batch.id)
for result in results:
    print(result.custom_id, result.result.message.content[0].text)
```

### 向いているユースケース

```
○ 夜間バッチで大量ドキュメントを要約
○ 分析レポートの定期生成（毎日1回）
○ データセットのラベリング
○ 一括翻訳

× リアルタイムチャット
× ユーザーが待つインタラクション
```

---

## 3. OpenAIのCached Prompt Tokens

### 概要

Anthropicのプロンプトキャッシングに相当するOpenAIの機能。**自動的に適用**され、コード変更不要。プレフィックスが1,024トークン以上の場合に有効化。

```python
from openai import OpenAI

client = OpenAI()

# cache_control などの設定は不要（自動でキャッシュされる）
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": long_system_prompt},  # 自動キャッシュ
        {"role": "user", "content": user_message}
    ]
)

# usage を確認するとキャッシュヒット状況が分かる
print(response.usage.prompt_tokens_details)
# PromptTokensDetails(cached_tokens=2048, audio_tokens=0)
# → 2048トークンがキャッシュから取得された（50%割引）
```

---

## 4. コンテキスト圧縮（Claude Code固有）

### 概要

長い会話履歴が蓄積された際に、Claude Codeが自動的に会話を要約・圧縮してコンテキストウィンドウを節約する機能。このセッション自体でも動作している。

```bash
# Claude Codeの設定
# ~/.claude/settings.json
{
  "autoCompact": true  # デフォルトでオン
}

# 手動でコンパクションを実行
/compact

# コンパクション後、要約されたコンテキストで継続
```

---

## 総合的なコスト最適化戦略

```
Step 1（即効）: プロンプトキャッシングを有効化
  → コード変更5行以内、効果最大

Step 2（可視化）: Langfuse を導入
  → 「どこでコストが発生しているか」を把握

Step 3（制御）: LiteLLM ゲートウェイを導入
  → チーム別予算・レート制限

Step 4（削減）: 高コストの呼び出しを特定してモデル最適化
  → claude-opus-4-7 → claude-haiku-4-5 に変更できる箇所を特定

Step 5（キャッシュ）: 繰り返し質問の多いアプリにGPTCacheを導入
  → FAQ・サポートボットで60〜80%削減

Step 6（圧縮）: RAGコンテキストが長い場合にLLMLinguaを試す
  → 精度を確認しながら30〜50%削減
```

---

## コスト削減効果の目安

| 施策 | 典型的な削減率 | 導入コスト |
|------|-------------|----------|
| Anthropic プロンプトキャッシング | 30〜70% | 低（数行変更） |
| Batch API | 50% | 低〜中（非同期処理に変更） |
| モデルのダウングレード（Opus→Haiku） | 95% | 中（精度評価が必要） |
| セマンティックキャッシュ（GPTCache） | 40〜80% | 中 |
| プロンプト圧縮（LLMLingua） | 30〜70% | 中〜高（精度評価が必要） |

---

## 参考リンク

- [Anthropic プロンプトキャッシング公式ドキュメント](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
- [Anthropic Batch API ドキュメント](https://docs.anthropic.com/en/docs/build-with-claude/batch-processing)
- [OpenAI キャッシュドプロンプト](https://platform.openai.com/docs/guides/prompt-caching)
