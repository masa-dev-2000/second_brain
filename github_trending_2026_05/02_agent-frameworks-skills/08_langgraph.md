# langchain-ai/langgraph

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph) |
| 言語 | Python / TypeScript |
| 総スター数 | 32,632 |
| ライセンス | MIT |
| カテゴリ | エージェントフレームワーク / グラフ型エージェントオーケストレーション |

---

## 概要

エージェントのフロー（状態・分岐・ループ・並列実行）をグラフ構造で明示的に定義するフレームワーク。LangChainの上位レイヤーとして位置づけられるが単独でも使用可能。

「エージェントが次に何をするか分からない」という問題を、ノード（処理）とエッジ（遷移条件）で図示・制御することで解決する。人間のレビューステップの挿入・状態の永続化・エラー時のリトライも組み込める。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **状態グラフ** | ノード（LLM/ツール）とエッジ（条件分岐）で処理フローを定義 |
| **Human-in-the-loop** | 任意ステップで人間のレビュー・修正を挿入 |
| **チェックポイント** | 実行状態を永続化・中断再開が可能 |
| **マルチエージェント** | Supervisor・Swarm等のマルチエージェントパターンを内蔵 |
| **ストリーミング** | 各ノードの実行をリアルタイムでストリーム出力 |
| **LangSmith統合** | デバッグ・トレーシング・評価との統合 |

---

## あるとないとの違い

| 観点 | 通常のLLMチェーン | LangGraph |
|------|-----------------|---------|
| 分岐・ループ | 実装が複雑 | ノードとエッジで直感的に定義 |
| 状態管理 | 自前で実装 | TypedDictで型安全に管理 |
| 人間レビューの挿入 | 難しい | interrupt()で任意ステップに挿入 |
| デバッグ | ブラックボックス | グラフを可視化・各ステップをトレース |
| 再試行・エラー処理 | 自前実装 | リトライポリシーを宣言的に設定 |

---

## 環境構築方法

### インストール
```bash
pip install langgraph

# LangChainと合わせて使う場合
pip install langchain langgraph langchain-anthropic

# LangSmith（デバッグ・トレーシング）
pip install langsmith
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=ls-...
```

### 最小構成の動作確認
```python
from langgraph.graph import StateGraph, END
from typing import TypedDict

class State(TypedDict):
    message: str
    result: str

def process(state: State) -> State:
    return {"result": f"処理完了: {state['message']}"}

graph = StateGraph(State)
graph.add_node("process", process)
graph.set_entry_point("process")
graph.add_edge("process", END)

app = graph.compile()
result = app.invoke({"message": "テスト"})
print(result)  # {"message": "テスト", "result": "処理完了: テスト"}
```

---

## ベストプラクティス

1. **ReActエージェントを最小構成で作る:**
```python
from langchain_anthropic import ChatAnthropic
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent

@tool
def search_web(query: str) -> str:
    """Webを検索する"""
    # 実際の検索実装
    return f"{query} の検索結果..."

@tool
def calculate(expression: str) -> str:
    """数式を計算する"""
    return str(eval(expression))

llm = ChatAnthropic(model="claude-opus-4-7")
agent = create_react_agent(llm, tools=[search_web, calculate])

result = agent.invoke({"messages": [("user", "東京の人口は？それを100で割ると？")]})
```

2. **Human-in-the-loopで重要ステップにレビューを挿入:**
```python
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import interrupt

def risky_action(state):
    # 重要な処理の前に人間の確認を要求
    user_input = interrupt({
        "action": "本番DBを更新しようとしています",
        "data": state["sql_query"],
        "question": "実行しますか？ (yes/no)"
    })
    
    if user_input.lower() == "yes":
        return execute_query(state["sql_query"])
    else:
        return {"result": "キャンセルされました"}
```

3. **並列実行でエージェントを高速化:**
```python
from langgraph.graph import StateGraph

# 複数の調査を並列実行
builder = StateGraph(State)
builder.add_node("research_a", research_topic_a)
builder.add_node("research_b", research_topic_b)
builder.add_node("synthesize", synthesize_results)

# 並列実行 → 統合
builder.add_edge(START, "research_a")
builder.add_edge(START, "research_b")
builder.add_edge("research_a", "synthesize")
builder.add_edge("research_b", "synthesize")
```

