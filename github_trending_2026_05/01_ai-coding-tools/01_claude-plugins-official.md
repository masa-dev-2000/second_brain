# anthropics/claude-plugins-official

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) |
| 言語 | Python / TypeScript / Shell |
| 総スター数 | 22,326 |
| 本日のスター | +891 |
| ライセンス | MIT |
| トレンド順位 | #1（2026/05/22） |
| カテゴリ | AIコーディングツール拡張 |

---

## 概要

Anthropicが公式に管理する Claude Code 向けプラグインのキュレーテッドディレクトリ（マーケットプレイス）。  
Anthropic製のファーストパーティプラグインと、パートナー・コミュニティ製のサードパーティプラグインの両方を収録する。

品質審査済みのプラグインを `/plugin install` の1コマンドでインストールでき、Claude Codeの機能をスラッシュコマンド・エージェント・スキル・MCPサーバーとして拡張できる。

---

## 主な機能

- **プラグイン検索・インストール:** `/plugin > Discover` UIまたはコマンドラインから検索・導入
- **2種類のプラグイン:**
  - **内部プラグイン（`/plugins`）:** Anthropic公式開発・保守
  - **外部プラグイン（`/external_plugins`）:** サードパーティ提供、コミュニティレビュー済み
- **標準プラグイン構成:**
  ```
  plugin-name/
  ├── .claude-plugin/plugin.json   # メタデータ（必須）
  ├── .mcp.json                    # MCPサーバー設定（任意）
  ├── commands/                    # スラッシュコマンド定義
  ├── agents/                      # エージェント定義
  ├── skills/                      # スキル定義
  └── README.md
  ```

---

## あるとないとの違い

| 観点 | ない場合 | ある場合 |
|------|----------|----------|
| プラグイン発見 | GitHubを自力で検索、品質不明 | 審査済みプラグインを一覧から選択 |
| インストール | 手動でファイルコピー・設定 | 1コマンドで完了 |
| 信頼性 | 各自で判断 | Anthropicによるメタデータ審査あり |
| 更新管理 | 手動 | `/plugin update` で一括更新 |

---

## 環境構築方法

### 前提条件
- Claude Code CLI インストール済み（`npm install -g @anthropic-ai/claude-code`）
- Anthropic APIキー設定済み

### インストール手順
```bash
# Claude Code内でプラグインを検索・インストール
/plugin > Discover               # UIから検索
/plugin install <plugin-name>@claude-plugins-official  # 直接インストール

# またはCLIから
claude /plugin install web-search@claude-plugins-official
```

### 動作確認
```bash
/plugin list    # インストール済みプラグインを確認
/plugin info <plugin-name>  # 詳細確認
```

---

## ベストプラクティス

### インストール前の確認
1. **READMEを必ず読む:** サードパーティプラグインはAnthropicが実装内容を保証しない
2. **スコープを確認:** プラグインが要求するパーミッション（ファイルアクセス範囲、ネットワーク接続先）を確認
3. **スター数・更新日を確認:** コミュニティからの信頼度の目安になる

### 運用
4. **プロジェクト別にプラグインを分ける:** `.claude-plugin/` をプロジェクトルートに置くとプロジェクト固有の設定になる
5. **使わないプラグインは無効化:** アクティブプラグインが増えるとコンテキストを消費する
6. **社内プラグインは内部ディレクトリで管理:** 組織内で使うプラグインはプライベートリポジトリで同じ構造で管理可能

### 開発者向け
7. **`plugin.json` のバリデーション:** スキーマに準拠していないとインストール拒否される
8. **最小権限の原則:** プラグインが必要なスコープ以上のパーミッションを要求しない

---

## セキュリティ観点

### リスク
- **サードパーティプラグインの実装内容は未保証:** Anthropicはメタデータを審査するが、コードのフルレビューは行わない
- **MCPサーバー経由のネットワークアクセス:** `.mcp.json` で外部サーバーへの接続が設定されている場合、機密情報が送信される可能性
- **スラッシュコマンドのコードインジェクション:** 悪意あるプラグインがシェルコマンドを実行する可能性

### 対策
```bash
# インストール前に .mcp.json を確認
cat ~/.claude/plugins/plugin-name/.mcp.json

# 外部接続先を確認
grep -r "url\|endpoint\|host" ~/.claude/plugins/plugin-name/

# 不審なプラグインは即削除
/plugin remove suspicious-plugin
```

### 組織での注意事項
- 社外秘データを扱うプロジェクトではサードパーティプラグインの使用を制限するポリシーを設ける
- CI/CDパイプラインでの使用時は特にインストール済みプラグインをリスト管理する

---

## ペルソナ設定と使い方

### ペルソナ：田中 翼（28歳・フルスタックエンジニア・SaaS企業勤務）

田中さんはClaude Codeを日常的に使っているが、「毎回同じような設定を手書きする」「特定のフレームワーク用のコマンドが欲しい」という不満があった。

#### シナリオ：Next.jsプロジェクトでの活用

```bash
# 1. Discoverでプラグインを探す
# Claude Code内で
/plugin > Discover
→ "nextjs" で検索 → next-js-skills がヒット

# 2. インストール
/plugin install next-js-skills@claude-plugins-official

# 3. 即座に使える専用コマンド
/next-generate-page UserProfile  # Next.jsのApp Router形式でページ生成
/next-optimize-images            # 画像最適化の提案と実装
/next-add-auth                   # NextAuthの設定を自動セットアップ
```

#### シナリオ：チーム展開

```bash
# プロジェクトルートのCLAUDE.mdにプラグイン要件を記載
echo "## Required Plugins\n- next-js-skills\n- eslint-agent" >> CLAUDE.md

# 新メンバーが参加したとき
/plugin install-from-claude-md   # CLAUDE.mdに記載された全プラグインを一括インストール
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| Cursor Rules | Cursor IDE向けのルール・プロンプト管理 |
| awesome-claude-code | コミュニティ製CLAUDE.md・スキル集（非公式） |
| dotnet/skills (#4) | .NET専門のAIエージェントスキル集 |

### 自作プラグインの公開手順
1. `plugin.json` をAnthropicのスキーマに準拠して作成
2. `external_plugins/` へPR提出
3. Anthropicのメタデータ審査（数営業日）
4. マージ後、全Claude Codeユーザーが `/plugin > Discover` から発見できる

---

## 参考リンク

- [公式リポジトリ](https://github.com/anthropics/claude-plugins-official)
- [Claude Code公式ドキュメント](https://docs.anthropic.com/claude/docs/claude-code)
- [プラグイン開発ガイド](https://github.com/anthropics/claude-plugins-official/blob/main/CONTRIBUTING.md)
