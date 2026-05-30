# INIT: 営業提案資料自動生成システム

以下の指示をすべて実行して、プロジェクトの土台ファイルを作成してください。
各ファイルの内容は指示通りに作成し、完了後にファイル一覧を報告してください。

---

## 作成するファイル一覧

1. `CLAUDE.md`
2. `.claude/commands/research.md`
3. `.claude/commands/propose.md`
4. `.claude/commands/review.md`
5. `agent.md`
6. `prompts/research_prompt.md`
7. `prompts/propose_prompt.md`
8. `prompts/review_prompt.md`
9. `output/.gitkeep`

---

## ファイル1: CLAUDE.md

以下の内容で `CLAUDE.md` を作成してください：

```markdown
# 営業提案資料自動生成システム

## プロジェクトの目的

問い合わせフォームに届いた「会社名」と「やりたいこと（ざっくり）」を入力として受け取り、
Web リサーチ → 解釈生成 → 提案スライド作成 → 人間レビュー → 完成 という流れを自動化する。

最終的にアシスタントが面談前に持っていける Reveal.js スライド（HTML）を出力する。

---

## システムフロー

```
INPUT
  会社名 + やりたいこと（自由テキスト）
      ↓
PHASE 1: リサーチ
  Jina AI で会社・業界・課題をWeb検索
  結果を JSON で構造化
      ↓
PHASE 2: 解釈生成
  Claude API で要望の解釈を3パターン生成
  （最小構成 / 標準 / 拡張）
      ↓
PHASE 3: 提案スライド生成
  各パターンの実現可能性・予算・スケジュール・ヒアリング質問を展開
  Reveal.js HTML（8枚）として出力
      ↓
PHASE 4: 人間レビュー
  output/ フォルダの HTML をブラウザで確認
  フィードバックをテキストで入力
      ↓
PHASE 5: 仕上げ
  フィードバックを反映して最終版を出力
```

---

## 開発フェーズ

| フェーズ | 内容 | ステータス |
|---------|------|-----------|
| Phase 1 | CLIツール（入力→HTML出力） | 未着手 |
| Phase 2 | FastAPI サーバー化 | 未着手 |
| Phase 3 | Webhook 受信（フォーム連携） | 未着手 |
| Phase 4 | メール通知＋承認フロー | 未着手 |

**今は Phase 1 だけを実装する。Phase 2 以降の設計を先取りしない。**

---

## 技術スタック

| 用途 | 採用技術 | 理由 |
|------|---------|------|
| 言語 | Python 3.11+ | シンプル、AI ライブラリが充実 |
| LLM | Anthropic Claude API (`claude-sonnet-4-6`) | 構造化出力の品質が高い |
| Web 検索 | Jina AI (`s.jina.ai` / `r.jina.ai`) | API キー不要、無料 |
| スライド | Reveal.js（HTML インライン埋め込み） | 外部サービス不要、ブラウザで即表示 |
| サーバー（Phase 2〜） | FastAPI | 軽量、型安全 |
| 環境変数 | python-dotenv | `.env` ファイルで管理 |

---

## ファイル構成

```
proposal-generator/
├── CLAUDE.md               ← このファイル（プロジェクト記憶）
├── agent.md                ← AI エージェントの振る舞い定義
├── .env                    ← API キー（Git に含めない）
├── .env.example            ← API キーのテンプレート
├── requirements.txt        ← 依存ライブラリ
├── main.py                 ← CLI エントリーポイント
├── src/
│   ├── researcher.py       ← Jina AI によるリサーチ
│   ├── proposer.py         ← Claude API による提案生成
│   ├── slide_builder.py    ← Reveal.js HTML 生成
│   └── reviewer.py         ← レビューフィードバック反映
├── prompts/
│   ├── research_prompt.md  ← リサーチ用プロンプトテンプレート
│   ├── propose_prompt.md   ← 提案生成用プロンプトテンプレート
│   └── review_prompt.md    ← レビュー反映用プロンプトテンプレート
├── output/                 ← 生成されたスライド HTML を保存
└── .claude/
    └── commands/
        ├── research.md     ← /research スキル
        ├── propose.md      ← /propose スキル
        └── review.md       ← /review スキル