4. **チェックポイントで長時間タスクを再開可能に:**
```python
from langgraph.checkpoint.postgres import PostgresSaver

# PostgreSQLにチェックポイントを保存
checkpointer = PostgresSaver.from_conn_string("postgresql://...")
app = graph.compile(checkpointer=checkpointer)

# 実行（thread_idで管理）
config = {"configurable": {"thread_id": "task-001"}}
app.invoke(input_data, config=config)

# サーバー再起動後も同じthread_idで再開できる
app.invoke(None, config=config)  # 中断箇所から再開
```

---

## セキュリティ観点

### 入力のサニタイズ
```python
# ツールへの入力を検証する
@tool
def execute_sql(query: str) -> str:
    """SQLを実行する"""
    # インジェクション対策
    if any(keyword in query.upper() for keyword in ["DROP", "DELETE", "TRUNCATE"]):
        raise ValueError("危険なSQLは実行できません")
    return db.execute(query)
```

### ツール実行の監査ログ
```python
# LangSmithで全ツール呼び出しをトレース
import langsmith
# → すべてのエージェント実行がLangSmithダッシュボードに記録される
```

---

## ペルソナ設定と使い方

### ペルソナ：山田 建（35歳・バックエンドエンジニア・社内業務自動化エージェントを構築中）

山田さんはLangChainでRAGを作った経験があるが、「分岐が必要な複雑な処理」「エラー時のリトライ」「人間のレビューステップ」を実装しようとして行き詰まった。

```python
# 請求書処理エージェントの実装

from langgraph.graph import StateGraph, END
from typing import TypedDict, Literal

class InvoiceState(TypedDict):
    pdf_path: str
    extracted_data: dict
    validated: bool
    approval_needed: bool
    approved: bool
    result: str

def extract_invoice(state):
    """PDFから請求書データを抽出"""
    data = parse_pdf(state["pdf_path"])
    return {"extracted_data": data}

def validate_invoice(state):
    """バリデーション"""
    data = state["extracted_data"]
    needs_approval = data["amount"] > 100000  # 10万円超は要承認
    issues = check_required_fields(data)
    return {"validated": len(issues) == 0, "approval_needed": needs_approval}

def request_approval(state):
    """Slackで承認依頼（Human-in-the-loop）"""
    approval = interrupt({
        "message": f"請求書承認依頼: {state['extracted_data']['amount']}円",
        "vendor": state["extracted_data"]["vendor"],
    })
    return {"approved": approval == "approved"}

def register_invoice(state):
    """会計システムに登録"""
    result = accounting_system.register(state["extracted_data"])
    return {"result": f"登録完了: {result['id']}"}

def route_approval(state) -> Literal["request_approval", "register"]:
    if not state["validated"]:
        return END
    return "request_approval" if state["approval_needed"] else "register"

builder = StateGraph(InvoiceState)
builder.add_node("extract", extract_invoice)
builder.add_node("validate", validate_invoice)
builder.add_node("request_approval", request_approval)
builder.add_node("register", register_invoice)

builder.set_entry_point("extract")
builder.add_edge("extract", "validate")
builder.add_conditional_edges("validate", route_approval)
builder.add_edge("request_approval", "register")
builder.add_edge("register", END)

app = builder.compile(checkpointer=MemorySaver())

# 実行
result = app.invoke({"pdf_path": "invoice_001.pdf"})
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| openai-agents-python (#09) | OpenAI公式の軽量マルチエージェント（グラフなし） |
| CrewAI | ロールベースのマルチエージェント（LangGraphより簡単） |
| AutoGen (Microsoft) | コード実行に強いマルチエージェント |
| Temporal | ワークフローオーケストレーション（AIエージェントではない） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/langchain-ai/langgraph)
- [公式ドキュメント](https://langchain-ai.github.io/langgraph/)
