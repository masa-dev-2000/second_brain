# vercel-labs/agent-browser

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) |
| 言語 | Rust |
| 総スター数 | 33,871 |
| 本日のスター | +189 |
| ライセンス | MIT |
| トレンド順位 | #35相当（2026/05/22） |
| カテゴリ | エージェントフレームワーク / ブラウザ自動化 |

---

## 概要

AIエージェントが高速・確実にブラウザを自動操作するためのRust製CLI。Node.jsやPlaywrightをデーモン層に必要とせず、単一バイナリで動作する。

要素の参照に「コンテンツベースのハッシュID（@e1, @e2...）」を使うため、デザイン変更後もセレクターが壊れにくい。Browserbase・Browserless・AWS Bedrock AgentCoreなどクラウドブラウザ基盤にも対応。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **ページ操作** | click(@e5), type(@e3, "text"), scroll, hover, drag |
| **ナビゲーション** | open(url), go_back, wait_for(@selector) |
| **スナップショット** | アクセシビリティツリーを@e参照IDで取得 |
| **スクリーンショット** | screenshot(path), viewport_stream |
| **セッション管理** | 複数の独立したブラウザセッションを同時管理 |
| **AIチャットモード** | 自然言語でブラウザ操作を指示 |
| **クラウド接続** | Browserbase・Browserless・AWS AgentCoreに接続 |

---

## あるとないとの違い

| 観点 | Puppeteer/Playwright | agent-browser |
|------|---------------------|--------------|
| 実行環境 | Node.js必須 | Rustの単一バイナリ（依存なし） |
| セレクター安定性 | CSS/XPath（デザイン変更で壊れる） | ハッシュベースID（コンテンツ変化に強い） |
| AIとの統合 | 別途MCPやラッパーが必要 | MCP対応・AIチャットモード内蔵 |
| 複数セッション | 手動管理 | セッションIDで自動管理 |

---

## 環境構築方法

### 前提条件
- Rust 1.75以上（バイナリのビルド場合）またはリリースバイナリを使用
- Chrome / Chromium インストール済み
- AIエージェント（Claude Code等）との統合用にMCP設定

### インストール手順
```bash
# リリースバイナリをダウンロード（Mac）
curl -fsSL https://github.com/vercel-labs/agent-browser/releases/latest/download/agent-browser-macos -o agent-browser
chmod +x agent-browser
sudo mv agent-browser /usr/local/bin/

# またはcargo buildで自前ビルド
git clone https://github.com/vercel-labs/agent-browser
cd agent-browser
cargo build --release
```

### MCP統合（Claude Code）
```json
// .mcp.json
{
  "mcpServers": {
    "agent-browser": {
      "command": "agent-browser",
      "args": ["mcp-serve"]
    }
  }
}
```

### クラウドブラウザとの接続（Browserbase）
```bash
export BROWSERBASE_API_KEY="bb_..."
agent-browser open "https://example.com" --provider browserbase
```

### 動作確認
```bash
# ローカルブラウザで基本操作テスト
agent-browser open "https://google.com"
agent-browser snapshot  # → @e1, @e2... のIDリストが表示される
agent-browser screenshot /tmp/test.png
```

---

## ベストプラクティス

1. **スナップショットでIDを確認してから操作:**
```bash
agent-browser open "https://example.com/form"
agent-browser snapshot
# → @e1: input[name=email], @e2: input[name=password], @e3: button[type=submit]

agent-browser type @e1 "user@example.com"
agent-browser type @e2 "password123"
agent-browser click @e3
```

2. **AIエージェントとの統合で自然言語操作:**
```bash
# Claude Codeにインストール後
claude "agent-browserを使ってhttps://myshop.com の商品一覧ページから
       全商品名と価格をスクレイプして CSV に保存して"
```

3. **セッションを名前付きで管理:**
```bash
# 複数タスクを並列実行
agent-browser session create --name "task1"
agent-browser session create --name "task2"

agent-browser open "https://site-a.com" --session task1
agent-browser open "https://site-b.com" --session task2
```

4. **競合監視の自動化:**
```bash
# cronジョブで毎日実行
agent-browser open "https://competitor.com/pricing"
agent-browser extract @pricing-table --format json > pricing_$(date +%Y%m%d).json
```

---

## セキュリティ観点

### ブラウザ自動化の固有リスク
- **CSRF・認証Cookie:** ブラウザセッションにはログイン済みのCookieが含まれる場合があり、意図しない操作でデータが削除・送信される可能性
- **スクレイピングの利用規約:** 対象サイトのrobots.txtや利用規約を確認する
- **レート制限回避:** 過度なリクエストはIPブロックや法的問題につながる

### 本番環境での注意
```bash
# テスト用の専用ブラウザプロファイルを使用
agent-browser open "https://my-app.com" --profile test-profile
# → 本番アカウントのCookieと分離

# 認証ボールトの設定（本番認証情報を直接コマンドに書かない）
agent-browser config set-vault --name prod-creds --encrypted
```

### クラウドブラウザサービスのデータ
- BrowserbaseやBrowserlessにはブラウザセッションのデータが送信される
- 機密情報を含む操作はローカルブラウザのみで実行する

---

## ペルソナ設定と使い方

### ペルソナ：西村 聡（33歳・SREエンジニア・競合調査担当）

西村さんは週1回、競合20社のプライシングページをチェックして価格変更を追う業務がある。手動確認に毎週2時間かかっていた。Playwright+Pythonで自動化しようとしたが、競合のサイトリニューアルのたびにセレクターが壊れて保守が大変だった。

```bash
# agent-browserを使った競合価格モニタリング

# 競合サイトの価格テーブルを取得
agent-browser open "https://competitor-a.com/pricing"
agent-browser snapshot
# → @e42 が価格テーブルを示すIDとして検出される
# → コンテンツベースIDなので、デザインが変わっても同じ要素を指す

agent-browser extract @e42 --format json > pricing_a_$(date +%Y%m%d).json

# 先週との比較
diff pricing_a_20260515.json pricing_a_20260522.json
# → 「Proプランが$49→$59に値上げ」を検出

# Slackに自動通知（Lambdaで週次実行）
if [ $(diff count) -gt 0 ]; then
  curl -X POST $SLACK_WEBHOOK -d '{"text": "競合の価格変更を検出しました"}'
fi

# 以前：2時間 → 以後：自動化で0時間（通知受信のみ）
# セレクター壊れ問題：コンテンツIDベースでほぼ消滅
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| chrome-devtools-mcp (#8) | Chrome DevTools統合のMCPサーバー（パフォーマンス計測等も） |
| Playwright | テスト特化ブラウザ自動化（Node.js必須） |
| Puppeteer | Google製ブラウザ自動化（Node.js必須） |
| Browserbase | クラウドブラウザサービス（agent-browserと統合可能） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/vercel-labs/agent-browser)
- [Browserbase](https://www.browserbase.com/)