```

---

## スライド構成（8枚固定）

| スライド | タイトル | 内容 |
|---------|---------|------|
| 1 | 表紙 | 会社名・資料タイトル・日付 |
| 2 | 御社について | リサーチ結果から事業概要を3〜5点 |
| 3 | いただいたご要望 | 原文をそのまま + 背景の読み解き |
| 4 | ご要望の解釈（3案） | 案A/B/C のタイトルと一行説明 |
| 5 | 案A 詳細 | 実現可能性・技術・予算・期間 |
| 6 | 案B 詳細 | 同上 |
| 7 | 案C 詳細 | 同上 |
| 8 | 今日確認したいこと | ヒアリング質問 5〜7 問 |

---

## Claude への作業ルール

- **1 タスク = 1 ファイル変更を原則とする**。複数ファイルを同時に変更する場合は事前に確認する
- **動作確認コマンドを必ず提示する**。実装後に「こうやってテストしてください」を伝える
- **エラーが出たらメッセージをそのまま貼ってもらう**。推測で修正しない
- **プロンプトを変更したときは `prompts/` のファイルも更新する**
- **Phase をまたぐ実装はしない**。「Phase 2 で使うので先に作っておく」はNG

---

## よく使うコマンド

```bash
# 実行（Phase 1 CLI）
python main.py --company "株式会社〇〇" --request "在庫管理を自動化したい"

# 出力を確認
open output/proposal_latest.html

# 依存関係インストール
pip install -r requirements.txt

# 環境変数確認
cat .env.example
```

---

## 現在わかっている制約・注意点

- Jina AI の無料プランはレート制限あり（大量リクエスト時は間隔を空ける）
- `ANTHROPIC_API_KEY` が `.env` にないと動かない
- `output/` フォルダが存在しないと保存エラーになる（初回は `mkdir output` が必要）

---

## 変更履歴

| 日付 | 変更内容 |
|------|---------|
| 初期作成 | プロジェクト立ち上げ |
```

---

## ファイル2: .claude/commands/research.md

以下の内容で `.claude/commands/research.md` を作成してください：

```markdown
# /research — 会社リサーチを実行する

## 使い方

```
/research
```

引数なしで実行すると、会社名と要望の入力を求めます。

## このスキルがやること

1. `$ARGUMENTS` から会社名と要望テキストを受け取る（または対話的に入力）
2. Jina AI で以下の3クエリを検索する
   - `{会社名} 事業内容 サービス`
   - `{会社名} 課題 DX デジタル化`
   - `{業種} 業界トレンド 自動化`
3. 結果を `output/research_{タイムスタンプ}.json` に保存する
4. 要約を画面に表示する

## 出力フォーマット（JSON）

```json
{
  "company_name": "",
  "researched_at": "",
  "summary": "",
  "business_overview": "",
  "industry": "",
  "key_challenges": [],
  "digital_maturity": "low | medium | high",
  "recent_news": [],
  "raw_sources": []
}
```

## 実装の場所

`src/researcher.py`

## 改善メモ（使うたびに追記する）

- [ ] 精度が低いと感じたクエリがあれば `prompts/research_prompt.md` を修正する
- [ ] 会社の公式サイトURLが分かる場合は `r.jina.ai/{URL}` で直接取得するとより正確
```

---

## ファイル3: .claude/commands/propose.md

以下の内容で `.claude/commands/propose.md` を作成してください：

```markdown
# /propose — 提案スライドを生成する

## 使い方

```
/propose output/research_最新.json
```

または直前の `/research` 結果を自動で使う場合は引数なしで実行。

## このスキルがやること

1. リサーチ JSON を読み込む
2. `prompts/propose_prompt.md` のテンプレートを使って Claude API を呼び出す
3. 要望の解釈を3パターン（A/B/C）生成する
4. 各パターンについて以下を展開する
   - 実現可能性（○ / △ / ×）と理由
   - 推奨技術スタック
   - 予算感（ライト / スタンダード / フル）
   - 開発フェーズとスケジュール
   - ヒアリング必須質問（5〜7問）
5. Reveal.js HTML（8枚）を `output/proposal_{タイムスタンプ}.html` に保存する
6. `open output/proposal_最新.html` でブラウザに表示する

## 出力ファイル

- `output/proposal_{タイムスタンプ}.html` — ブラウザで開けるスライド
- `output/proposal_{タイムスタンプ}.json` — 構造化データ（レビュー工程で使う）

## 改善メモ（使うたびに追記する）

- [ ] 解釈の粒度が荒すぎる/細かすぎると感じたら `prompts/propose_prompt.md` を調整する
- [ ] 予算の金額感がずれていたら `agent.md` の `budget_guidelines` を更新する
- [ ] スライドのデザインを変えたい場合は `src/slide_builder.py` の CSS セクションを修正する
```

---

## ファイル4: .claude/commands/review.md

以下の内容で `.claude/commands/review.md` を作成してください：

```markdown
# /review — レビューフィードバックを反映する

## 使い方

```
/review "案Bの予算感が高すぎる。案Aをもう少し詳しく"
```

## このスキルがやること

1. `output/proposal_最新.json` を読み込む
2. フィードバックテキストを解析する
3. `prompts/review_prompt.md` のテンプレートで Claude API を呼び出す
4. 修正版スライドを `output/proposal_{タイムスタンプ}_v2.html` として保存する
5. 変更点のサマリーを表示する

## フィードバックの例

```
"案Aの技術スタックにモバイルアプリを追加してほしい"
"ヒアリング質問をもっと具体的に"
"予算を全体的に20%下げて"
"スケジュールのフェーズ2を2ヶ月延ばして"
"会社概要のスライドにEC業界であることを明記して"
```

## 改善メモ（使うたびに追記する）

- [ ] よく出るフィードバックのパターンがあれば `prompts/review_prompt.md` に例として追加する
```

