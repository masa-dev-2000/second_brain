# BerriAI/litellm

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [BerriAI/litellm](https://github.com/BerriAI/litellm) |
| 言語 | Python |
| 総スター数 | 47,939 |
| ライセンス | MIT |
| カテゴリ | トークン最適化 / LLMゲートウェイ・コスト管理 |

---

## 概要

100以上のLLMをOpenAI互換APIで統一呼び出しできるPython SDKおよびプロキシサーバー。Claude・GPT・Gemini・Llama・Mistral等を同一のコードで切り替えられる。

**コスト追跡・チーム別予算・レート制限・キャッシング・ロードバランシング**をプロキシサーバーとして一括提供。「LLMの使用コストを組織として管理する」ための事実上の標準OSS。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **統一API** | 100+ LLMをOpenAI形式で呼び出し可能 |
| **コスト追跡** | リクエスト単位でコスト・トークン数を記録 |
| **予算管理** | ユーザー・チーム別に月次予算上限を設定 |
| **レート制限** | API呼び出し頻度の上限を設定 |
| **キャッシング** | Redisで応答をキャッシュして同一リクエストのコストをゼロに |
| **ロードバランシング** | 複数のAPIキーやプロバイダーに負荷分散 |
| **フォールバック** | あるモデルが失敗したら別モデルに自動切替 |

---

## あるとないとの違い

| 観点 | ない場合 | LiteLLM |
|------|----------|---------|
| マルチモデル切替 | プロバイダーごとに異なるSDKを使う | `model="claude-opus-4-7"` → `model="gpt-4o"` に変えるだけ |
| コスト管理 | 個人のAPIキーを共有→誰がいくら使ったか不明 | チーム別・ユーザー別の予算設定と追跡 |
| APIキー漏洩リスク | プロバイダーのキーを直接各環境に配布 | プロキシのキーのみ配布（プロバイダーキーはプロキシのみが知る） |
| プロバイダー障害 | アプリが止まる | 自動フォールバックで別モデルに切替 |

---

## 環境構築方法

### Python SDKとして使う（最小構成）
```bash
pip install litellm
```

```python
from litellm import completion

# どのモデルも同じ書き方で呼び出せる
response = completion(
    model="claude-opus-4-7",
    messages=[{"role": "user", "content": "こんにちは"}]
)

# モデルを変えるだけで切替
response = completion(
    model="gpt-4o",
    messages=[{"role": "user", "content": "こんにちは"}]
)

# ローカルのOllamaも同じ書き方で
response = completion(
    model="ollama/llama3.1",
    messages=[{"role": "user", "content": "こんにちは"}]
)
```

### プロキシサーバーとして使う（チーム運用推奨）
```bash
pip install 'litellm[proxy]'

# config.yaml を作成
cat > litellm_config.yaml << 'EOF'
model_list:
  - model_name: claude-fast
    litellm_params:
      model: claude-haiku-4-5-20251001
      api_key: sk-ant-...
  - model_name: claude-powerful
    litellm_params:
      model: claude-opus-4-7
      api_key: sk-ant-...
  - model_name: gpt-fallback
    litellm_params:
      model: gpt-4o
      api_key: sk-...

general_settings:
  master_key: sk-my-proxy-key  # チームに配布するキー
EOF

# プロキシ起動
litellm --config litellm_config.yaml --port 4000
```

### チームに配布する設定
```python
# チームメンバーはこの設定だけでOK（プロバイダーキー不要）
from openai import OpenAI

client = OpenAI(
    api_key="sk-my-proxy-key",        # プロキシのキー
    base_url="http://litellm.internal:4000"  # 社内プロキシ
)

# 以降は通常のOpenAI SDKと同じ
response = client.chat.completions.create(
    model="claude-fast",
    messages=[{"role": "user", "content": "質問"}]
)
```

---

## ベストプラクティス

1. **チーム別予算制限を設定:**
```python
# LiteLLM Admin APIで予算を設定
import requests

# 開発チームに月$100の予算を割り当て
requests.post("http://localhost:4000/team/new", json={
    "team_alias": "dev-team",
    "max_budget": 100,       # $100/月
    "budget_duration": "1mo",
    "models": ["claude-fast", "gpt-fallback"],  # 使えるモデルを制限
}, headers={"Authorization": "Bearer sk-my-master-key"})

# チームメンバー専用のキーを発行
requests.post("http://localhost:4000/key/generate", json={
    "team_id": "dev-team",
    "key_alias": "dev-member-001",
})
```

2. **コスト最適化のためにモデルルーティング:**
```yaml
# litellm_config.yaml
# 安い/速いモデルを優先して使い、超えたら高いモデルにフォールバック
router_settings:
  routing_strategy: "cost-based-routing"

model_list:
  - model_name: smart-router
    litellm_params:
      model: claude-haiku-4-5-20251001  # まずこれを使う（安い）
      api_key: sk-ant-...
  - model_name: smart-router
    litellm_params:
      model: claude-opus-4-7            # 失敗したらこちら（高い）
      api_key: sk-ant-...
```

3. **Redisでキャッシングを有効化:**
```yaml
# litellm_config.yaml
litellm_settings:
  cache: true
  cache_params:
    type: "redis"
    host: "localhost"
    port: 6379
    ttl: 600  # 10分間キャッシュ

# → 同一リクエストがRedisキャッシュからリターン
# → 繰り返しの多いFAQ系ではコスト大幅削減
```

4. **Langfuseと統合してトレーシング:**
```yaml
# litellm_config.yaml
litellm_settings:
  success_callback: ["langfuse"]

environment_variables:
  LANGFUSE_PUBLIC_KEY: pk-lf-...
  LANGFUSE_SECRET_KEY: sk-lf-...
# → 全リクエストが自動でLangfuseにトレースされる
```

---

## セキュリティ観点

### APIキーの一元管理
```python
# プロバイダーキーはプロキシサーバーのみが保持
# チームには proxy_key のみを配布
# → プロバイダーキーが漏洩するリスクが激減

# キーのローテーション時もプロキシの設定変更だけでOK
# チームメンバーの設定変更は不要
```

### アクセスログの保持
```yaml
litellm_settings:
  store_model_in_db: true   # モデル使用をDBに保存
  store_prompts_in_db: false  # プロンプト内容は保存しない（プライバシー）
```

---

## ペルソナ設定と使い方

### ペルソナ：坂本 武（43歳・事業会社のAI推進担当・10チームがバラバラにLLMを使っている）

坂本さんの会社では10の部門が個別にOpenAI/AnthropicのAPIキーを取得して使い始め、月の請求が予算を超えても誰がどこで使っているか分からない状態になっていた。セキュリティ部門からは「APIキーの管理が分散していてリスクが高い」と指摘された。

```bash
# 社内のVMにLiteLLMプロキシをデプロイ

# docker-compose.yml
services:
  litellm:
    image: ghcr.io/berriai/litellm:main-latest
    ports:
      - "4000:4000"
    volumes:
      - ./litellm_config.yaml:/app/config.yaml
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/litellm
      - STORE_MODEL_IN_DB=true
    command: --config /app/config.yaml --port 4000 --detailed_debug

  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: litellm
```

```yaml
# litellm_config.yaml
model_list:
  - model_name: default
    litellm_params:
      model: claude-haiku-4-5-20251001  # デフォルトは安いモデル
      api_key: os.environ/ANTHROPIC_API_KEY
  - model_name: powerful
    litellm_params:
      model: claude-opus-4-7
      api_key: os.environ/ANTHROPIC_API_KEY

general_settings:
  master_key: sk-company-master  # 坂本さんのみが知る
```

```python
# 10部門それぞれにチームキーを発行
teams = ["営業", "マーケ", "開発", "CS", "経理", "人事", "法務", "企画", "物流", "品質"]
for team in teams:
    create_team(name=team, monthly_budget_usd=50)
    issue_team_key(team=team)

# 3ヶ月後の効果:
# - プロバイダーAPIキーを集約 → セキュリティリスク解消
# - 部門別コスト可視化 → 「開発チームが全体の60%を使っていた」を発見
# - 月次予算上限 → 予算超過ゼロ（制限に達したらSlack通知）
# - 月額: $12,000 → $7,200（使用量削減 + キャッシング効果）
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| Langfuse (#01) | 可視化・評価特化（コスト制限機能はない） |
| OpenRouter | クラウド型LLMゲートウェイ（自己ホスト不可） |
| Portkey | 商用LLMゲートウェイ（有料） |
| One API | 中国発のOSSゲートウェイ（LiteLLMと同系） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/BerriAI/litellm)
- [公式ドキュメント](https://docs.litellm.ai/)
