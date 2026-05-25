# openai/openai-agents-python

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [openai/openai-agents-python](https://github.com/openai/openai-agents-python) |
| 言語 | Python |
| 総スター数 | 26,555 |
| ライセンス | MIT |
| カテゴリ | エージェントフレームワーク / 軽量マルチエージェントフレームワーク |

---

## 概要

OpenAI公式の軽量マルチエージェントフレームワーク。Swarm（実験的プロジェクト）を本番向けに再設計したもの。エージェント間のハンドオフ・ツール呼び出し・ガードレール・トレーシングを最小限のコードで実装できる。

LangGraphより学習コストが低く、「まずエージェントを動かしたい」「シンプルなマルチエージェントを作りたい」ユースケースに最適。OpenAI以外のモデルも利用可能。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **エージェント定義** | 名前・指示・ツール・モデルを数行で定義 |
| **ハンドオフ** | エージェント間の処理移譲を自動管理 |
| **ガードレール** | 入出力の検証を宣言的に定義 |
| **トレーシング** | 実行フローの可視化（OpenAI Dashboard連携） |
| **ストリーミング** | 各ステップをリアルタイムでストリーム |
| **音声対応** | 音声入出力エージェントを構築可能 |

---

## あるとないとの違い

| 観点 | LangGraph | openai-agents-python |
|------|----------|---------------------|
| 学習コスト | 中（グラフ概念の理解が必要） | 低（Pythonの関数感覚で書ける） |
| 柔軟性 | 高（複雑なフローを明示的に制御） | 中（シンプルなパターンに最適） |
| マルチエージェント | ○ | ○（ハンドオフで簡単に実装） |
| OpenAI以外のモデル | ○ | ○（litellm経由） |
| ボイラープレート量 | 多め | 少ない |

---

## 環境構築方法

### インストール
```bash
pip install openai-agents

export OPENAI_API_KEY=sk-...
```

### 最小構成
```python
from agents import Agent, Runner

agent = Agent(
    name="アシスタント",
    instructions="丁寧に日本語で答えてください。",
)

result = Runner.run_sync(agent, "東京の天気は？")
print(result.final_output)
```

---

## ベストプラクティス

1. **専門エージェントにハンドオフ:**
```python
from agents import Agent, Runner, handoff

# 専門エージェントを定義
billing_agent = Agent(
    name="請求担当",
    instructions="請求・支払いに関する質問を処理してください。",
)

tech_agent = Agent(
    name="技術サポート",
    instructions="技術的な問題を解決してください。",
)

# トリアージエージェントが振り分ける
triage_agent = Agent(
    name="受付",
    instructions="問い合わせ内容を判断して適切な担当者に引き継いでください。",
    handoffs=[billing_agent, tech_agent],
)

result = Runner.run_sync(triage_agent, "支払い方法を変更したい")
# → 自動的に billing_agent にハンドオフ
```

2. **ツールで外部APIと連携:**
```python
from agents import Agent, Runner, function_tool

@function_tool
def get_weather(city: str) -> str:
    """指定した都市の天気を返す"""
    response = requests.get(f"https://api.weather.com/?city={city}")
    return response.json()["description"]

@function_tool
def send_slack(channel: str, message: str) -> str:
    """Slackにメッセージを送る"""
    slack_client.chat_postMessage(channel=channel, text=message)
    return "送信完了"

agent = Agent(
    name="アシスタント",
    tools=[get_weather, send_slack],
)
```

3. **ガードレールで入力を検証:**
```python
from agents import Agent, Runner, GuardrailFunctionOutput, input_guardrail
from pydantic import BaseModel

class ContentCheck(BaseModel):
    is_safe: bool
    reason: str

@input_guardrail
async def safety_check(ctx, agent, input_text) -> GuardrailFunctionOutput:
    # 入力テキストを検証するLLMを呼び出す
    result = await check_safety(input_text)
    return GuardrailFunctionOutput(
        output_info=ContentCheck(is_safe=result.safe, reason=result.reason),
        tripwire_triggered=not result.safe,
    )

agent = Agent(
    name="安全なアシスタント",
    input_guardrails=[safety_check],
)
```

4. **非OpenAIモデルを使う（litellm経由）:**
```python
from agents import Agent, set_default_openai_client
from openai import AsyncOpenAI

# Anthropic Claude を使う
client = AsyncOpenAI(
    base_url="https://api.anthropic.com/v1/",
    api_key="sk-ant-...",
)
set_default_openai_client(client)

agent = Agent(
    name="Claudeエージェント",
    model="claude-opus-4-7",
)
```

---

## セキュリティ観点

```python
# ガードレールで機密情報の漏洩を防ぐ
@output_guardrail
async def pii_check(ctx, agent, output) -> GuardrailFunctionOutput:
    """出力に個人情報が含まれていないか確認"""
    has_pii = detect_pii(output.content)
    return GuardrailFunctionOutput(
        tripwire_triggered=has_pii,
        output_info={"pii_detected": has_pii}
    )
```

---

## ペルソナ設定と使い方

### ペルソナ：木下 亜美（29歳・スタートアップ CTO・カスタマーサポートを自動化したい）

```python
# カスタマーサポートマルチエージェントを1日で構築

faq_agent = Agent(
    name="FAQ担当",
    instructions="よくある質問に回答してください。回答できない場合はエスカレーション。",
    tools=[search_knowledge_base],
)

human_escalation = Agent(
    name="エスカレーション",
    instructions="複雑な問い合わせを記録して担当者に通知してください。",
    tools=[create_ticket, notify_team],
)

support_agent = Agent(
    name="サポート受付",
    instructions="問い合わせを受け付け、FAQで解決できるか判断してください。",
    handoffs=[faq_agent, human_escalation],
)

# Webhookでユーザーの問い合わせを受け取って実行
async def handle_inquiry(message: str):
    result = await Runner.run(support_agent, message)
    return result.final_output

# 1日で構築・翌日から問い合わせ対応の80%が自動化
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| LangGraph (#08) | 複雑なフローをグラフで制御（より強力） |
| mastra (#10) | TypeScript向けの同様のフレームワーク |
| CrewAI | ロールベースのマルチエージェント |

---

## 参考リンク

- [公式リポジトリ](https://github.com/openai/openai-agents-python)
- [公式ドキュメント](https://openai.github.io/openai-agents-python/)