---

## ファイル5: agent.md

以下の内容で `agent.md` を作成してください：

```markdown
# エージェント定義: 営業提案資料生成エージェント

このファイルは Claude API を呼び出す際のシステムプロンプトと
入出力スキーマを定義します。`src/proposer.py` から読み込まれます。

---

## エージェントの役割

あなたは IT システム開発会社の熟練した営業コンサルタントです。
クライアント企業のビジネス課題を深く理解し、
実現可能で費用対効果の高いシステム化提案を作成することが得意です。

以下の原則を守ってください：

- **正直さ**: 実現困難な要件には「△ 要検討」「× 困難」と明記する
- **具体性**: 「システムを作ります」ではなく技術スタックと工数を示す
- **段階性**: 一度に全部作らず MVP から始める提案を含める
- **顧客視点**: 技術用語を避け、ビジネス価値で説明する

---

## 入力スキーマ

```json
{
  "company_name": "株式会社〇〇",
  "request_text": "在庫管理を自動化したい",
  "research": {
    "business_overview": "...",
    "industry": "製造業",
    "key_challenges": ["在庫の可視化不足", "手作業の多さ"],
    "digital_maturity": "low"
  }
}
```

## 出力スキーマ

```json
{
  "company_summary": "100字以内の会社概要",
  "request_interpretation": "要望を一文で言い換え",
  "interpretations": [
    {
      "id": "A",
      "title": "案のタイトル（10字以内）",
      "description": "2〜3文の説明",
      "feasibility": "○ | △ | ×",
      "feasibility_reason": "理由を1文で",
      "tech_stack": ["技術1", "技術2"],
      "budget": {
        "light": "〜50万円",
        "standard": "〜150万円",
        "full": "150万円〜"
      },
      "schedule": [
        {"phase": "Phase 1", "name": "フェーズ名", "duration": "1ヶ月", "deliverable": "成果物"},
        {"phase": "Phase 2", "name": "フェーズ名", "duration": "2ヶ月", "deliverable": "成果物"}
      ],
      "hearing_questions": [
        "質問1",
        "質問2",
        "質問3",
        "質問4",
        "質問5"
      ]
    }
  ]
}
```

---

## 予算ガイドライン

実態に合った予算感を出すための参考値。
**プロジェクトの実態に合わせて随時更新すること。**

| 規模 | 目安 | 典型的な内容 |
|------|------|------------|
| ライト | 30〜80万円 | 既存ツール活用・ノーコード・MVP |
| スタンダード | 80〜300万円 | カスタム開発・API 連携・管理画面付き |
| フル | 300万円〜 | 基幹システム連携・大規模・セキュリティ要件あり |

---

## スケジュールガイドライン

| フェーズ | 典型的な期間 | 内容 |
|---------|------------|------|
| 要件定義 | 2〜4週間 | ヒアリング・仕様確定・ワイヤーフレーム |
| 設計・開発 | 1〜4ヶ月 | 実装・単体テスト |
| テスト・リリース | 2〜4週間 | 結合テスト・UAT・本番リリース |
| 運用保守 | 月次契約 | 障害対応・機能追加・サポート |

---

## ヒアリング質問のカテゴリ

提案に必ず含めるべき質問の軸：

1. **現状把握**: 今はどうやってやっているか
2. **困りごと**: 何が一番痛いか（時間・コスト・品質）
3. **ゴール**: 半年後・1年後にどうなっていたいか
4. **制約**: 予算上限・期限・使えないシステム・社内ルール
5. **意思決定**: 誰が最終決定者か・社内の反対はあるか

---

## 品質チェックリスト

提案生成後に自己チェックすること：

- [ ] 3案それぞれが明確に差別化されているか
- [ ] 予算と期間がセットで書かれているか
- [ ] ヒアリング質問が「YES/NO」で答えられないオープンクエスチョンか
- [ ] 実現困難な要件に正直に × をつけているか
- [ ] 技術用語を使う場合に補足説明があるか

---

## 改善メモ

実際に使ってみてわかったことをここに追記していく。

- [ ] よく出る業種・要件のパターンがあれば「業種別テンプレート」として追加する
- [ ] 予算感がずれていたら `budget_guidelines` を更新する
- [ ] 顧客から好評だったスライドの構成があれば記録する
```

---

## ファイル6: prompts/research_prompt.md

以下の内容で `prompts/research_prompt.md` を作成してください：

