# langfuse/langfuse

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [langfuse/langfuse](https://github.com/langfuse/langfuse) |
| 言語 | TypeScript |
| 総スター数 | 27,710 |
| ライセンス | MIT |
| カテゴリ | トークン最適化 / LLM可観測性プラットフォーム |

---

## 概要

OSSのLLMエンジニアリングプラットフォーム。LLMアプリのトークン使用量・コスト・レイテンシをリクエスト単位で可視化し、プロンプト管理・評価・デバッグを一元化する。自己ホスト可能でYC W23出身。

「何に何トークン使っているか分からない」「コストが予算を超えた原因が不明」という問題を、ダッシュボードとトレーシングで解決する。OpenAI SDK・LangChain・LiteLLM等と数行で統合できる。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **トレーシング** | リクエストごとのトークン数・コスト・レイテンシを記録 |
| **コスト分析** | ユーザー別・機能別・モデル別にコストを集計・可視化 |
| **プロンプト管理** | プロンプトをバージョン管理してA/Bテストが可能 |
| **評価（Evals）** | LLM出力の品質をスコアリング・追跡 |
| **デバッグ** | 失敗したリクエストの原因を追跡 |
| **アラート** | コスト・エラー率が閾値を超えたら通知 |

---

## あるとないとの違い

| 観点 | ない場合 | Langfuse |
|------|----------|---------|
| コスト把握 | 月末の請求書でやっと気づく | リアルタイムでリクエスト単位のコストを確認 |
| 高コストの原因 | どのプロンプトが原因か不明 | トレースを辿って即座に特定 |
| プロンプト改善 | 変更前後の比較が難しい | バージョン管理でA/B比較が可能 |
| 品質劣化の検知 | ユーザーからの苦情で気づく | Evalsで自動スコアリングして早期検知 |

---

## 環境構築方法

### Docker自己ホスト（推奨）
```bash
# docker-compose.yml を取得
curl -fsSL https://raw.githubusercontent.com/langfuse/langfuse/main/docker-compose.yml > docker-compose.yml

# 起動
docker compose up -d

# → http://localhost:3000 でダッシュボードにアクセス
# 初回アクセス時にアカウントを作成
```

### Langfuse Cloud（マネージド・無料枠あり）
```
https://cloud.langfuse.com でアカウント作成
→ APIキーを取得（LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY）
```

### Pythonアプリへの統合
```bash
pip install langfuse
```

```python
# 環境変数
export LANGFUSE_PUBLIC_KEY=pk-lf-...
export LANGFUSE_SECRET_KEY=sk-lf-...
export LANGFUSE_HOST=http://localhost:3000  # 自己ホストの場合
```

### 動作確認
```python
from langfuse import Langfuse

client = Langfuse()

# 手動でトレースを作成
trace = client.trace(name="test")
trace.generation(
    name="first-gen",
    model="claude-opus-4-7",
    input="テストの質問",
    output="テストの回答",
    usage={"input": 10, "output": 50},
)
client.flush()
# → ダッシュボードにトレースが表示されれば成功
```

---

## ベストプラクティス

1. **Anthropic SDKへのドロップイン統合（最小コスト）:**
```python
from langfuse.anthropic import anthropic

# 通常の anthropic.Anthropic() をこれに差し替えるだけ
client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=1024,
    messages=[{"role": "user", "content": "東京の人口は？"}],
)
# → 自動でトークン数・コスト・レイテンシがLangfuseに記録される
# コードの変更は import 1行と client の差し替えだけ
```

2. **ユーザー別・機能別にコストを分類:**
```python
from langfuse.decorators import observe, langfuse_context

@observe()  # この関数のすべてのLLM呼び出しをトレース
def answer_question(user_id: str, question: str) -> str:
    # ユーザーIDと機能名を付与してコストを分類
    langfuse_context.update_current_trace(
        user_id=user_id,
        tags=["faq-bot", "v2"],
        metadata={"feature": "customer_support"}
    )
    
    response = client.messages.create(...)
    return response.content[0].text

# ダッシュボードで「ユーザーAが今月いくら使ったか」が即座に分かる
```

3. **プロンプトをバージョン管理してA/Bテスト:**
```python
from langfuse import Langfuse

lf = Langfuse()

# Langfuseダッシュボードで管理しているプロンプトを取得
prompt = lf.get_prompt("summarize-contract", version=3)

compiled = prompt.compile(document=contract_text)
# → プロンプトの変更はコードを再デプロイせずダッシュボードから行える
# → バージョンごとのコスト・品質を比較できる
```

4. **コスト上限アラートを設定:**
```
ダッシュボード > Settings > Alerts > 追加
- 条件: 1日のコストが $50 を超えたら
- 通知: Slack #ai-cost チャンネル
→ 予算超過を翌日ではなく当日に検知できる
```

---

## セキュリティ観点

### プロンプトの機密性
```python
# マスキング設定：PII（個人情報）をトレースに記録しない
from langfuse import Langfuse

lf = Langfuse(
    mask=lambda data: "[MASKED]" if contains_pii(data) else data
)
```

### 自己ホスト時の認証
```yaml
# docker-compose.yml
services:
  langfuse-server:
    environment:
      - NEXTAUTH_SECRET=your-strong-secret-key
      - AUTH_DISABLE_SIGNUP=true  # 管理者以外の新規登録を禁止
      - AUTH_GOOGLE_CLIENT_ID=...  # SSO連携（オプション）
```

---

## ペルソナ設定と使い方

### ペルソナ：高橋 慎（39歳・AI SaaS CTO・月のAPI費用が$5,000を超え原因が不明）

高橋さんのSaaSはリリース後にユーザーが増え、OpenAI/AnthropicのAPI費用が急増した。「どの機能で消費しているか」「特定ユーザーが大量にAPIを使っていないか」が分からず、費用対効果も測れない状態だった。

```python
# 既存のコードに最小変更でLangfuseを統合（1日で完了）

# Before: 通常のAnthropicクライアント
# client = anthropic.Anthropic()

# After: Langfuseラッパーに差し替え（この1行だけ変更）
from langfuse.anthropic import anthropic
client = anthropic.Anthropic()

# 全LLM呼び出しに機能タグを付与
@observe()
def generate_summary(user_id: str, document: str):
    langfuse_context.update_current_trace(
        user_id=user_id,
        tags=["summary-feature"]
    )
    return client.messages.create(...)

@observe()
def answer_support_question(user_id: str, question: str):
    langfuse_context.update_current_trace(
        user_id=user_id,
        tags=["support-bot"]
    )
    return client.messages.create(...)

# 1週間後にダッシュボードで判明したこと:
# - support-bot が全コストの67%を占めていた
# - 上位3ユーザーが全体の40%を消費（レート制限の対象に）
# - claude-opus-4-7 をhaiku に変更できる呼び出しが30%あった
# → 最適化後、月額コスト $5,000 → $1,800（-64%）
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| openlit (#03) | OpenTelemetryネイティブ・GPU監視も統合 |
| LiteLLM (#02) | ゲートウェイとしてコスト制御（Langfuseはあくまで可視化） |
| Helicone | クラウドのみのLLM可観測性（自己ホスト不可・有料） |
| Arize Phoenix | MLモデルの可観測性（LLM特化ではない） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/langfuse/langfuse)
- [公式ドキュメント](https://langfuse.com/docs)
- [Langfuse Cloud](https://cloud.langfuse.com)
