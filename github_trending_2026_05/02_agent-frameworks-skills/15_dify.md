# Dify

## 基本情報

| 項目 | 内容 |
|------|------|
| GitHub | `langgenius/dify` |
| スター | ★143,000（GitHub全体51位） |
| ライセンス | Apache 2.0 + 商用制限（実質ソースアベイラブル） |
| 最新バージョン | v1.14.2（2026/05） |
| 調達額 | $3,000万 Series Pre-A（2026/03、評価額$1.8億） |
| 主要投資家 | HSG・GL Ventures・5Y Capital |
| 2025年ARR | $310万（28人チーム） |
| 導入企業 | 280社超（Maersk・Novartis・ETS等）、175カ国140万インスタンス |
| 日本展開 | CTC（伊藤忠テクノソリューションズ）が2025/10にDify Enterpriseを提供開始 |
| 公式サイト | https://dify.ai |
| 公式ドキュメント | https://docs.dify.ai |

---

## 一言で言うと

**「LLMアプリをノーコード〜ローコードで作って即APIとして使えるフルスタックプラットフォーム」**

RAG・ワークフロー・エージェント・観測性が一体になっている。非エンジニアでも動かせるが、Pythonコードも書ける。

---

## 今できること

### 作れるアプリの種類（5種）

| 種別 | 用途 |
|------|------|
| **Chatbot** | シンプルな多ターン会話 |
| **Agent** | ツール使用・自律推論（ReAct/Function Calling） |
| **Text Generator** | 一問一答型（要約・翻訳・生成） |
| **Workflow** | 複数ステップの自動パイプライン（バッチ処理向き） |
| **Chatflow** | 会話ターンごとにワークフローを実行（会話×自動化） |

---

### ビジュアルワークフロービルダー

ドラッグ&ドロップのDAGキャンバス。14種以上のノードが使える。

| ノード | 役割 |
|--------|------|
| LLM | モデルを呼び出す |
| Knowledge Retrieval | RAGで知識ベースを検索 |
| Question Classifier | 意図分類・ルーティング（コード不要） |
| HTTP Request | 外部APIを呼ぶ |
| Code | Python/JavaScriptをインラインで実行 |
| Condition（If/Else） | 条件分岐 |
| Loop / Iteration | 配列処理・バッチ処理 |
| Agent Node | 自律サブエージェントをノードとして埋め込む |
| **Human Input** | ワークフローを途中で止めて人間のレビューを挟む（v1.13〜） |
| Template / Variable Aggregator | データ変換 |
| Doc Extractor | ファイル解析 |
| Trigger | 外部イベント（GitHub PR・Jiraチケット等）で起動（v1.14〜） |

**v1.14.0〜**: 複数人がリアルタイムで同じワークフローを同時編集可能（カーソル・存在表示付き）

---

### RAG / ナレッジベース

| 機能 | 内容 |
|------|------|
| 対応フォーマット | PDF・Word・PowerPoint・HTML・CSV・Markdown等 |
| チャンク戦略 | 固定サイズ・段落・Q&A方式など選択可 |
| 検索方式 | ベクター検索・BM25全文検索・**ハイブリッド**（重み調整可） |
| リランキング | Cohere Rerank・BGE等 |
| 対応ベクターDB | Qdrant・Weaviate・Milvus・pgvector・OpenSearch等**30種以上** |
| マルチモーダルRAG | テキスト＋画像を統合インデックスで検索 |
| Agentic RAG | エージェントが自律的にRAGするかどうかを判断 |

---

### 対応モデル（100種以上）

OpenAI（GPT-4o・o1・o3）、Anthropic（Claude）、Google（Gemini）、DeepSeek、Mistral、Llama、Qwen、Azure OpenAI、SiliconFlow、Ollama（ローカル）、LM Studio、vLLM、OpenRouter、OpenAI互換エンドポイント全般。

5種類のモデルタイプに対応：LLM・Embedding・Rerank・Speech2Text・Text2Speech

---

### プラグインシステム（v1.0.0〜、2025/02）

公式Marketplaceに**120以上**のプラグイン。

| カテゴリ | 例 |
|----------|-----|
| モデル | 新しいモデルプロバイダーを追加 |
| ツール | Google Search・DALL-E・WolframAlpha・Stable Diffusion等 |
| エージェント戦略 | ReAct・CoT・ToT・カスタム推論ロジック |
| データソース | カスタムナレッジベースコネクタ |
| トリガー | イベントベースのワークフロー起動 |

