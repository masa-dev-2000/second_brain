# antoinezambelli/forge

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [antoinezambelli/forge](https://github.com/antoinezambelli/forge) |
| 言語 | Python |
| 総スター数 | 1,476 |
| 本日のスター | +449 |
| ライセンス | MIT |
| トレンド順位 | #12（2026/05/22） |
| カテゴリ | エージェントフレームワーク / ローカルLLM強化 |

---

## 概要

小規模なローカルLLM（8Bパラメータ程度）でも高精度なマルチステップツール呼び出しを実現するPythonフレームワーク。ガードレール（リトライ・パース修復・ステップ強制）とコンテキスト管理によって、GPU1台で動くモデルを実用レベルに引き上げる。

26シナリオの評価スイートで86.5%の成功率を達成。865以上の決定論的ユニットテストでバックエンド不要の検証が可能。

---

## 3つの使用モード

| モード | 特徴 | 向いているケース |
|--------|------|-----------------|
| **WorkflowRunner** | ツールとワークフローを定義すると全体を管理 | シンプルなエージェントを素早く構築 |
| **Guardrailsミドルウェア** | 既存のオーケストレーションループに注入 | 既存コードへの後付け改善 |
| **プロキシサーバー** | OpenAI互換APIとして透過的に動作 | VS Code・aider等のクライアントをローカルモデルに向ける |

---

## あるとないとの違い

| 観点 | ない場合（素のローカルLLM） | ある場合 |
|------|---------------------------|---------|
| ツール呼び出し成功率 | 8Bモデルで30〜50%（エラー多発） | 86.5% |
| JSON解析失敗 | エラーで処理停止 | rescue parsingで自動修復して継続 |
| コンテキスト長 | VRAM不足でOOM | スマート圧縮で収まるよう調整 |
| 反復処理 | 同じエラーを繰り返す | nudge（ヒント追加）で軌道修正 |

---

## 環境構築方法

### 前提条件
- Python 3.12以上
- Ollama / llama.cpp / Llamafile（ローカルLLMバックエンド）またはAnthropicAPIキー

### インストール手順
```bash
# pip
pip install forge-agent

# または開発インストール
git clone https://github.com/antoinezambelli/forge
cd forge
pip install -e ".[dev]"
```

### ローカルバックエンドの準備（Ollamaの場合）
```bash
# Ollamaインストール
curl -fsSL https://ollama.com/install.sh | sh

# コーディング用モデルのダウンロード
ollama pull llama3.1:8b
ollama pull codellama:13b
```

### 基本設定
```python
from forge import WorkflowRunner, Workflow, ToolDef
from forge.clients import OllamaClient

client = OllamaClient(model="llama3.1:8b", base_url="http://localhost:11434")
```

### 動作確認
```bash
# テストスイートの実行（バックエンド不要）
pytest tests/ -v
# → 865テストが通れば環境OK
```

---

## ベストプラクティス

### WorkflowRunner の基本的な使い方
```python
import asyncio
from forge import WorkflowRunner, Workflow, ToolDef, FunctionSchema

# ツール定義
def get_weather(city: str) -> dict:
    return {"city": city, "temp": 22, "condition": "晴れ"}

weather_tool = ToolDef(
    name="get_weather",
    description="指定した都市の天気を取得する",
    schema=FunctionSchema(
        parameters={"city": {"type": "string", "description": "都市名"}},
        required=["city"]
    ),
    function=get_weather
)

# ワークフロー定義
workflow = Workflow(
    name="weather_check",
    tools={"get_weather": weather_tool},
    terminal_tool="get_weather",  # このツールが呼ばれたら終了
    max_steps=5
)

# 実行
async def main():
    runner = WorkflowRunner(client=OllamaClient(model="llama3.1:8b"))
    result = await runner.run(workflow, "東京の天気は？")
    print(result)

asyncio.run(main())
```

### プロキシサーバーモード（既存ツールをローカルLLMに向ける）
```bash
# フォージをプロキシサーバーとして起動
forge serve --port 11435 --backend ollama --model codellama:13b

# aider や VS Code をこのプロキシに向ける
export OPENAI_BASE_URL=http://localhost:11435
aider --model gpt-4  # gpt-4リクエストがcodellama:13bに転送される
```

### ガードレールの調整
```python
runner = WorkflowRunner(
    client=client,
    max_retries=3,          # リトライ上限
    nudge_after=2,          # 2回失敗後にヒントを追加
    context_compression=True # コンテキスト超過時に自動圧縮
)
```

---

## セキュリティ観点

### ローカル実行のメリット
- **コードがクラウドに出ない:** すべてのLLM処理がローカルマシン上で完結
- **APIキー不要:** ローカルバックエンド使用時はAnthropicやOpenAIのAPIキーが不要

### プロキシモードの注意点
```bash
# プロキシサーバーを外部に公開しない
# デフォルトはlocalhost限定で問題ないが、
# --host 0.0.0.0 は絶対に使わない（認証がないため）
forge serve --port 11435  # localhost限定（OK）
forge serve --host 0.0.0.0  # ← これは危険
```

### 依存関係の管理
```bash
# 依存関係の脆弱性チェック
pip audit
# または
safety check
```

---

## ペルソナ設定と使い方

### ペルソナ：渡辺 透（43歳・製造業の社内SE・プライバシーポリシー上クラウドAI使用不可）

渡辺さんの会社は個人情報保護の観点からコードをクラウドに送信することが禁止されている。AIコーディングツールを使いたいが、Claude CodeもCopilotも「データが外に出る」という理由でIT部門から使用禁止令が出ていた。

```python
# 社内の強力なワークステーション（RTX 4090搭載）でOllamaを実行
# codellama:34bモデルを使用（社内にデータが留まる）

from forge import WorkflowRunner, Workflow
from forge.clients import OllamaClient

# 社内品質管理システムの自動チェックワークフロー
workflow = Workflow(
    name="quality_check",
    tools={
        "check_spec": check_spec_tool,
        "validate_data": validate_data_tool,
        "generate_report": generate_report_tool
    },
    terminal_tool="generate_report"
)

runner = WorkflowRunner(
    client=OllamaClient(model="codellama:34b"),  # 完全ローカル
    max_retries=3
)

# 社内製品データを含むCSVを処理（社外に出ない）
result = await runner.run(workflow, "2026年5月の品質データを分析してレポート作成")

# IT部門の承認：「データがローカルにしか行かないなら許可」
# 渡辺さん: 初めてAIツールを業務で使えるようになった
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| LangChain | 汎用LLMオーケストレーション（Forgeより高機能だが複雑） |
| LlamaIndex | RAG特化（ツール呼び出しはサブセット） |
| AutoGen | マルチエージェント会話フレームワーク |
| Ollama | ローカルLLM実行エンジン（Forgeと組み合わせて使う） |

### 対応バックエンド
- Ollama（推奨・最もシンプル）
- llama.cpp
- Llamafile
- Anthropic Claude（クラウドだが高精度検証に使用可能）

---

## 参考リンク

- [公式リポジトリ](https://github.com/antoinezambelli/forge)
- [Ollama（ローカルLLM実行）](https://ollama.ai/)
