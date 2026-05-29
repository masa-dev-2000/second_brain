# Claude Dynamic Workflows

## 基本情報

| 項目 | 内容 |
|------|------|
| 提供元 | Anthropic |
| 発表日 | 2026年5月28日（Claude Opus 4.8と同時） |
| ステータス | Research Preview |
| 対応環境 | Claude Code CLI・Desktop・VS Code拡張・Agent SDK |
| 必要バージョン | Claude Code v2.1.154以降 |
| 対応プラン | Pro（要設定）・Max・Team（デフォルトON）・Enterprise（管理者が有効化） |
| 対応API | Anthropic API・Amazon Bedrock・Google Cloud Vertex AI・Microsoft Azure Foundry |
| 公式ドキュメント | https://code.claude.com/docs/en/workflows |
| 公式ブログ | https://claude.com/blog/introducing-dynamic-workflows-in-claude-code |

---

## 概要

Claude Codeに追加された新しいアジェンティック実行レイヤー。自然言語でタスクを伝えるだけで、ClaudeがJavaScriptのオーケストレーションスクリプトをその場で生成し、専用ランタイムが最大1,000のサブエージェントを並列実行する。

**核心的な革新**: 計画をClaudeのコンテキストに置くのではなく、**コードに移す**。これにより、コンテキストウィンドウを超えたスケールと再現性を実現する。

---

## 通常のサブエージェントとの違い

| 次元 | サブエージェント | スキル（静的） | Dynamic Workflows |
|------|----------------|--------------|------------------|
| 実体 | Claudeが都度生成するワーカー | Claudeが従うMarkdown | ランタイムが実行するJSスクリプト |
| オーケストレーター | Claude（毎ターン） | Claude（Markdownに従う） | **スクリプト自体** |
| 中間結果の場所 | Claudeのコンテキスト | Claudeのコンテキスト | **スクリプト変数（コンテキスト外）** |
| スケール | 数タスク/ターン | 同左 | 最大1,000エージェント/ラン |
| 中断・再開 | ターンをやり直し | 同左 | **セッション内で再開可能** |

---

## 仕組み（技術詳細）

### 実行フロー

1. 自然言語でタスクを伝える（または `workflow` と書く、または `/effort ultracode` に設定）
2. ClaudeがJavaScriptのオーケストレーションスクリプトを生成
3. **専用ランタイム**が会話とは独立した環境でスクリプトを実行
4. スクリプトが並列でサブエージェントを大量スポーン
5. **敵対的検証**: 別エージェントが互いの結論を反証し、収束するまで反復
6. 最終結果だけがClaudeのコンテキストに戻る

### 重要な制約

- **JSスクリプト自体はファイルシステム・シェルに直接アクセス不可**（純粋に指揮のみ）
- ファイル操作・コマンド実行はスクリプトが生んだ**サブエージェント**が担う
- サブエージェントは常に `acceptEdits` モードで動作（親セッション設定に関係なく）
- ツールのallowlistは親セッションを継承

### スペック

| 項目 | 値 |
|------|----|
| 最大同時実行エージェント数 | 16（低CPUマシンはそれ以下） |
| 最大エージェント数/ラン | 1,000 |
| 実行継続時間 | 数時間〜数日 |
| 途中再開 | セッション内は可能（セッション終了でリセット） |

---

## 起動方法

### 1. キーワードトリガー
プロンプトに `workflow` と書くだけ。

```
Run a workflow to audit every API endpoint under src/routes/ for missing auth checks
```

### 2. Ultracodeモード
```
/effort ultracode
```
`xhigh` 推論 + ワークフロー自動オーケストレーションが全タスクに適用される。

### 3. ビルトインコマンド
```
/deep-research <質問>
```
複数角度でWebサーチ → ソース取得 → 敵対的クロスチェック → 引用付きレポート生成

---

## 主な機能

### ビルトインワークフロー: `/deep-research`
公式同梱の唯一のワークフロー。複数角度でWeb検索し、クレームを3票の敵対的投票で検証。通過しなかったクレームを除外した引用付きレポートを返す。

### カスタムワークフローの保存
実行後に `s` を押してスラッシュコマンドとして保存:
- `.claude/workflows/` — プロジェクト共有（リポジトリでチームと共有可能）
- `~/.claude/workflows/` — 個人用（全プロジェクトで利用可能）

### `/workflows` 管理UI
```
/workflows
```
- 実行中・完了済みワークフローの詳細確認
- 各フェーズ・エージェントのプロンプト・ツール呼び出し・結果を確認
- 操作: `p`（一時停止/再開）、`x`（停止）、`r`（エージェント再実行）、`s`（保存）

### 承認フロー
実行前に計画フェーズを表示して確認を求める。オプション:
- 今回だけ実行
- このプロジェクトでは今後確認しない
- スクリプトのソースを確認
- キャンセル

---

## 使うべき3条件（Anthropic公式指針）

1. タスクが1つのコンテキストウィンドウに収まらない
2. 分解戦略が事前にわからない
3. 品質 > トークン節約（ワークフローはトークンを多く消費する）

---

## 無効化