---

### MCP双方向対応（v1.6.0〜）

- **MCPクライアント**: DifyのエージェントがGitHub・Slack・DB等の外部MCPサーバーをツールとして使える
- **MCPサーバー**: DifyのワークフローをMCPツールとして外部エージェントに公開できる

---

### LLMOps・観測性

- 全実行ログ（入力・出力・トークン数・レイテンシ・コスト）
- アノテーション（本番出力を手動修正してデータセット化）
- 外部連携: **Langfuse・LangSmith・Arize Phoenix・Opik**
- マルチクレデンシャル: プロバイダーごとに複数APIキー、自動フェイルオーバー
- AI支援プロンプト最適化: LLMノードのプロンプトを自動改善

---

### Human-in-the-Loop（v1.13〜）

ワークフローの途中で人間のレビュー・承認を挟める。
- カスタムボタン（承認・却下・エスカレート）でその後のルーティングが変わる
- Webapp・メールで通知
- Service API経由での外部システムからのレジューム対応（v1.14〜）

---

### デプロイ方法

| 方法 | 内容 |
|------|------|
| **Dify Cloud** | SaaS（Sandbox無料・Professional $59/月・Team $159/月・Enterprise 応相談） |
| **自己ホスト（OSS）** | Docker Compose、無料、最小2コア/4GBメモリ |
| **自己ホスト（Enterprise）** | 商用ライセンス・マルチテナント・SSO・監査ログ・SOC 2 Type II |
| **AWS Marketplace** | 年間約$15万〜 |
| **Azure Marketplace** | 2025/07〜 |
| **Kubernetes** | 公式Helm Chartsあり |

---

## 今できないこと（限界・弱点）

### パフォーマンス
- スループット上限が低い（8コア/16GB環境でモデル込み**約6req/s**）
- 大規模本番ではKubernetes必須（Docker Composeは開発用）
- Embeddingパイプラインが逐次実行でレート制限ヒット時は**ゼロから再起動**

### ワークフロー
- **ループノードのバグが複数**（終了条件が無視される・ループ変数がリセットされる等）
- ワークフロー失敗時に**チェックポイントから再開不可**（全ステップやり直し）
- n8nのような**特定ノードの出力を固定してそこから再テスト**が不可
- 変数の最大サイズが**200KB**（クラウド版はさらに低い）
- ノード間の構造化データが**1階層まで**しかサポートされない

### RAG
- 複雑なレイアウトのPDF（表・図・画像）の解析が弱い
- 専門ドメインでのデフォルト設定による検索精度が低い
- 5,000ファイル超の知識ベースはインデックス切り替え時に不安定

### エージェント
- 複数エージェントの出力をマージする仕組みが未整備
- エージェント間の階層的オーケストレーションが弱い
- ReAct戦略がGemini 2.0で動作しない等のモデル互換性問題

### コードノード（サンドボックス）
- ファイルI/O・HTTP・OSコール不可
- ネスト深さ最大5階層
- `print()`・ログが画面に表示されない

### ライセンス（重要）
- Apache 2.0だが**商用制限あり**（実質ソースアベイラブル）
- **マルチテナントSaaSとしてDifyを使う場合は商用ライセンスが必要**（無許可禁止）
- ロゴ・著作権表示の変更不可

### セキュリティ（2025年に複数の重大CVE）

| CVE | 深刻度 | 内容 |
|-----|--------|------|
| CVE-2025-55182 | Critical | サーバーサイドデータ漏洩 |
| CVE-2025-55184 | Critical | コンポーネント間データ漏洩 |
| CVE-2025-67779 | Critical | 安全でない状態再利用 |
| CVE-2025-32796 | High | 非管理者がアプリ編集可能 |
| CVE-2025-43862 | High | アクセス制御バイパスでDSL export可能 |
| CVE-2025-58747 | Medium | MCP OAuthでXSS |

→ v1.11.1以降へのアップデート必須

### その他
- モバイル・デスクトップアプリなし
- CI/CDやGitスタイルのブランチ管理なし（publish/rollbackのみ）
- 自己ホストのセットアップが複雑（環境変数100以上の手動設定）
- $59/月の有料プランでもサポートが薄い（「ドキュメントを読め」系の対応）

---

## 将来できそうなこと（ロードマップ）

### Dify 2.0（ベータ版：2025/09〜）