```markdown
# リサーチ整理プロンプト

## 用途
Jina AI で取得した生の検索結果を構造化 JSON に変換するプロンプト。
`src/researcher.py` の `format_research()` 関数で使用。

---

## プロンプトテンプレート

```
以下は「{company_name}」についてのWeb検索結果です。

---
{raw_search_results}
---

この情報を整理して、以下のJSON形式で出力してください。
情報が不足している項目は "不明" と記入してください。推測で埋めないでください。

{
  "business_overview": "事業内容を3〜5文で説明",
  "industry": "業種（例: 製造業、小売業、IT・SaaS など）",
  "company_size": "規模感（例: 中小企業・従業員50名程度）または不明",
  "key_challenges": ["課題1", "課題2", "課題3"],
  "digital_maturity": "low（紙・Excel中心）/ medium（一部システム化）/ high（DX推進中）",
  "recent_news": ["最近のニュース・動向（あれば）"],
  "what_they_might_want": "「{request_text}」という要望の背景として考えられること"
}

JSONのみ出力してください。説明文は不要です。
```

---

## チューニングメモ

- `key_challenges` が的外れな場合 → 検索クエリに「〜 問題点」「〜 悩み」を追加する
- `digital_maturity` の判定がずれる場合 → 各レベルの具体例をプロンプトに追加する
```

---

## ファイル7: prompts/propose_prompt.md

以下の内容で `prompts/propose_prompt.md` を作成してください：

```markdown
# 提案生成プロンプト

## 用途
リサーチ結果と要望から提案スライドの内容を生成するプロンプト。
`src/proposer.py` の `generate_proposal()` 関数で使用。
エージェントの役割定義は `agent.md` を参照。

---

## プロンプトテンプレート

```
# クライアント情報

会社名: {company_name}
要望: {request_text}

## リサーチ結果
事業概要: {business_overview}
業種: {industry}
主な課題: {key_challenges}
デジタル成熟度: {digital_maturity}

---

# タスク

この会社が「{request_text}」と言ったとき、
実際に求めていることは何かを考え、3つの異なるアプローチで提案してください。

## 3つの案の方向性

- 案A: スモールスタート（低リスク・短期間・MVP的アプローチ）
- 案B: スタンダード（一般的な実装・バランス型）
- 案C: フルスペック（将来拡張を見据えた本格構築）

## 出力形式

`agent.md` の出力スキーマに従い、JSON で出力してください。
JSONのみ出力してください。前後の説明文は不要です。
```

---

## チューニングメモ

- 案A〜Cの差が小さいと感じたら → 方向性の説明をより具体的に書き直す
- 予算感がずれたら → `agent.md` の `budget_guidelines` を更新し、プロンプトに「参考値: ...」として追記する
- ヒアリング質問が表面的なら → `agent.md` の質問カテゴリをプロンプト内に明示する
```

---

## ファイル8: prompts/review_prompt.md

以下の内容で `prompts/review_prompt.md` を作成してください：

```markdown
# レビュー反映プロンプト

## 用途
人間のフィードバックを受けて提案を修正するプロンプト。
`src/reviewer.py` の `apply_feedback()` 関数で使用。

---

## プロンプトテンプレート

```
# 現在の提案

{current_proposal_json}

---

# フィードバック

{feedback_text}

---

# タスク

フィードバックを反映して提案を修正してください。

ルール：
- フィードバックで言及されていない部分は変更しないこと
- 変更した箇所を `changes_summary` に箇条書きでまとめること
- 出力は元の JSON スキーマを維持すること

出力形式:
{
  "changes_summary": ["変更点1", "変更点2"],
  "proposal": { ...修正後の提案JSON... }
}
```

---

## チューニングメモ

- 「変えてほしくない部分まで変わる」場合 → ルールに「〜は変更禁止」を追加する
- フィードバックの解釈がずれる場合 → フィードバック例をプロンプトに追加する
```

---

## ファイル9: output/.gitkeep

`output/.gitkeep` を空ファイルとして作成してください。

---

## 作成後にやること

すべてのファイルを作成したら、以下を実行してください：

1. `requirements.txt` を作成する（内容: `anthropic`, `python-dotenv`, `requests`）
2. `.env.example` を作成する（内容: `ANTHROPIC_API_KEY=your_key_here`）
3. 以下のメッセージを表示する：

```
✅ プロジェクトの土台を作成しました。

次のステップ：
1. cp .env.example .env
2. .env に ANTHROPIC_API_KEY を設定する
3. pip install -r requirements.txt
4. 「Phase 1 の main.py を実装してください」と話しかける

スキルの使い方：
/research  — 会社リサーチを実行
/propose   — 提案スライドを生成
/review    — フィードバックを反映

育て方：
各スキルファイルの「改善メモ」に
気づいたことを書き足していくと
プロジェクト固有の知識が蓄積されます。
```
