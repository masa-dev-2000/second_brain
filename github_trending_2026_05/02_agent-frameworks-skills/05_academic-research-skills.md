# Imbad0202/academic-research-skills

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [Imbad0202/academic-research-skills](https://github.com/Imbad0202/academic-research-skills) |
| 言語 | Python |
| 総スター数 | 18,137 |
| 本日のスター | +2,502 |
| ライセンス | MIT |
| トレンド順位 | #14（2026/05/22） |
| カテゴリ | エージェントフレームワーク / 学術研究支援 |

---

## 概要

文献調査→論文執筆→査読対応→改訂→最終化の研究パイプライン全体をサポートするClaude Codeスキル集。Semantic Scholar・CrossrefのAPIで引用を自動検証し、7エージェントによる多視点査読システムを内蔵する。

「AIは副操縦士、主導権は人間」というポリシーを明示し、自律モードでの完全自動化を意図的に禁止している。AIの研究論文でよくある失敗（引用捏造・フレームロック・実装バグ）を人間の確認ゲートで防ぐ設計。

---

## 10ステージパイプライン

| ステージ | 内容 |
|---------|------|
| 1. 研究計画 | ソクラテス式対話で研究課題・方法論を整理 |
| 2. 文献調査 | Semantic Scholar APIで関連論文を収集・整理 |
| 3. 引用検証 | CrossrefでDOI確認、架空の参照文献を検出 |
| 4. 執筆計画 | 章構成・論点の整理 |
| 5. 執筆支援 | 対話形式で各章を構築 |
| 6. 多視点査読 | 7エージェントが0〜100点で採点 |
| 7. 改訂対応 | 査読コメントへの反論案・修正案を生成 |
| 8. 整合性確認 | 全体の論理的一貫性をチェック |
| 9. 最終チェック | 投稿要件への準拠を確認 |
| 10. ジャーナル選択 | インパクトファクター・スコープを考慮した投稿先候補を提示 |

---

## 7エージェント査読システム

| エージェント | 役割 | 採点観点 |
|-------------|------|---------|
| Methodologist | 研究方法論の妥当性 | サンプルサイズ・統計手法 |
| Domain Expert | 専門知識の正確さ | 先行研究との整合性 |
| Statistician | 統計解析の正確さ | p値・信頼区間の妥当性 |
| Devil's Advocate | 反論・弱点の洗い出し | 代替仮説・限界の明示 |
| Writing Quality | 論文の文章品質 | 明確さ・構造・英語品質 |
| Ethics Reviewer | 研究倫理の確認 | IRB・データプライバシー |
| Impact Evaluator | 研究の意義・インパクト | 新規性・社会的重要性 |

---

## あるとないとの違い

| 観点 | ない場合 | ある場合 |
|------|----------|----------|
| 引用の正確性 | AIが架空の論文を引用する（よくある問題） | Semantic Scholar + Crossref APIで実在を確認 |
| 査読対応 | 一人で反論案を考える | 7視点から自動評価＋具体的な反論文を生成 |
| 研究課題の整理 | 漠然とした問いのまま進む | ソクラテス式対話で明確な研究問いに整理 |
| 完全自動化 | AIが勝手に決定 | 各重要ステップで人間の確認を求める |

---

## 環境構築方法

### 前提条件
- Claude Code インストール済み
- Python 3.10以上（API検証スクリプト実行用）
- オプション: Semantic Scholar API キー（無料）

### インストール手順
```bash
# Claude Codeプラグインとしてインストール
/plugin install academic-research@claude-plugins-official

# または手動インストール
git clone https://github.com/Imbad0202/academic-research-skills
cd academic-research-skills
pip install -r requirements.txt  # Semantic Scholar・Crossref連携用
```

### API設定（オプション）
```bash
# Semantic Scholar API（無料・レート制限なし）
export SEMANTIC_SCHOLAR_API_KEY=""  # 空でも動作するが速度制限あり

# Crossref（認証なし・無料）
# → 設定不要
```

### 動作確認
```bash
# Claude Codeで
/research-guide "機械学習を使った医療診断の研究を計画したい"
# → ソクラテス式対話が始まれば成功
```

---

## ベストプラクティス

1. **研究計画から始める（スキップしない）:**
```
/research-guide "自然言語処理を使った感情分析の研究"
→ "研究対象はテキストのみ？音声も含む？
   既存手法との比較はするか？
   使用するデータセットは？ラベリングは？"
→ これらの問いに答えることで研究が具体化される
```

2. **引用は必ず検証する:**
```python
# AIが提示した参考文献を検証
/verify-citations references.bib
# → 実在しない論文: 3件 と表示された場合は必ず除去
```

3. **査読は最後ではなく途中でも行う:**
```
/peer-review-section "3. 研究手法" --agents methodologist,statistician
# → 章単位で早期にフィードバックを得る
```

4. **Devil's Advocateの指摘は必ず対処する:**
```
# 見落としがちな弱点を先に把握して論文を強化
/review --agent devils-advocate
→ "この研究の最大の弱点は..."という反論を先取りして対策
```

5. **完全自動モードを有効にしない:**
```
# このスキルはautonomous modeを意図的にサポートしない
# 各ステージの完了後に必ず確認を取る
```

---

## セキュリティ観点

### 研究データのプライバシー
- 未発表の研究データ・実験結果をClaude APIに送信することになる
- **対策:** Anthropic Enterpriseプランでデータ処理合意書（DPA）を締結する
- または完全ローカルのLLM（oh-my-pi + Ollama）と組み合わせる

### 引用検証の限界
```python
# Semantic Scholar / Crossref で見つからなくても存在する可能性
# → 特にグレイリテラチャー・会議録・プレプリント
# 判断は最終的に研究者自身が行う
```

### 著作権・利用規約
- 論文の全文テキストをAIに入力する場合、各出版社のAI学習への利用規約を確認する
- 抄録・タイトル・DOIの使用は通常問題ない

---

## ペルソナ設定と使い方

### ペルソナ：Kim Seo-yeon（28歳・博士課程2年・自然言語処理専攻）

Kimさんは初めての国際会議論文を執筆中。英語が第二言語で、引用の管理・査読対応が不安だった。特に「AIを使ったら引用が全部架空のURLだった」という先輩の失敗談を聞いて慎重になっていた。

```bash
# 1. 研究計画フェーズ（1日目）
/research-guide "低リソース言語の感情分析におけるZero-shot学習の効果"
→ ソクラテス式対話で研究課題が明確に整理される

# 2. 文献収集（2〜3日目）
/literature-search "zero-shot sentiment analysis low-resource languages"
→ 関連論文100件を自動収集・整理

# 3. 引用検証（執筆前）
/verify-citations my_bibliography.bib
→ "実在しない参照: 0件 / DOI確認済み: 47件" と表示
→ Kimさん: 「架空引用の心配がなくなった！」

# 4. 査読シミュレーション（投稿前）
/peer-review --all-agents paper_draft.pdf
→ 7エージェントの採点結果:
   Methodologist: 78/100 「サンプルサイズの正当化が弱い」
   Devil's Advocate: 65/100 「なぜMultilingualBERTではなくmT5なのか説明が必要」
   ...

# 5. 改訂対応
/revise-response "なぜmT5を選んだのか説明が必要"
→ 説得力のある反論・追実験の提案

# 結果: 国際会議ACL-2026に採択
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| Elicit | AI文献調査ツール（Webサービス） |
| ResearchRabbit | 文献マップ可視化 |
| notebooklm-py (#10) | Google NotebookLMをプログラムから使う |
| Semantic Scholar API | 引用検証に使用するバックエンド |

---

## 参考リンク

- [公式リポジトリ](https://github.com/Imbad0202/academic-research-skills)
- [Semantic Scholar API](https://api.semanticscholar.org/)
- [Crossref API](https://www.crossref.org/documentation/retrieve-metadata/rest-api/)
