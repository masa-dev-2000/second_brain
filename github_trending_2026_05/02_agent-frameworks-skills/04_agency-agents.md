# msitarzewski/agency-agents

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) |
| 言語 | Shell（Markdownベースのエージェント定義） |
| 総スター数 | 103,646 |
| 本日のスター | +990 |
| ライセンス | MIT |
| トレンド順位 | #17（2026/05/22） |
| カテゴリ | エージェントフレームワーク / 専門エージェント集 |

---

## 概要

144以上の専門AIエージェント人格を収録したオープンソースコレクション。フロントエンド開発者・セキュリティエンジニア・SNSマーケター・ゲームデザイナーなど12部門にわたる役割ごとのエージェント定義をMarkdownで提供する。

各エージェントは固有の特徴・実証済みのワークフロー・測定可能な成果物を持ち、Claude Code・Cursor・GitHub Copilot CLI等と即座に統合できる。

---

## 12の部門と主要エージェント

| 部門 | 主なエージェント |
|------|----------------|
| **Engineering** | Frontend Dev, Backend Architect, Mobile Dev, AI Engineer, DevOps, Security Engineer |
| **Design** | UI/UX Designer, Brand Strategist, Inclusive Design Specialist |
| **Sales** | Outbound Specialist, Account Executive, SDR |
| **Marketing** | Content Creator, SEO Strategist, Growth Hacker, Social Media Manager |
| **Product** | Product Manager, UX Researcher, Data Analyst |
| **Finance** | Financial Analyst, Operations Manager |
| **Game Dev** | Game Designer, Unity Developer, Narrative Designer |
| **Testing** | QA Engineer, Security Tester, Performance Engineer |
| **Support** | Customer Success, Technical Support |
| **Spatial Computing** | AR/VR Developer, Spatial Designer |
| **Management** | Senior PM, Reality Checker, Evidence Collector |
| **Admin** | Executive Assistant, Research Analyst |

---

## あるとないとの違い

| 観点 | ない場合（汎用AI） | ある場合（専門エージェント） |
|------|------------------|---------------------------|
| Reactパフォーマンス最適化 | 一般的なアドバイス | Frontend Devエージェント: 具体的なコード分割・メモ化・バンドル分析まで実施 |
| SEO改善 | 「キーワードを最適化しましょう」 | SEO Strategistエージェント: 技術SEO監査→structured data→内部リンク設計まで実施 |
| セキュリティレビュー | 「XSSに気をつけましょう」 | Security Engineerエージェント: OWASP Top10に対応した詳細なレビューと修正 |

---

## 環境構築方法

### 前提条件
- Claude Code / Cursor / GitHub Copilot CLI のいずれか

### インストール手順
```bash
# Claude Codeプラグインとしてインストール
/plugin install agency-agents@claude-plugins-official

# または手動でクローン
git clone https://github.com/msitarzewski/agency-agents
cd agency-agents

# 他ツール用の変換スクリプトを実行
./scripts/convert-to-cursor.sh    # Cursor用 .cursorrules 生成
./scripts/convert-to-copilot.sh   # GitHub Copilot用
./scripts/convert-to-aider.sh     # Aider用
```

### 単一エージェントの適用
```bash
# プロジェクトに特定のエージェントを配置
cp agents/engineering/frontend-developer.md CLAUDE.md

# または Claude Codeで指定
claude --agent frontend-developer "このReactコンポーネントを最適化して"
```

### チーム全体でのエージェント配置
```bash
# .claude/agents/ ディレクトリに配置
mkdir -p .claude/agents
cp agents/engineering/*.md .claude/agents/
cp agents/design/*.md .claude/agents/
```

### 動作確認
```bash
claude "フロントエンド開発者として、このコンポーネントをレビューして"
# → Frontend Developerエージェントの人格でレビューが返ってくるかを確認
```

---

## ベストプラクティス

### 複数エージェントの協調
```bash
# スタートアップMVP開発（4エージェント並列）
claude --agent frontend-developer "UI実装"
claude --agent backend-architect "API設計"
claude --agent growth-hacker "SEO・アナリティクス設定"
claude --agent reality-checker "実現可能性の検証"
```

### 適切なエージェントの選び方
1. **タスクの専門領域を特定:** コーディング？マーケティング？分析？
2. **結果の期待値を確認:** 各エージェントのREADMEに「成果物」が明記されている
3. **Reality Checkerを最後に必ず通す:** 他のエージェントの提案の実現可能性を検証

### エージェントのカスタマイズ
```markdown
<!-- agents/engineering/frontend-developer.md に追記 -->
## プロジェクト固有の制約
- スタイリングはTailwind CSS v4のみ使用
- コンポーネントはShadcn/uiをベースにする
- テストはVitest + Testing Libraryを使用
```

### チームでの活用例
```
週次スプリントレビュー:
1. Senior PMエージェント → スプリントの優先度確認
2. Backend Architectエージェント → 技術的負債の評価
3. Reality Checkerエージェント → 見積もりの妥当性検証
```

---

## セキュリティ観点

### エージェント定義の信頼性
- 各Markdownファイルの内容がAIの動作を直接制御するため、信頼できるソースのエージェント定義のみを使用する
- コミュニティ投稿のエージェントはコードレビューと同様に内容を確認する

### Security Engineerエージェントの活用
```
"Security Engineerとして、このAPIのコードをOWASP Top10の観点でレビューして"
→ 脆弱性の特定と修正提案を専門的な視点で実施
```

### 権限の最小化
```
# エージェントに与える権限を明示的に制限
"Frontend Developerとして、src/components/ ディレクトリ内のファイルのみ変更して"
```

---

## ペルソナ設定と使い方

### ペルソナ：小野 浩二（31歳・個人SaaS開発者・デザイナー不在・マーケ未経験）

小野さんは1人でSaaSを開発・運営しているが、エンジニアとしての強みはあるもののデザインとマーケティングが弱点。専門家を雇う予算はないが、これらの課題を解決したかった。

```bash
# インストール後、複数の専門エージェントを状況に応じて使い分ける

# ランディングページの改善（以前はエンジニア目線のレイアウトしか思い浮かばなかった）
claude --agent ux-designer "このLPのユーザー体験を改善して。
                             特にCTAの位置とコピーを見直して"
→ UXエージェントが「情報の階層・視線誘導・CTA最適化」の観点で具体的な改善案を提示

# SEO対策（全くわからなかった）
claude --agent seo-strategist "このブログ記事のSEOを改善して"
→ SEOエージェントがメタタグ・構造化データ・内部リンク・ページ速度を実施可能な形で指示

# セキュリティレビュー（気になってたけど後回しにしてた）
claude --agent security-engineer "このAPIエンドポイントのセキュリティをレビューして"
→ Securityエージェントが認証・認可・入力検証・ログの観点で詳細レビュー

# 1人でエンジニア+デザイナー+マーケター+セキュリティエンジニアの視点を持てるようになった
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| superpowers (#5) | ワークフロー強制（役割ではなくプロセスの定義） |
| marketingskills (#36) | マーケティング特化のスキル集 |
| awesome-prompts | 汎用プロンプトコレクション（エージェント形式ではない） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/msitarzewski/agency-agents)