#### Knowledge Pipeline（RAG 2.0）
- ドキュメント取り込みをノードベースのビジュアルパイプラインで設計
- Q&Aプロセッサ・画像抽出・チャンク戦略をモジュールで組み合わせ
- **計画中**: マルチモーダルEmbedding・ナレッジ取り込み時のHuman-in-the-Loop・エンタープライズデータガバナンス

#### Queue-based Graph Engine（ワークフロー実行エンジン全面書き直し）
- 依存関係を考慮したスケジューリング（並列ブランチが最長ブランチと同じ時間で完了）
- 任意ノードから実行開始、途中からの再開
- `GraphEngineLayer` プラグインで外部監視ツールを接続
- **計画中**: ビジュアルデバッグUI・サブグラフ/ネストワークフロー・インテリジェントスケジューリング

### 公式ロードマップ（明示的に計画中）

| 項目 | 状況 |
|------|------|
| マルチモーダルEmbedding | 計画中（公式発表） |
| サブグラフ・ネストワークフロー | 計画中 |
| Knowledge Pipelineのビジュアルデバッグ | 計画中 |
| エンタープライズデータガバナンス | 計画中 |
| 高度なエージェント能力 | $3,000万調達の主要用途（2026年中） |
| FastAPI移行（Flask→FastAPI） | 長期技術ロードマップ |

### 戦略的方向性
- **「ワークフローをチームの資産に」**: Creator Center・Template Marketplaceでワークフローを共有・販売できるエコシステム構築
- **「人とエージェントで組織を動かす」**: 個人ツールではなく組織インフラとしての位置づけ
- 2026年に専任エンタープライズチーム発足

---

## 競合との使い分け

| ツール | 一言ポジション | Difyとの使い分け |
|--------|--------------|----------------|
| **n8n** | SaaS連携自動化の王者（400+統合） | **n8nで起点→DifyのAPIでLLM処理**が人気パターン |
| **Flowise** | LangChain視覚化（Workdayが2025/08買収） | LangChain既存ユーザー・完全MITライセンスが必要な場合 |
| **LangFlow** | LangChainのビジュアルエディタ（DataStax） | プロトタイプ→コード移行のエンジニア向け |
| **Coze** | ノーコードBot（ByteDance、2025/07にOSS化） | Discord/WhatsApp等への能動的BotはCozeが優位 |
| **Vertex AI** | GCP完全マネージド（HIPAA準拠） | GCP企業の大規模ML基盤にはVertex AI |

**Difyが最も輝く場面**: RAG内蔵のAIチャットボット・社内ナレッジ検索・APIとして提供するAIアプリを、コードをあまり書かずに作りたいとき

---

## 判断フレームワーク

- AIアプリ（チャットBot・RAG・社内コパイロット）を素早く作りたい → **Dify一択**
- SaaSツール間の業務自動化にAIを組み込みたい → **n8n（DifyをAPI呼び出し）**
- LangChainを視覚的に操作したい → **Flowise / LangFlow**
- 完全エアギャップ・Apache 2.0が必須 → **Flowise**（Workday買収後の方向性要注意）
- Discord/WhatsApp等の多チャネルBotをゼロコードで → **Coze**
- GCP企業でHIPAA/ISO準拠が必須 → **Vertex AI**

---

## 参考リンク

- [公式ドキュメント](https://docs.dify.ai)
- [GitHub](https://github.com/langgenius/dify)
- [Plugin Marketplace](https://marketplace.dify.ai)
- [v1.0.0: プラグインエコシステム](https://dify.ai/blog/dify-v1-0-building-a-vibrant-plugin-ecosystem)
- [v1.6.0: MCP双方向対応](https://dify.ai/blog/v1-6-0-built-in-two-way-mcp-support)
- [v1.14.1: リアルタイム協同編集](https://dify.ai/blog/dify-1.14.1-workflows-become-a-team-asset)
- [$3,000万調達発表](https://dify.ai/blog/dify-raises-30m-tomorrow-s-organizations-will-be-built-by-people-and-agents)
- [競合比較: Dify vs n8n vs Flowise](https://blog.api2o.com/en/blog/2025/03-05-lowcode-platform-compare-dify-n8n-flowise)
- [CVE情報](https://www.cvedetails.com/product/178248/Langgenius-Dify.html)

---

*調査日: 2026/05/29 — 5エージェント並列調査・敵対的クロスチェック済み*
