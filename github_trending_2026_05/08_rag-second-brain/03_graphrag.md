# microsoft/graphrag

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [microsoft/graphrag](https://github.com/microsoft/graphrag) |
| 言語 | Python |
| 総スター数 | 33,149 |
| ライセンス | MIT |
| カテゴリ | RAG・セカンドブレイン / グラフベースRAGシステム |

---

## 概要

MicrosoftのAI研究チームが発表したグラフベースRAGシステム。テキストコーパスからエンティティと関係を抽出し、コミュニティ検出アルゴリズムでクラスター化することで、大規模な文書コーパス全体を俯瞰する「グローバルな質問」に答えることができる。

LightRAGより重厚だが、「この企業文書全体を通じたテーマは何か」「このレポート群に共通するリスクは？」といった全体像把握型のクエリに特に強い。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **コミュニティ検出** | エンティティをクラスター化して階層的な構造を把握 |
| **グローバルサーチ** | コーパス全体の俯瞰的な質問に対応 |
| **ローカルサーチ** | 特定エンティティ周辺の詳細検索 |
| **ドリフト検索** | 質問を探索的に展開して深堀り |
| **プロンプトチューニング** | ドメイン固有のグラフ構築プロンプトをAIが自動チューニング |

---

## あるとないとの違い

| 観点 | 通常のRAG | GraphRAG |
|------|----------|---------|
| 「全体的なテーマは？」 | × 局所的な回答しかできない | ○ コミュニティ構造から全体像を把握 |
| 大規模コーパス（数千ドキュメント） | △ 精度が落ちやすい | ○ 階層的構造で整理されている |
| 処理コスト | 低い | 高い（インデックス構築にAPIコストがかかる） |
| セットアップの簡単さ | 容易 | 設定が複雑 |

---

## 環境構築方法

### インストール
```bash
pip install graphrag

# または開発版
git clone https://github.com/microsoft/graphrag
cd graphrag
pip install -e .
```

### プロジェクト初期化
```bash
# ドキュメントを配置
mkdir -p ./ragtest/input
cp *.txt ./ragtest/input/

# 設定ファイルを初期化
graphrag init --root ./ragtest

# → ./ragtest/settings.yaml が生成される
```

### settings.yamlの設定
```yaml
# ./ragtest/settings.yaml
llm:
  api_key: ${GRAPHRAG_API_KEY}
  type: openai_chat
  model: gpt-4o-mini

embeddings:
  llm:
    api_key: ${GRAPHRAG_API_KEY}
    type: openai_embedding
    model: text-embedding-3-small
```

### インデックス構築
```bash
export GRAPHRAG_API_KEY=sk-...

# インデックスの構築（時間とAPIコストがかかる）
graphrag index --root ./ragtest

# → ./ragtest/output/ にグラフデータが生成される
```

### 動作確認
```bash
# グローバル検索（全体俯瞰）
graphrag query --root ./ragtest --method global "主要なテーマは何ですか？"

# ローカル検索（特定エンティティ）
graphrag query --root ./ragtest --method local "XXX社の戦略は？"
```

---

## ベストプラクティス

1. **コスト見積もりを先に行う:**
```bash
# インデックス構築前にコスト推定
graphrag index --root ./ragtest --dry-run

# → 使用トークン数と推定コストが表示される
# 大規模コーパスでは数十ドルかかることがある
# まず小さいサブセットで試すことを推奨
```

2. **プロンプトチューニングでドメイン適応:**
```bash
# ドメイン固有のプロンプトをAIが自動生成
graphrag prompt-tune --root ./ragtest --domain "製薬業界の競合分析"

# → ドメイン用語を理解したグラフ構築プロンプトが生成される
# 医療・法務・技術など専門分野で精度が向上
```

3. **用途に応じて検索モードを使い分ける:**
```python
from graphrag.api import search

# グローバル: 「全体を通じて何が言えるか」
result = await search(
    config_filepath="./ragtest/settings.yaml",
    data_dir="./ragtest/output",
    root_dir="./ragtest",
    community_level=2,
    response_type="Multiple Paragraphs",
    query="このコーパス全体を通じた主要な洞察は？",
    search_type="global",
)

# ローカル: 「特定のトピックについて詳しく」
result = await search(
    ...
    query="A社のM&A戦略について詳しく教えて",
    search_type="local",
)
```

4. **Drift検索で探索的に深堀り:**
```python
# 最初の質問から派生する質問を自動生成して深掘り
result = await search(
    ...
    query="業界の将来動向は？",
    search_type="drift",  # 関連する疑問を自動展開
)
```

---

## セキュリティ観点

### APIコストの管理
```bash
# 意図しない大量APIコールを防ぐ
# settings.yaml でレート制限を設定
llm:
  requests_per_minute: 10
  tokens_per_minute: 80000

# 本番運用前に必ず --dry-run でコストを確認
graphrag index --root ./ragtest --dry-run
```

### 機密文書の取り扱い
- GraphRAGはインデックス構築時に全文をOpenAI APIに送信する
- 機密情報を含む場合はAzure OpenAIのプライベートエンドポイントを使用する
```yaml
# settings.yaml でAzure OpenAI を使用
llm:
  type: azure_openai_chat
  api_base: https://your-resource.openai.azure.com/
  api_version: "2024-02-01"
```

---

## ペルソナ設定と使い方

### ペルソナ：浜田 恵子（48歳・M&Aアドバイザー・数百本のデューデリジェンス文書を分析）

浜田さんはM&A案件で対象企業の数百本の社内文書・契約書・財務資料を分析する。「この会社の潜在的なリスクは何か」「主要な取引先との依存関係は？」という全体俯瞰の質問に答えるのに数日かかっていた。

```bash
# デューデリジェンス文書をGraphRAGに投入
mkdir -p ./dd_analysis/input
cp due_diligence_docs/*.txt ./dd_analysis/input/

graphrag init --root ./dd_analysis
# settings.yaml を設定（Azure OpenAI推奨・機密情報のため）

graphrag index --root ./dd_analysis

# 全体俯瞰の質問
graphrag query --root ./dd_analysis --method global \
  "この会社の主要なリスク要因は何か？"

# → 法務・財務・事業の各文書を横断した包括的なリスク分析が生成

graphrag query --root ./dd_analysis --method local \
  "主要サプライヤーへの依存リスクを詳しく教えて"

# 効果:
# 数百本の文書を読むのに必要だった1週間 → 重要論点の把握に1日
# チームへのブリーフィング資料の骨格を自動生成
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| LightRAG (#02) | より軽量・高速・低コスト（GraphRAGの簡易版に近い） |
| RAGFlow | RAGエンジン（グラフ機能なし） |
| Neo4j GraphRAG | Neo4jが提供するGraphRAG Python SDK |

---

## 参考リンク

- [公式リポジトリ](https://github.com/microsoft/graphrag)
- [論文](https://arxiv.org/abs/2404.16130)
- [公式ドキュメント](https://microsoft.github.io/graphrag/)
