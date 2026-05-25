# anthropics/knowledge-work-plugins

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) |
| 言語 | Python |
| 総スター数 | 14,186 |
| ライセンス | MIT |
| カテゴリ | AIコーディングツール / Claude Coworkプラグイン公式集 |

---

## 概要

AnthropicがClaude Cowork（ナレッジワーカー向けClaude）用に公式公開するプラグイン集。文書作成・リサーチ・要約・会議メモ・データ分析など「コードを書かない知識労働者」のワークフローをClaude Coworkから直接自動化できる。

`claude-plugins-official`（コーディング向け）の姉妹リポジトリで、**非エンジニア職向けのAI自動化の公式起点**として機能する。

---

## 主な機能カテゴリ

| カテゴリ | プラグイン例 |
|---------|------------|
| **文書・レポート作成** | 会議メモ自動生成・週次レポートテンプレート |
| **リサーチ支援** | Web検索まとめ・論文要約・競合調査 |
| **データ分析** | スプレッドシート解析・グラフ生成・インサイト抽出 |
| **コミュニケーション** | メール下書き・提案書・プレゼン構成 |
| **ナレッジ管理** | ドキュメント分類・FAQベース構築 |

---

## あるとないとの違い

| 観点 | なし | knowledge-work-plugins |
|------|------|----------------------|
| 対象ユーザー | エンジニア前提 | 非エンジニアでも使える |
| セットアップ | コーディング知識が必要 | プラグイン追加のみ |
| ワークフロー | 手動で依頼文を書く | プラグインが最適なプロンプトを内包 |
| 品質担保 | 個人のプロンプトスキルに依存 | Anthropic審査済み |

---

## 環境構築方法

```bash
# Claude Coworkでプラグインを追加
# 1. Claude Coworkを開く
# 2. プラグインマネージャーから追加
# または

# Claude Codeから利用する場合
/add-plugin anthropics/knowledge-work-plugins/<plugin-name>
```

### プラグイン利用例

```
# 会議メモ自動整理
「今日の会議メモをアクションアイテムとオーナー付きで整理して」
→ meeting-notes プラグインが最適フォーマットで出力

# 競合調査
「競合A社とB社のSaaS料金体系を比較表にして」
→ research プラグインがWeb検索+表形式整形

# 週次レポート
「先週のSlackスレッドから進捗レポートを生成して」
→ weekly-report プラグインが構造化出力
```

---

## ベストプラクティス

```
非エンジニアへの展開方法:
1. 部門ごとに使うプラグインをセット化
   - 営業チーム: meeting-notes + proposal + crm-update
   - 人事チーム: jd-generator + interview-summary + onboarding
   - マーケ: competitor-research + content-brief + campaign-report

2. Claude Coworkのプロジェクト機能と組み合わせ
   → プロジェクトごとにプラグインセットを保存

3. 独自プラグインをこのリポジトリのフォーマットで作成
   → 社内ツール・Notion・Slack連携など
```

---

## 周辺情報

| ツール | 特徴 |
|--------|------|
| [claude-plugins-official](./01_claude-plugins-official.md) | コーディング向け公式プラグイン |
| [awesome-claude-code](./11_awesome-claude-code.md) | コミュニティ製スキル・Hookの集積 |

---

## 参考リンク

- [公式リポジトリ](https://github.com/anthropics/knowledge-work-plugins)
