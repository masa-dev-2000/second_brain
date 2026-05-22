# multica-ai/multica

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [multica-ai/multica](https://github.com/multica-ai/multica) |
| 言語 | Go |
| 総スター数 | 30,698 |
| 本日のスター | +511 |
| ライセンス | Apache 2.0 |
| トレンド順位 | #13（2026/05/22） |
| カテゴリ | AIプラットフォーム / チームエージェント管理 |

---

## 概要

AIコーディングエージェントをチームメンバーとして管理するオープンソースプラットフォーム。GitHub IssueをAIエージェントにアサインすると、エージェントが自律的にコードを実装・テスト・PR作成まで完了させる。

Claude Code・GitHub Copilot CLI・Gemini CLI・Codex等10以上のエージェントをサポート。「スクワッド」機能でエージェントをチーム化し、安定した作業ルーティングも可能。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **タスクアサイン** | GitHubのIssueをエージェントに直接アサイン |
| **自律実行** | クレーム→実行→報告→完了のライフサイクルを自動管理 |
| **リアルタイム進捗** | エージェントの実行ログをストリーミング表示 |
| **スキル蓄積** | 解決策がチームの再利用可能スキルとして蓄積 |
| **スクワッド** | 複数エージェントをリーダーの下にグループ化 |
| **マルチランタイム** | ローカルマシン・クラウドVMの両方に対応 |

---

## あるとないとの違い

| 観点 | ない場合 | ある場合 |
|------|----------|----------|
| タスク割り当て | エージェントを起動してプロンプトを毎回手書き | GitHubでIssueをアサインするだけ |
| 作業状況確認 | エージェントが終わるまで待機 | Webダッシュボードでリアルタイム確認 |
| 知識の再利用 | 同じ問題を毎回解いてもらう | 過去の解決策がスキルとして蓄積・再利用 |
| チーム管理 | 各自が別々のAIツールをバラバラに使用 | 全エージェントを一元管理 |

---

## 環境構築方法

### 前提条件
- Go 1.21以上（セルフホストの場合）
- GitHubアカウント・GitHubアプリのインストール権限
- 使用するAIエージェントのAPIキー

### インストール方法1：Multica Cloud（推奨・最速）
```
1. https://multica.ai でアカウント作成
2. GitHubリポジトリをインストール承認
3. エージェントのAPIキーを設定
4. 完了（5分）
```

### インストール方法2：セルフホスト
```bash
# リポジトリのクローン
git clone https://github.com/multica-ai/multica
cd multica

# 設定ファイルの作成
cp config.example.yaml config.yaml
nano config.yaml
```

### config.yaml の設定
```yaml
server:
  port: 8080

github:
  app_id: 123456           # GitHub Appのアプリケーション ID
  webhook_secret: "..."    # Webhook シークレット
  private_key_path: "./github-app.pem"

agents:
  default: claude-code
  claude-code:
    api_key: "sk-ant-..."
    model: "claude-sonnet-4-6"
  gemini:
    api_key: "AIza..."
```

### GitHub Appの作成
```
1. GitHub Settings > Developer Settings > GitHub Apps > New GitHub App
2. Webhook URL: https://your-server.com/webhook
3. Permissions: Issues (Read/Write), Pull Requests (Read/Write), Contents (Read/Write)
4. Subscribe: Issues, Pull Requests
```

### 起動
```bash
go build -o multica .
./multica serve

# またはDocker
docker-compose up -d
```

### 動作確認
```
# GitHubのIssueを作成して @multica-agent をアサイン
# → エージェントが自動でクレームしてコメントが来れば成功
```

---

## ベストプラクティス

1. **明確なIssue記述がエージェントの品質を決める:**
```markdown
# 良いIssue記述
## 概要
ユーザー一覧APIのページネーションを実装する

## 要件
- エンドポイント: GET /api/users?page=1&limit=20
- レスポンス形式: { data: User[], total: number, page: number }
- 既存のUserControllerに追加（新規ファイル作成不要）
- テストも追加すること

## 受け入れ基準
- [ ] ページネーションが正しく動作する
- [ ] 空のページで空配列を返す
- [ ] テストが全てパスする
```

2. **スクワッドで得意分野を分ける:**
```yaml
squads:
  backend-squad:
    leader: claude-code
    members: [codex, gemini]
    routing: 
      labels: [backend, api, database]
  frontend-squad:
    leader: cursor-agent
    members: [copilot]
    routing:
      labels: [frontend, ui, css]
```

3. **スキル蓄積を活用:**
```
# 「認証ミドルウェアの追加」を解決したら
/skill save "jwt-auth-middleware" --from issue-#42
# → 次回似た問題が来たとき、エージェントがこのスキルを参照
```

---

## セキュリティ観点

### GitHub Appの権限最小化
```yaml
# 必要最小限の権限のみ付与
permissions:
  issues: write       # Issue操作
  pull_requests: write # PR操作
  contents: write     # コードの読み書き
  # metadata: read は不要
  # admin: なし（絶対に付与しない）
```

### コードレビューの義務化
```yaml
# エージェントのPRは必ず人間がレビューする設定
require_human_review: true
auto_merge: false  # 自動マージを無効化
```

### ブランチ保護
```
GitHubのmainブランチ保護ルール:
- Require pull request reviews: 1名以上
- Dismiss stale reviews: オン
- Restrict pushes: エージェントの直接プッシュを禁止
```

### APIキーのローテーション
```bash
# 定期的にAPIキーを更新（3ヶ月ごと推奨）
multica config rotate-keys
```

---

## ペルソナ設定と使い方

### ペルソナ：中村 剛（43歳・スタートアップ創業者・技術的負債の山と格闘中）

中村さんの会社は3年前に急成長した際に技術的負債を大量に抱え込んだ。現在はエンジニア4人でプロダクト開発しながら負債返済もこなさなければならない状況。「負債返済のためのIssueは100件以上あるが、人手が足りない」が口癖だった。

```bash
# multikca導入後のフロー

# 1. 技術的負債のIssueを作成
# Issue #103: userテーブルのインデックス最適化
# Issue #104: ログ出力をJSON形式に統一  
# Issue #105: 未使用のAPIエンドポイントを削除

# 2. GitHubでアサイン
# Issue #103 → @multica-agent（backend-squad）
# Issue #104 → @multica-agent（backend-squad）
# Issue #105 → @multica-agent（backend-squad）

# 3. Webダッシュボードで確認
# → 3つのIssueが並列で処理中
# → 30分後、3つのPRが同時にオープン

# 4. エンジニアがレビューしてマージ

# 1ヶ月後の結果:
# - 技術的負債Issue: 100件 → 41件（59件を自動解決）
# - エンジニアは新機能開発に集中できるようになった
# - 「負債返済に追われる」ストレスが大幅に軽減
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| hermes-agent (#21) | 個人向け・自己学習型エージェント |
| GitHub Copilot Workspace | GitHub公式のAIワークスペース（β） |
| Linear + AI | タスク管理 + AI（Multicaより限定的） |
| Devin | 自律AIエンジニア（有料・高価格帯） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/multica-ai/multica)
