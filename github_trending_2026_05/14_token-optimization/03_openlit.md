# openlit/openlit

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [openlit/openlit](https://github.com/openlit/openlit) |
| 言語 | TypeScript / Python |
| 総スター数 | 2,461 |
| ライセンス | Apache 2.0 |
| カテゴリ | トークン最適化 / OpenTelemetryネイティブLLMモニタリング |

---

## 概要

OpenTelemetry標準に準拠したLLM可観測性プラットフォーム。LLMのトレーシングに加えて**GPUモニタリング**も統合しており、「AI推論のコスト全体（API費用＋コンピュート費用）」を一元管理できる唯一のOSSプラットフォーム。

50以上のLLMプロバイダー・ベクトルDB・エージェントフレームワークに対応し、Grafana・Prometheus等の既存オブザーバビリティスタックに組み込める。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **LLMトレーシング** | リクエスト単位のトークン・コスト・レイテンシをOTel形式で収集 |
| **GPUモニタリング** | NVIDIA GPU（VRAM・使用率・温度）をリアルタイム監視 |
| **ガードレール** | 有害コンテンツ・PII・プロンプトインジェクションを検知 |
| **評価（Evals）** | RAG精度・ハルシネーション・一貫性を自動評価 |
| **PromptHub** | プロンプトのバージョン管理・A/Bテスト |
| **Playground** | 実験環境でプロンプトを試して本番に反映 |

---

## あるとないとの違い

| 観点 | Langfuse | OpenLit |
|------|----------|---------|
| OpenTelemetry準拠 | 部分的 | ネイティブ（OTel SDKで計装） |
| GPU監視 | なし | NVIDIA GPU完全対応 |
| 既存OTelスタックとの統合 | 独自のSDK | Prometheus/Grafana/Jaegerと直接統合 |
| 守備範囲 | LLMに特化 | LLM + インフラコスト全体 |

---

## 環境構築方法

### Docker（推奨）
```bash
git clone https://github.com/openlit/openlit
cd openlit/deploy/docker

# 起動（OpenLit + ClickHouse + Grafana）
docker compose up -d

# → http://localhost:3000 でダッシュボードにアクセス
# デフォルト認証: user=admin, password=openlit
```

### Pythonアプリへの統合（1行）
```bash
pip install openlit
```

```python
import openlit

# アプリ起動時に1行追加するだけ
openlit.init(
    otlp_endpoint="http://localhost:4318",  # OpenLitのOTLPエンドポイント
    application_name="my-llm-app",
    environment="production",
)

# 以降は通常通りAnthropicやOpenAIを使うだけ
# → 自動で全LLM呼び出しがトレースされる
import anthropic
client = anthropic.Anthropic()
```

### Kubernetes / 既存Grafanaスタックへの統合
```yaml
# OpenTelemetry Collectorの設定でGrafanaに転送
exporters:
  otlphttp/openlit:
    endpoint: http://openlit:4318

# または直接Prometheusに送る
exporters:
  prometheus:
    endpoint: "0.0.0.0:9090"
```

---

## ベストプラクティス

1. **GPU使用量とLLMコストを相関分析:**
```python
# OpenLitダッシュボードで確認できること
# - モデル推論リクエスト数 vs GPU使用率の相関
# - バッチサイズを変えたときのスループット/コスト変化
# - ピーク時のVRAM使用量（OOM予測）

# ローカルLLM（Ollama）をデプロイしている場合特に有用
# API費用とGPU電力コストのどちらが安いか定量的に比較できる
```

2. **ガードレールでプロンプトインジェクションを検知:**
```python
import openlit

openlit.init(
    otlp_endpoint="http://localhost:4318",
    guard_prompt_injection=True,   # プロンプトインジェクション検知
    guard_sensitive_topics=True,   # 有害コンテンツ検知
    guard_pii=True,                # 個人情報検知
)

# 検知した場合:
# - ダッシュボードにアラートが表示される
# - オプションでリクエストをブロックできる
```

3. **RAG精度を自動評価:**
```python
from openlit.evals import RagContextRelevance, AnswerRelevance

# RAGの回答品質を自動スコアリング
context_eval = RagContextRelevance(
    provider="anthropic",
    api_key="sk-ant-..."
)

score = context_eval.measure(
    contexts=retrieved_chunks,
    question=user_question,
    answer=llm_answer,
)
# → スコアが閾値を下回ったらアラート（RAG品質の劣化を自動検知）
```

4. **既存のGrafanaダッシュボードに統合:**
```yaml
# Grafana datasource として OpenLit の ClickHouse を追加
# → 既存のインフラメトリクス（CPU/メモリ/ディスク）と
#   LLMメトリクス（トークン/コスト/レイテンシ）を1画面で確認
datasources:
  - name: OpenLit
    type: grafana-clickhouse-datasource
    url: http://clickhouse:8123
    database: openlit
```

---

## セキュリティ観点

### プロンプト内容の保存
```python
# デフォルトではプロンプト・レスポンスをClickHouseに保存
# 機密情報が含まれる場合は無効化
openlit.init(
    capture_message_content=False,  # プロンプト・レスポンス本文を保存しない
    # → トークン数・コスト・レイテンシのメタデータのみ保存
)
```

### ネットワーク分離
```bash
# OpenLitを社内ネットワークに限定（外部からアクセス不可）
# docker-compose.yml
services:
  openlit:
    ports:
      - "127.0.0.1:3000:3000"  # localhostのみ
```

---

## ペルソナ設定と使い方

### ペルソナ：中島 隆（37歳・MLエンジニア・オンプレのGPUクラスタでLLMを動かしている）

中島さんの会社はプライバシー上の理由でオンプレのNVIDIA A100×8台でLlama-3-70Bを動かしている。API費用はゼロだが「GPUリソースが適切に使われているか」「推論のスループットがどう変化しているか」が把握できていなかった。

```python
import openlit

openlit.init(
    otlp_endpoint="http://openlit.internal:4318",
    application_name="internal-llm",
    # GPU監視を有効化
    gpu_monitoring=True,
    gpu_polling_interval=5,  # 5秒ごとにGPU情報を収集
)

# LiteLLMを通じてローカルLLMを呼び出す
from litellm import completion

response = completion(
    model="ollama/llama3:70b",
    messages=[{"role": "user", "content": query}]
)

# ダッシュボードで確認できるようになったこと:
# - GPU利用率: 推論中 95% / アイドル時 5%（アイドルが多すぎる）
# - バッチサイズを16→32に変更 → スループット +40%、VRAM使用率 +15%
# - ピーク時（9-11時）にVRAM使用率が95%に達していた
#   → 4台目のGPUを追加するよりバッチスケジューリングで解決

# 3ヶ月後:
# GPU稼働率: 40% → 75%（同一ハードウェアで処理量1.8倍）
# 追加GPU購入を回避（$50万のコスト削減）
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| Langfuse (#01) | LLM特化・より使いやすいUI（GPUモニタリングなし） |
| Prometheus + Grafana | 汎用モニタリング（LLM特有のメトリクスは自前実装が必要） |
| Datadog LLM Observability | 商用・高機能・高コスト |
| Weights & Biases | ML実験管理（LLMモニタリングは追加機能） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/openlit/openlit)
- [公式ドキュメント](https://docs.openlit.io/)
