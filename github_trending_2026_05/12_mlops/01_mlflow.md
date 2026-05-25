# mlflow/mlflow

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [mlflow/mlflow](https://github.com/mlflow/mlflow) |
| 言語 | Python |
| 総スター数 | 26,051 |
| ライセンス | Apache-2.0 |
| カテゴリ | MLOps / AI・LLMエンジニアリングプラットフォーム |

---

## 概要

MLflowは、機械学習モデルとLLMアプリケーションのライフサイクル全体を管理するオープンソースのAIエンジニアリングプラットフォーム。実験管理・モデルレジストリ・デプロイメント・評価・モニタリングを一元化する。Databricks社が主要な開発主体だが完全オープンソース。

近年はLLMエンジニアリングへの対応を大幅に強化。プロンプトエンジニアリングの実験追跡・LLMエージェントのトレース・RAGパイプラインの評価など、生成AIシステムの開発・運用に必要な機能を統合プラットフォームとして提供する。従来のML実験管理から「AI全般のエンジニアリング基盤」へと進化している。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **実験追跡（Tracking）** | パラメータ・メトリクス・アーティファクトを自動記録 |
| **モデルレジストリ** | モデルのバージョン管理・ステージング・本番移行を管理 |
| **LLMトレーシング** | LLMコール・エージェントの入出力をトレース・デバッグ |
| **評価（Evaluate）** | LLM応答品質の自動評価（精度・忠実度・関連性） |
| **プロンプト管理** | プロンプトテンプレートのバージョン管理と比較 |
| **モデルサービング** | REST APIとしてモデルをワンコマンドでデプロイ |
| **データセット管理** | 評価データセットの追跡と再現性確保 |
| **統合フレームワーク** | LangChain・OpenAI・Anthropic・AutoGenなどと自動統合 |

---

## あるとないとの違い

| 観点 | アドホック開発 | MLflow |
|------|-------------|--------|
| 実験の再現性 | 「あの時の条件が何だったか思い出せない」 | 全パラメータ・コード・データを自動記録 |
| モデル比較 | スプレッドシートに手動記録 | UIでメトリクスを自動グラフ比較 |
| LLMデバッグ | print/logで手動確認 | 全LLMコールのトレースをUIで可視化 |
| モデルのデプロイ | デプロイスクリプトを毎回自作 | `mlflow models serve`でAPIサーバー即起動 |
| チームでの共有 | ファイルを手動で共有 | 中央サーバーで実験結果を全員が参照可能 |

---

## 環境構築方法

### インストール

```bash
# 基本インストール
pip install mlflow

# LLM機能を含む（推奨）
pip install "mlflow[langchain]"
pip install "mlflow[openai]"

# UIサーバーを起動（ローカル）
mlflow ui
# → http://127.0.0.1:5000 でUIにアクセス
```

### リモートトラッキングサーバーの設定

```bash
# MLflowサーバーをDockerで起動
docker run -p 5000:5000 \
  -e MLFLOW_BACKEND_STORE_URI=postgresql://user:pass@db:5432/mlflow \
  -e MLFLOW_DEFAULT_ARTIFACT_ROOT=s3://mlflow-artifacts \
  ghcr.io/mlflow/mlflow:latest \
  mlflow server --host 0.0.0.0

# クライアント側での設定
export MLFLOW_TRACKING_URI=http://mlflow-server.company.com:5000
```

### 最小実験追跡の例

```python
import mlflow
import mlflow.openai

# トラッキングURIを設定
mlflow.set_tracking_uri("http://localhost:5000")
mlflow.set_experiment("my-llm-experiment")

# 実験を開始
with mlflow.start_run(run_name="gpt4o-rag-v1"):
    # パラメータを記録
    mlflow.log_params({
        "model": "gpt-4o",
        "temperature": 0.1,
        "chunk_size": 500,
        "top_k": 5,
    })

    # ... RAG処理を実行 ...
    accuracy = 0.87
    latency_p50 = 1.2  # 秒

    # メトリクスを記録
    mlflow.log_metrics({
        "accuracy": accuracy,
        "latency_p50_sec": latency_p50,
        "context_relevance": 0.91,
    })

    print(f"実験完了: accuracy={accuracy}")
```

---

## ベストプラクティス

1. **LLMトレーシングでエージェントの動作を可視化する:**
```python
import mlflow
import openai

# MLflowのOpenAI自動トレーシングを有効化
mlflow.openai.autolog()

client = openai.OpenAI()

with mlflow.start_run():
    # このOpenAIコールは自動的にトレースされる
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "あなたは有能なアシスタントです。"},
            {"role": "user", "content": "Pythonで階乗を計算する関数を書いて"},
        ],
        temperature=0.0,
    )

    # MLflow UIで入力・出力・レイテンシ・トークン使用量が自動記録される
    print(response.choices[0].message.content)
```

2. **LangChainパイプラインの全ステップを自動トレースする:**
```python
import mlflow
from langchain_openai import ChatOpenAI
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import Qdrant
from langchain_openai import OpenAIEmbeddings

# LangChain自動トレーシングを有効化
mlflow.langchain.autolog()

# RAGパイプラインを構築
vectorstore = Qdrant(...)
llm = ChatOpenAI(model="gpt-4o", temperature=0)
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),
)

with mlflow.start_run(run_name="rag-langchain-v2"):
    mlflow.log_params({
        "llm_model": "gpt-4o",
        "retriever_k": 5,
        "chain_type": "RetrievalQA",
    })

    # 質問を実行（全ステップが自動トレースされる）
    result = qa_chain.invoke({"query": "Pythonのasyncioとは何ですか？"})
    # MLflow UI: Retriever → LLM → 各ステップの入出力・レイテンシが可視化される
    print(result["result"])
```

3. **mlflow.evaluate() でRAG品質を自動評価する:**
```python
import mlflow
import pandas as pd

# 評価データセット
eval_data = pd.DataFrame({
    "inputs": [
        "Pythonのリストとタプルの違いは？",
        "Dockerとは何ですか？",
        "機械学習のオーバーフィッティングとは？",
    ],
    "ground_truth": [
        "リストはミュータブル（変更可能）でタプルはイミュータブル（変更不可）です...",
        "Dockerはコンテナ化プラットフォームで、アプリケーションを...",
        "オーバーフィッティングとは、モデルが訓練データに過度に適合し...",
    ]
})

def rag_model(input_df):
    """評価対象のRAGモデル"""
    results = []
    for question in input_df["inputs"]:
        # RAGパイプラインを実行
        answer = qa_chain.invoke({"query": question})["result"]
        results.append(answer)
    return pd.DataFrame({"outputs": results})

with mlflow.start_run(run_name="rag-evaluation"):
    results = mlflow.evaluate(
        model=rag_model,
        data=eval_data,
        targets="ground_truth",
        model_type="question-answering",
        evaluators="default",
        extra_metrics=[
            mlflow.metrics.genai.faithfulness(),     # 根拠に忠実か
            mlflow.metrics.genai.answer_relevance(),  # 質問との関連性
            mlflow.metrics.genai.answer_correctness(), # 正解との一致
        ],
    )
    print(f"平均スコア:")
    print(f"  Faithfulness: {results.metrics['faithfulness/v1/mean']:.3f}")
    print(f"  Answer Relevance: {results.metrics['answer_relevance/v1/mean']:.3f}")
```

4. **モデルレジストリでバージョン管理と本番デプロイを管理する:**
```python
import mlflow
from mlflow import MlflowClient

client = MlflowClient()

# モデルをレジストリに登録
with mlflow.start_run():
    # モデルのトレーニング...
    mlflow.sklearn.log_model(
        model,
        "model",
        registered_model_name="customer-churn-predictor"
    )

# バージョンを Staging に移行
model_version = client.get_latest_versions("customer-churn-predictor", stages=["None"])[0]
client.transition_model_version_stage(
    name="customer-churn-predictor",
    version=model_version.version,
    stage="Staging",
)

# テスト後に Production に昇格
client.transition_model_version_stage(
    name="customer-churn-predictor",
    version=model_version.version,
    stage="Production",
)

# REST APIとしてサーブ（ターミナルで実行）
# mlflow models serve -m "models:/customer-churn-predictor/Production" --port 5001
```

---

## セキュリティ観点

### トラッキングサーバーの認証

```bash
# MLflowサーバーの認証設定（v2.5.0以降）
mlflow server \
  --host 0.0.0.0 \
  --port 5000 \
  --app-name basic-auth

# ユーザー管理
mlflow gc  # 管理者アカウントの初期設定

# 本番環境では Databricks Managed MLflow か
# nginx + OAuth2 プロキシを組み合わせることを推奨
```

### アーティファクトと機密データの保護

```python
# モデルアーティファクトに機密情報が含まれる場合
# S3バケットのサーバーサイド暗号化を有効化
import boto3

s3 = boto3.client('s3')
s3.put_bucket_encryption(
    Bucket='mlflow-artifacts',
    ServerSideEncryptionConfiguration={
        'Rules': [{'ApplyServerSideEncryptionByDefault': {'SSEAlgorithm': 'aws:kms'}}]
    }
)
```

### APIキーのログ除外
- LLMの実験追跡では、プロンプトとレスポンスが自動記録されるため、APIキーや個人情報がプロンプトに含まれていないか確認する
- `mlflow.log_artifact()` で保存するファイルに機密情報が含まれないよう注意する
- トラッキングサーバーへのアクセスはRBAC（ロールベースアクセス制御）で最小権限に制限する

---

## ペルソナ設定と使い方

### ペルソナ：岡田 真理（36歳・FinTechスタートアップのMLエンジニア・RAGシステムの品質改善に悩んでいる）

岡田さんは社内の金融レポートQ&AシステムのRAGを担当している。プロンプト・チャンクサイズ・検索件数のパラメータを変えながら実験しているが、「どの組み合わせが最良か」を体系的に比較できず、実験結果がSlackのメモに散らばっていた。

```python
# rag_experiment.py
# RAGパイプラインのパラメータを体系的に実験する

import mlflow
import pandas as pd
from itertools import product
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import Qdrant

mlflow.set_tracking_uri("http://mlflow.company.internal:5000")
mlflow.set_experiment("rag-parameter-search")
mlflow.langchain.autolog()

# 実験パラメータの組み合わせ
PARAMS = {
    "model": ["gpt-4o-mini", "gpt-4o"],
    "temperature": [0.0, 0.1],
    "retriever_k": [3, 5, 8],
    "chunk_size": [300, 500],
}

# 評価データセット
eval_df = pd.read_csv("eval_questions.csv")  # question, ground_truth の2列

for model, temp, k, chunk in product(*PARAMS.values()):
    run_name = f"{model}_t{temp}_k{k}_chunk{chunk}"

    with mlflow.start_run(run_name=run_name):
        mlflow.log_params({
            "model": model,
            "temperature": temp,
            "retriever_k": k,
            "chunk_size": chunk,
        })

        # ベクトルストアを構築（チャンクサイズで再インデックス）
        vectorstore = build_vectorstore(chunk_size=chunk)

        # RAGチェーンを構築
        qa_chain = RetrievalQA.from_chain_type(
            llm=ChatOpenAI(model=model, temperature=temp),
            retriever=vectorstore.as_retriever(search_kwargs={"k": k}),
        )

        # 評価実行
        def evaluate(df):
            return pd.DataFrame({
                "outputs": [qa_chain.invoke({"query": q})["result"] for q in df["inputs"]]
            })

        results = mlflow.evaluate(
            model=evaluate,
            data=eval_df.rename(columns={"question": "inputs", "ground_truth": "ground_truth"}),
            targets="ground_truth",
            model_type="question-answering",
            extra_metrics=[
                mlflow.metrics.genai.faithfulness(),
                mlflow.metrics.genai.answer_relevance(),
            ],
        )

        score = results.metrics.get("answer_relevance/v1/mean", 0)
        mlflow.log_metric("final_score", score)
        print(f"{run_name}: score={score:.3f}")

print("\n実験完了。MLflow UI (http://mlflow.company.internal:5000) で結果を比較してください")
```

**導入前後の変化:**
- 導入前: Slackのメモとスプレッドシートでパラメータ管理 → 「先週のベストの条件が何だったか」を毎回探す時間が30分
- 導入後: MLflowで全実験を自動記録 → UIで32パターンを一覧比較、ベスト条件の特定が1分以内、チームメンバーも同じUIで確認可能

---

## 周辺情報

### 類似・関連プロジェクト

| ツール | 特徴 |
|--------|------|
| Weights & Biases (wandb) | 機械学習向け実験管理SaaS、可視化が豪華 |
| DVC | データバージョン管理、Gitと連携 |
| LangSmith | LangChain製LLMオブザーバビリティ、LLM特化 |
| Comet ML | ML実験管理SaaS |
| Haystack (#12フォルダ) | RAGフレームワーク、MLflowと組み合わせて評価が可能 |

---

## 参考リンク

- [公式リポジトリ](https://github.com/mlflow/mlflow)
- [公式ドキュメント](https://mlflow.org/docs/latest/index.html)
- [LLMトレーシングガイド](https://mlflow.org/docs/latest/llms/tracing/index.html)
- [評価ガイド](https://mlflow.org/docs/latest/llms/llm-evaluate/index.html)
- [Databricks MLflow](https://docs.databricks.com/en/mlflow/index.html)
