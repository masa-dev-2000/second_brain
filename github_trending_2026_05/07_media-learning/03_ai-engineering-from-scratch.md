# anthropics-courses/ai-engineering-from-scratch

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [anthropics-courses/ai-engineering-from-scratch](https://github.com/anthropics-courses/ai-engineering-from-scratch) |
| 言語 | Python / Jupyter Notebook |
| 総スター数 | 21,034 |
| 本日のスター | +847 |
| ライセンス | MIT |
| トレンド順位 | #12相当（2026/05/22） |
| カテゴリ | メディア・学習 / AI エンジニアリングカリキュラム |

---

## 概要

Anthropicが公開した「ゼロからAIエンジニアリングを学ぶ」完全カリキュラム。435レッスンのJupyterノートブックで構成され、Claude APIの基礎から始まり、RAG・エージェント・評価・プロダクション展開まで体系的に学べる。

「APIを叩けるだけのエンジニア」から「本番品質のAIシステムを設計・実装・評価できるエンジニア」へのレベルアップを目指した実践的な内容。各レッスンにコード例・演習問題・解答が含まれる。

---

## カリキュラム構成

| モジュール | 内容 | レッスン数 |
|-----------|------|-----------|
| **Module 1: Foundations** | Claude API基礎・プロンプトエンジニアリング | 45レッスン |
| **Module 2: Document Processing** | MarkItDown・PDF処理・構造化データ抽出 | 38レッスン |
| **Module 3: RAG Systems** | ベクトルDB・埋め込み・チャンク戦略 | 52レッスン |
| **Module 4: Agent Design** | ツール呼び出し・マルチステップエージェント | 61レッスン |
| **Module 5: Multi-Agent** | エージェントオーケストレーション・評価 | 48レッスン |
| **Module 6: Evaluation** | LLM評価・ベンチマーク・品質指標 | 43レッスン |
| **Module 7: Production** | コスト最適化・モニタリング・スケーリング | 55レッスン |
| **Module 8: Advanced Topics** | ファインチューニング・セキュリティ・最新動向 | 93レッスン |

---

## あるとないとの違い

| 観点 | 断片的な学習（ブログ・YouTube） | このカリキュラム |
|------|-------------------------------|----------------|
| 体系性 | つまみ食いで知識の穴ができる | 基礎から積み上げる構造化された学習 |
| 実践性 | 理論偏重になりがち | 各レッスンに実行可能なコードと演習 |
| 評価方法 | 「なんとなくできた気がする」 | 演習問題とテストで理解度を確認 |
| 最新性 | 記事が古くて動かないコードが多い | Anthropic公式のため最新APIに対応 |

---

## 環境構築方法

### 前提条件
- Python 3.10以上
- Anthropic API Key（無料クレジットで始められる）
- Jupyter Notebook または VS Code（Jupyter拡張）

### セットアップ
```bash
# リポジトリのクローン
git clone https://github.com/anthropics-courses/ai-engineering-from-scratch
cd ai-engineering-from-scratch

# 仮想環境の作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係のインストール
pip install -r requirements.txt

# API Keyの設定
export ANTHROPIC_API_KEY=sk-ant-...
# または .env ファイルに保存
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
```

### Jupyter Notebookの起動
```bash
# Jupyter Lab（推奨）
jupyter lab

# または従来のJupyter Notebook
jupyter notebook

# → ブラウザで http://localhost:8888 が開く
# modules/01_foundations/ から開始
```

### VS Codeでの実行
```bash
# VS Code + Jupyter拡張を使う場合
code .

# 拡張機能をインストール:
# - Jupyter (ms-toolsai.jupyter)
# - Python (ms-python.python)

# .ipynb ファイルを開いて実行
```

---

## ベストプラクティス

1. **Module 1から順番に進む（スキップしない）:**
```python
# Module 1, Lesson 3: 温度パラメータの理解
import anthropic

client = anthropic.Anthropic()

# 温度0: 決定論的（毎回同じ答え）
response_deterministic = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=100,
    temperature=0,  # 0〜1
    messages=[{"role": "user", "content": "サイコロを振った結果は？"}]
)

# 温度1: 創造的（毎回異なる答え）
response_creative = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=100,
    temperature=1,
    messages=[{"role": "user", "content": "サイコロを振った結果は？"}]
)

# → 違いを実際に観察して直感を養う
```

2. **演習問題を必ず自力で解いてから解答を見る:**
```python
# Module 3, Exercise: 独自のチャンク戦略を実装
# （解答を見る前に自分で実装する）

def my_chunking_strategy(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    """
    自分で考えた実装
    """
    # TODO: 実装してみる
    pass

# 解答と比較
# → 自分の実装と解答の違いからトレードオフを学ぶ
```

3. **Module 6（評価）を軽視しない:**
```python
# Module 6: LLMの出力を評価する方法
# 多くの入門者が飛ばすが実務では最重要

# LLM-as-a-judge（評価者もLLMを使う）
def evaluate_response(question: str, response: str, criteria: str) -> dict:
    eval_result = client.messages.create(
        model="claude-opus-4-7",
        messages=[{
            "role": "user",
            "content": f"""以下の回答を評価してください。

質問: {question}
回答: {response}
評価基準: {criteria}

以下のJSON形式で評価を返してください:
{{"score": 1-5, "reasoning": "評価理由", "improvements": ["改善点1", "改善点2"]}}"""
        }]
    )
    return json.loads(eval_result.content[0].text)
```

4. **学習コミュニティに参加する:**
```bash
# Anthropicの公式Discord
# → 他の受講者と演習の解法を議論
# → 詰まったときに質問

# 学習ログをつける
# 各モジュール完了時に理解度を自己評価
# 「できた」「理解できた」「応用できる」の3段階
```

---

## セキュリティ観点

### APIキーの管理
```python
# 悪い例（コードにAPIキーを直書き）
client = anthropic.Anthropic(api_key="sk-ant-...")  # NG: Gitにコミットしてしまう

# 良い例（環境変数から読み込み）
import os
from dotenv import load_dotenv

load_dotenv()
client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

# .gitignoreに.envを追加
echo ".env" >> .gitignore
```

### コストの管理
```python
# Module 7で詳しく学ぶが、基本として
import anthropic

# トークン数を事前推定
def estimate_cost(text: str, model: str = "claude-opus-4-7") -> dict:
    # claude-opus-4-7: $15/MTok (input) + $75/MTok (output)
    # claude-haiku-4-5: $0.80/MTok (input) + $4/MTok (output)
    
    # 簡易推定（英語: 1 token ≈ 4文字、日本語: 1 token ≈ 1.5文字）
    estimated_tokens = len(text) / 1.5
    
    pricing = {
        "claude-opus-4-7": {"input": 15/1e6, "output": 75/1e6},
        "claude-haiku-4-5-20251001": {"input": 0.8/1e6, "output": 4/1e6}
    }
    
    cost = estimated_tokens * pricing[model]["input"]
    return {"estimated_tokens": int(estimated_tokens), "estimated_cost_usd": cost}
```

---

## ペルソナ設定と使い方

### ペルソナ：村上 健（28歳・Webエンジニア3年目・AIシステムを仕事で作りたい）

村上さんは普通のWebエンジニアとして働いているが、「AI機能を実装したい」という依頼が上司から来るようになった。ChatGPTは使ったことがあるがAPIを使ったことがなく、RAGやエージェントという言葉を聞いても「なんとなくわかるけど作れない」という状態。

```python
# 8週間の学習計画

# Week 1-2: Module 1-2 (基礎)
# 目標: Claude APIで動くものを作れるようになる

# Lesson 1.1: 最初のAPI呼び出し（30分で動くものができる）
import anthropic
client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Pythonで素数を判定する関数を書いて"}]
)
print(response.content[0].text)
# → これだけで動く。自信がつく

# Week 3-4: Module 3 (RAG)
# 目標: 社内ドキュメントを検索できるシステムを作る

# 演習: 自分の会社の仕様書PDFでRAGを構築
from markitdown import MarkItDown
import chromadb

md = MarkItDown()
result = md.convert("spec.pdf")

# ベクトルDBに保存
client_db = chromadb.Client()
collection = client_db.create_collection("company-docs")
collection.add(documents=[result.text_content], ids=["spec"])

# → 「この機能の仕様は？」と自然言語で検索できる

# Week 5-6: Module 4-5 (エージェント)
# 目標: ツールを呼び出せるエージェントを作る

# Week 7-8: Module 6-7 (評価・本番化)
# 目標: 上司に見せられる品質にする

# 8週間後の成果:
# - Module 1〜7を完了（約300レッスン）
# - 社内向けAIチャットボット（RAG + ツール呼び出し）をデプロイ
# - 「AIを使ったシステムを設計・実装できる」という自信
# - 社内で「AI担当」として認識される
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| Anthropic公式ドキュメント | APIリファレンス（カリキュラム形式ではない） |
| fast.ai | ディープラーニング入門（APIよりも低レイヤー） |
| LangChain Academy | LangChainフレームワーク特化 |
| DeepLearning.AI短期コース | 個別トピックの短期コース（体系的ではない） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/anthropics-courses/ai-engineering-from-scratch)
- [Anthropic API ドキュメント](https://docs.anthropic.com/)
- [Anthropic クックブック](https://github.com/anthropics/anthropic-cookbook)
