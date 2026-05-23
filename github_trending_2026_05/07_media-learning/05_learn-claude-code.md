# shareAI-lab/learn-claude-code

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [shareAI-lab/learn-claude-code](https://github.com/shareAI-lab/learn-claude-code) |
| 言語 | Python |
| 総スター数 | 62,067 |
| フォーク数 | 10,135 |
| ライセンス | MIT |
| カテゴリ | 学習 / Claude Code・エージェントハーネス入門 |

---

## 概要

**「Bash is all you need」** — Claude Codeのようなエージェントハーネスを0から1に自分で実装しながら学ぶチュートリアル。Karpathyの `nn-zero-to-hero` のClaude Code版と言える存在。

最小限のPythonでエージェントループ・ツール呼び出し・サブエージェント・メモリの仕組みを手書きで実装することで、Claude Code / Codex / Gemini CLI 等のAIコーディングツールの内部構造を本質的に理解できる。

---

## コースの構成

```
Chapter 0: Bash is all you need
  → なぜBashだけでエージェントが作れるか
  → Claude APIの最小呼び出し

Chapter 1: The Basic Agent Loop
  → ループ・ツール呼び出し・停止条件

Chapter 2: Tools and Tool Routing
  → Bash/Read/Write/Editツールの実装

Chapter 3: Memory and Context
  → 会話履歴・コンテキスト管理

Chapter 4: Subagents and Parallelism
  → サブエージェントの起動・結果の集約

Chapter 5: Real Harness = Claude Code
  → ここまでが理解できるとClaude Codeが読める
```

---

## あるとないとの違い

| 観点 | Claude Codeをただ使う | このコースを修了後 |
|------|-------------------|----|
| エラーの対処 | 「なぜ止まるか」分からない | ループ・ツール・プロンプトのどこで詰まるか診断できる |
| カスタムツール | Claude Codeのデフォルトに縛られる | 任意のツールをエージェントに追加できる |
| マルチエージェント設計 | オーケストレーションが難しい | サブエージェントのI/O設計ができる |
| コスト最適化 | トークンの流れが見えない | どこでトークンが消費されるかを把握して制御できる |

---

## 環境構築方法

### インストール
```bash
git clone https://github.com/shareAI-lab/learn-claude-code
cd learn-claude-code

pip install anthropic
export ANTHROPIC_API_KEY="sk-ant-..."
```

### Chapter 1: 最小エージェントループ（チュートリアル核心）
```python
# Chapter 1の実装（コース内容から抜粋）

import anthropic
import subprocess
import json

client = anthropic.Anthropic()

# ツール定義
tools = [
    {
        "name": "bash",
        "description": "シェルコマンドを実行する",
        "input_schema": {
            "type": "object",
            "properties": {
                "command": {"type": "string", "description": "実行するコマンド"}
            },
            "required": ["command"]
        }
    }
]

def run_tool(name: str, inputs: dict) -> str:
    if name == "bash":
        result = subprocess.run(
            inputs["command"], shell=True, capture_output=True, text=True, timeout=30
        )
        return result.stdout + result.stderr
    return f"Unknown tool: {name}"

def agent_loop(user_message: str) -> str:
    messages = [{"role": "user", "content": user_message}]
    
    while True:
        response = client.messages.create(
            model="claude-opus-4-7",
            max_tokens=4096,
            tools=tools,
            messages=messages,
        )
        
        # モデルが「完了」と判断したら終了
        if response.stop_reason == "end_turn":
            return response.content[-1].text
        
        # ツール呼び出しを処理
        tool_uses = [b for b in response.content if b.type == "tool_use"]
        tool_results = []
        
        for tool_use in tool_uses:
            result = run_tool(tool_use.name, tool_use.input)
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": tool_use.id,
                "content": result,
            })
        
        # メッセージ履歴に追加してループ
        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})

# 動かしてみる
result = agent_loop("現在のディレクトリの構造を調べて、Pythonファイルの数を教えて")
print(result)
```

---

## ベストプラクティス

1. **Chapterを順番に手打ちで実装する:**
```
# コピペ禁止。実装することで以下が身につく:
# - なぜ messages リストに両方向（user/assistant）が必要か
# - stop_reason == "tool_use" と "end_turn" の違い
# - tool_use_id がなぜ必要か（並列ツール呼び出しの対応付け）
```

2. **Bashツールを拡張してRead/Write/Editを追加:**
```python
tools = [
    # Bash（Chapter 1）
    {"name": "bash", ...},
    # Read（Chapter 2で追加）
    {
        "name": "read_file",
        "description": "ファイルの内容を読む",
        "input_schema": {
            "type": "object",
            "properties": {
                "file_path": {"type": "string"},
                "offset": {"type": "integer"},
                "limit": {"type": "integer"},
            },
            "required": ["file_path"]
        }
    },
    # Edit（Chapter 2で追加）
    {
        "name": "edit_file",
        "description": "ファイルの特定の文字列を置換する",
        "input_schema": {
            "type": "object",
            "properties": {
                "file_path": {"type": "string"},
                "old_string": {"type": "string"},
                "new_string": {"type": "string"},
            },
            "required": ["file_path", "old_string", "new_string"]
        }
    },
]
# ← これを実装した瞬間、Claude Codeが何をしているか分かる
```

3. **Chapter 4のサブエージェント実装でスケールを学ぶ:**
```python
import asyncio

async def spawn_subagent(task: str) -> str:
    """サブエージェントを起動して結果を待つ"""
    return await asyncio.to_thread(agent_loop, task)

async def parallel_agent(user_message: str):
    # オーケストレーターが複数タスクに分解
    tasks = [
        "src/ディレクトリのPythonファイルを列挙して",
        "tests/ディレクトリのテストファイルを列挙して",
        "README.mdの内容を要約して",
    ]
    # 並列実行
    results = await asyncio.gather(*[spawn_subagent(t) for t in tasks])
    return results
```

---

## セキュリティ観点

```python
# Bashツールは危険なコマンドを実行できる → サンドボックスが必要
import subprocess

ALLOWED_COMMANDS = ["ls", "cat", "grep", "find", "python", "pip"]

def safe_bash(command: str) -> str:
    # コマンドの先頭をチェック
    cmd_name = command.split()[0]
    if cmd_name not in ALLOWED_COMMANDS:
        return f"許可されていないコマンド: {cmd_name}"
    
    result = subprocess.run(
        command, shell=True, capture_output=True, text=True,
        timeout=10,  # タイムアウト必須
        cwd="/sandbox"  # 作業ディレクトリを限定
    )
    return result.stdout[:10000]  # 出力サイズを制限
```

---

## ペルソナ設定と使い方

### ペルソナ：田中 愛（28歳・フロントエンドエンジニア・Claude Codeをもっと使いこなしたい）

田中さんはClaude Codeを日常的に使ってUIコンポーネントを書いているが、「なぜカスタムツールが必要なのか」「マルチエージェントはどう設計するか」が腑に落ちていない。このコースで実装してから、Claude Codeのログを見る目が変わった。

```
修了後の変化:
1. Claude Codeの「Tool call: bash」ログが全部読めるようになった
2. 自社製品向けの custom tool（社内API呼び出し）を Claude Code に追加できた
3. サブエージェントで「テスト修正」「コードレビュー」「ドキュメント生成」を
   並列実行するワークフローを自分で設計できた
4. コスト見積もりができるようになった
   → "このタスクは tool_use を平均5回するから ~$0.03/実行"

コース所要時間: 週末2日（計約14時間）
推奨環境: Python 3.10+, ANTHROPIC_API_KEY
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| [ai-engineering-from-scratch](./03_ai-engineering-from-scratch.md) | AI活用・プロダクト開発のコース |
| [nn-zero-to-hero](./04_nn-zero-to-hero.md) | NN実装の基礎（モデル側を理解する） |
| Claude Agent SDK | 本番向けエージェント構築ライブラリ（このコースの発展形） |
| awesome-claude-code | Claude Code周辺のOSSリソース集 |

---

## 参考リンク

- [公式リポジトリ](https://github.com/shareAI-lab/learn-claude-code)
- [公式サイト](https://learn.shareai.run)
