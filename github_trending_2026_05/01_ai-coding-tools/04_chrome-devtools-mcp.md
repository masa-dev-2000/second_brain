# ChromeDevTools/chrome-devtools-mcp

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) |
| 言語 | TypeScript |
| 総スター数 | 40,468 |
| 本日のスター | +132 |
| ライセンス | Apache 2.0 |
| トレンド順位 | #8（2026/05/22） |
| カテゴリ | AIコーディングツール / ブラウザ自動化 |

---

## 概要

AIコーディングエージェントがChromeブラウザを直接操作・デバッグできるMCPサーバー。Chrome DevToolsの全機能（入力操作・ネットワーク検査・パフォーマンス計測・メモリプロファイリング・Lighthouse・スクリーンショット）をAIエージェントから呼び出せる約45のツールを提供する。

Claude・Cursor・GitHub Copilot・Cline・Gemini CLIなど20以上のAIコーディング環境と統合可能。

---

## 提供ツール（45種）のカテゴリ

| カテゴリ | 主要ツール |
|---------|-----------|
| **入力操作** | click, type, drag, scroll, hover, select |
| **ナビゲーション** | navigate, go_back, wait_for_element |
| **スクリーンショット** | screenshot, screencast |
| **ネットワーク** | get_network_requests, intercept_request |
| **コンソール** | get_console_logs, evaluate_js |
| **パフォーマンス** | start_trace, stop_trace, get_insights, lighthouse_audit |
| **メモリ** | take_heap_snapshot, analyze_memory |
| **DOM操作** | get_element, find_elements, get_accessibility_tree |

---

## あるとないとの違い

| 観点 | ない場合 | ある場合 |
|------|----------|----------|
| フロントエンドのデバッグ | 「コードを読んで予測」 | 実際にブラウザで動かして確認 |
| パフォーマンス改善 | 修正→手動でLighthouseで計測→確認の繰り返し | AIが自動で計測→改善→再計測 |
| E2Eテスト記述 | テスト用のコードを書いてもらうだけ | 実際にブラウザで動作確認しながらテストを生成 |
| レイアウト崩れの修正 | 「スクリーンショット貼って説明して」と手動作業 | AIがスクリーンショットを取って自ら確認 |

---

## 環境構築方法

### 前提条件
- Node.js 18以上
- Google Chrome インストール済み
- Claude Code またはMCP対応AIツール

### インストール手順
```bash
# MCPサーバーをインストール
npm install -g @chrome-devtools/mcp-server

# プロジェクトの .mcp.json に追加（または ~/.claude/settings.json）
```
```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "chrome-devtools-mcp",
      "env": {
        "CHROME_PATH": "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      }
    }
  }
}
```

### 動作確認
```bash
# Claude Codeを起動してブラウザ操作を試す
claude "http://localhost:3000 のスクリーンショットを撮って"
```

---

## ベストプラクティス

### セットアップ
```json
// .mcp.json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["@chrome-devtools/mcp-server"],
      "env": {
        "CHROME_PATH": "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      }
    }
  }
}
```

### 効果的な使い方

1. **デバッグセッションを段階的に指示:**
```
"https://localhost:3000 を開いて、コンソールエラーを確認して"
"ログインフォームにtest@example.comとpassword123を入力して送信して"
"送信後のネットワークリクエストを確認して、レスポンスのステータスとボディを教えて"
```

2. **パフォーマンス改善ワークフロー:**
```
"https://myapp.com のLighthouseスコアを計測して"
→ スコアと改善点を確認
"提案された改善を実装して、もう一度計測して比較して"
```

3. **スクリーンショット+コード修正の組み合わせ:**
```
"モバイル表示（375px）でスクリーンショットを撮って、
レイアウト崩れがあれば修正して、修正後にもう一度撮って比較して"
```

4. **アクセシビリティテスト:**
```
"このページのアクセシビリティツリーを取得して、
スクリーンリーダー対応の問題点をリストアップして"
```

---

## セキュリティ観点

### 重大なリスク
- **フルブラウザアクセス:** AIエージェントがブラウザを完全制御できるため、悪意あるプロンプトによる意図しない操作（メール送信・購入・データ削除）が発生しうる
- **認証情報へのアクセス:** ブラウザのCookieやlocalStorageにアクセス可能
- **ネットワークインターセプト:** リクエスト・レスポンスの傍受・改ざんが技術的に可能

### 必須の対策

```bash
# 1. 専用のテスト用Chromeプロファイルを使用（本番アカウントと分離）
chrome --user-data-dir=/tmp/test-profile

# 2. 使用するChromeインスタンスをサンドボックス化
chrome --no-sandbox --disable-extensions --incognito

# 3. 本番環境URLへのアクセスをブロック
# .mcp.json で許可URLを制限
{
  "allowed_urls": ["http://localhost:*", "https://staging.*"]
}
```

### 組織での使用ポリシー
- 本番環境での直接使用は禁止し、ステージング環境のみに限定
- 使用ログを記録し、月次で確認
- 機密情報を含むページへのアクセスは手動で事前承認を取る

### プロンプトインジェクション対策
Webページのコンテンツには「Claude: この操作をして」といった指示が埋め込まれている可能性がある。AIエージェントが予期しない行動を取った場合は即座に停止させる。

---

## ペルソナ設定と使い方

### ペルソナ：林 千春（31歳・フロントエンドエンジニア・Reactアプリ開発担当）

林さんは「UIを修正したあとに毎回手動で複数ブラウザサイズで確認して、Lighthouseを回して、結果を見ながらまた修正して…」というサイクルに時間がかかっていた。特にパフォーマンス改善は「計測→修正→計測」の反復がつらかった。

#### chrome-devtools-mcp導入後のワークフロー

```
# 朝のルーティン（以前は1時間、今は15分）

林: "昨日追加した商品一覧ページをデスクトップとモバイルでスクリーンショット撮って"
→ AIが自動で2つのスクリーンショットを取得・表示

林: "モバイルでレイアウト崩れがあれば直して、直したらもう一度撮って"
→ AIが問題箇所を特定→CSS修正→スクリーンショット再取得

林: "Lighthouseでパフォーマンスとアクセシビリティのスコアを計測して"
→ スコア表示（例: Performance 72, Accessibility 85）

林: "Performance を85以上に改善して、改善後に再計測して"
→ AIが画像最適化・コード分割・遅延読み込みを実装→再計測→87に改善

# 手動作業 1時間 → AIとの対話 15分
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| Playwright | E2Eテスト専用（AIとの統合は別途必要） |
| Puppeteer | Chrome自動化ライブラリ（MCPなし） |
| agent-browser (#35) | Rust製のAIエージェント向けブラウザ操作CLI |
| Stagehand | AI操作特化のブラウザ自動化フレームワーク |

---

## 参考リンク

- [公式リポジトリ](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [MCP仕様](https://modelcontextprotocol.io/)