```bash
# 環境変数
CLAUDE_CODE_DISABLE_WORKFLOWS=1

# settings.json
{ "disableWorkflows": true }

# /configで無効化も可能
```

---

## Opus 4.8の価格（同時発表）

| モード | 入力 | 出力 |
|--------|------|------|
| 通常 | $5/Mトークン | $25/Mトークン |
| Fast mode（2.5倍速）| $10/Mトークン | $50/Mトークン（以前より**3倍安く**なった） |

---

## 実績・ユースケース

### Bun: ZigからRustへの全コードベース移行
- **規模**: 約750,000行のRustコード生成、2,188ファイル変更
- **結果**: 元テストスイートの99.8%がパス
- **期間**: 初コミットからマージまで**11日**
- **作者**: Jarred Sumner（Bun JavaScript runtimeの作者）

### 業界別導入実績

| 業界 | 企業 | 成果 |
|------|------|------|
| ソフトウェア開発 | Klarna | デッドコード発見（静的解析では検出不可） |
| 通信・IT | TELUS | $9,000万の成果・50万時間削減・70,000人展開 |
| プロフェッショナルサービス | PwC | 3万人研修・CFOビジネスユニット立ち上げ |
| 法律 | Thomson Reuters | CoCounsel LegalをClaude Agent SDKで再構築 |
| 中小企業 | — | 15の自動化ワークフロー（給与・決算・請求書等） |

### 主なユースケース
- コードベース全体のバグハント・セキュリティ監査
- 500ファイル以上の大規模マイグレーション
- 複数ソースのクロスチェックが必要なリサーチ
- デッドコード・クリーンアップ機会の発見
- APIエンドポイントの認証漏れ監査

---

## 競合比較

| 項目 | Claude Dynamic Workflows | OpenAI Agents SDK | LangGraph | Google ADK |
|------|--------------------------|-------------------|-----------|------------|
| オーケストレーター | **AIが生成したJSスクリプト** | Python handoff | 有向グラフ | 階層ツリー |
| 中間結果 | **スクリプト変数（外部）** | コンテキスト内 | グラフ状態 | フレームワーク状態 |
| セッション跨ぎ継続 | **なし** | なし | **あり**（DB永続化） | Google Cloud |
| モデル縛り | Claude専用 | OpenAI中心 | **非依存** | **非依存** |
| 敵対的検証内蔵 | **あり** | なし | なし | なし |
| ボイラープレート | **ゼロ** | 低〜中 | 高 | 中〜高 |
| マルチモーダル対応 | なし | なし | なし | **あり** |
| オープンソース | 部分的（Agent SDK） | Agent SDK: OSS | MIT | Apache 2.0 |

### Claudeが優位な点
- **ゼロボイラープレート**: 「workflow」と書くだけ
- **敵対的検証が標準搭載**: 他のフレームワークにはない品質保証機構
- **コンテキスト分離**: 中間結果がコンテキストを消費しない
- **セッション中のレスポンシブ性**: バックグラウンド実行で会話が止まらない
- **プロンプトキャッシュコスト**: 90%削減（OpenAIの50%より有利）

### Claudeが劣る点
- **セッション跨ぎの永続化なし**（LangGraphが圧倒的に優位）
- **16並列上限**（極端に並列なワークロードには制約）
- **Claude専用**（LangGraph・CrewAI・AG2はモデル非依存）
- **マルチモーダルオーケストレーション非対応**（Google ADK + Geminiが優位）
- **リサーチプレビュー段階**（本番安定版ではない）

---

## このリポジトリとの関連

このセカンドブレインに収録済みの以下ツールと組み合わせると効果的:

| ツール | 連携方法 |
|--------|----------|
| `LangGraph` | Dynamic Workflowsでコーディング、LangGraphで状態永続化の使い分け |
| `Haystack` | ワークフローが収集したドキュメントをHaystackのRAGパイプラインに投入 |
| `Langfuse` | ワークフロー実行のコスト・トレーシング可視化 |
| `LiteLLM` | コスト最適化のためのプロバイダールーティング |
| `khoj` / `LightRAG` | ワークフローの調査結果をRAGナレッジベースに蓄積 |

---

## 参考リンク

- [公式ドキュメント](https://code.claude.com/docs/en/workflows)
- [公式ブログ](https://claude.com/blog/introducing-dynamic-workflows-in-claude-code)
- [TechCrunch: Opus 4.8リリース記事](https://techcrunch.com/2026/05/28/anthropic-releases-opus-4-8-with-new-dynamic-workflow-tool/)
- [MarkTechPost: 1,000サブエージェント上限の詳細](https://www.marktechpost.com/2026/05/28/anthropic-ships-claude-opus-4-8-alongside-dynamic-workflows-and-cheaper-fast-mode-with-workflows-capped-at-1000-subagents/)
- [競合比較: LangGraph vs Claude Code](https://www.lowcode.agency/blog/claude-code-vs-langgraph)
- [競合比較: Claude vs OpenAI vs Google ADK](https://composio.dev/content/claude-agents-sdk-vs-openai-agents-sdk-vs-google-adk)

---

*調査日: 2026/05/29 — 5エージェント並列調査・敵対的クロスチェック済み*
