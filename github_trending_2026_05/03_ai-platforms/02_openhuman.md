# tinyhumansai/openhuman

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [tinyhumansai/openhuman](https://github.com/tinyhumansai/openhuman) |
| 言語 | Rust |
| 総スター数 | 24,821 |
| 本日のスター | +1,351 |
| ライセンス | MIT |
| トレンド順位 | #22相当（2026/05/22） |
| カテゴリ | AIプラットフォーム / デスクトップパーソナルAI |

---

## 概要

118以上のサービス（Gmail・Notion・GitHub・Slack・Google Calendar等）とワンクリックOAuth連携し、全データを20分おきにローカルに収集してObsidian互換の「Memory Tree」wikiに整理するデスクトップAIアシスタント。

「AIエージェントが初日から自分の仕事を全部知っている」状態を作ることで、コンテキスト共有の手間をゼロにすることを目指す。全データはローカルに暗号化保存。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **サービス統合** | 118+サービスをOAuthで連携、20分間隔でデータ収集 |
| **Memory Tree** | Obsidian互換wikiに全データを構造化して保存 |
| **デスクトップマスコット** | 常駐するUIエージェント、話しかけると即応答 |
| **トークン最適化** | スマート圧縮でAPIコストを削減 |
| **ローカル暗号化** | 全データは自機上でAES-256で暗号化 |
| **ネイティブツール** | Web検索・スクレイピング・音声・コード編集 |

---

## あるとないとの違い

| 観点 | ない場合 | ある場合 |
|------|----------|----------|
| AIへのコンテキスト共有 | 毎回「私は〇〇で、今は〇〇をしていて…」と説明 | 初日から全サービスの情報を把握済み |
| 情報の分散 | GitHub・Notion・Slack・Gmailを別々に確認 | Memory Treeで全情報が統合検索可能 |
| AIのウォームアップ | 数週間かけて徐々に学習 | 連携後20分で主要コンテキストを把握 |
| データの場所 | クラウドサービス上 | 自機上（暗号化） |

---

## 環境構築方法

### 前提条件
- macOS 13以上 / Windows 11 / Linux（Wayland対応）
- Rust 1.75以上（ソースビルドの場合）

### インストール手順（リリースバイナリ）
```bash
# Mac
curl -fsSL https://openhuman.ai/install.sh | sh

# またはHomebrew
brew install --cask openhuman

# Windows
# リリースページからインストーラーをダウンロード
# https://github.com/tinyhumansai/openhuman/releases
```

### 初期セットアップ
```bash
# 1. アプリを起動するとセットアップウィザードが開始
# 2. 使用するLLMを選択（Claude推奨・OpenAI・Gemini・ローカルOllama）
# 3. APIキーを入力
# 4. 連携するサービスを選択してOAuth認証
```

### 主要サービスの連携手順
```
Settings > Integrations
→ Gmail: 「Connect」→ Googleアカウントで認証
→ GitHub: 「Connect」→ GitHubアカウントで認証
→ Notion: 「Connect」→ Notionアカウントで認証
→ Slack: 「Connect」→ Slackワークスペースで認証
```

### 動作確認
```
# デスクトップマスコットに話しかける
"今週の予定を教えて"
→ Googleカレンダーのデータを参照して返答が来れば成功

"昨日のPRのレビューはどうなってる？"
→ GitHubのPRデータを参照して返答が来れば成功
```

---

## ベストプラクティス

1. **最初の20分は待つ:**
```
# 連携後すぐは全データが収集されていない
# 20分後に再度話しかけると格段に回答が改善される
```

2. **Memory Treeを定期的に確認:**
```bash
# ~/openhuman/memory/ にObsidian形式で保存される
# Obsidianで開いて構造を確認・必要に応じて手動編集
open ~/openhuman/memory/ -a Obsidian
```

3. **重要なコンテキストを明示的に追加:**
```markdown
<!-- ~/openhuman/memory/context/work-context.md -->
# 私のワークコンテキスト
- 職種: フルスタックエンジニア
- 主要言語: TypeScript, Python
- チーム: 5人（山田・田中・鈴木・佐藤・自分）
- 現在のプロジェクト: 新規決済機能（締切: 6月末）
```

4. **プライバシーが心配なサービスは除外:**
```
Settings > Integrations > [サービス名] > Exclude from Memory
# 個人的なGmailは連携しないなど、選択的に設定
```

---

## セキュリティ観点

### ローカル暗号化の確認
```bash
# Memory Treeの暗号化状態を確認
openhuman security status
# → "All data encrypted with AES-256-GCM" が表示されれば安全

# 暗号化キーのバックアップ
openhuman security export-key ~/backup/openhuman.key
# → このキーを安全な場所に保管（なくすとデータが復号できなくなる）
```

### OAuthトークンの管理
- 連携サービスのOAuthトークンはOSのキーチェーンに保存される
- 定期的に使っていないサービスの連携を解除する

### AIへの送信データ
- デスクトップマスコットの会話内容はLLM APIに送信される
- 機密情報を含む会話にはローカルOllama（ローカルモデル）を使用する

```
Settings > AI Provider > Local (Ollama)
→ コードが機密な場合はOllamaに切り替え
```

### 不要になった場合のデータ削除
```bash
# Memory Treeを完全削除
rm -rf ~/openhuman/memory/

# OAuthの連携を全解除
openhuman integrations revoke-all
```

---

## ペルソナ設定と使い方

### ペルソナ：鈴木 彩（29歳・スタートアップCTO・週3在宅勤務）

鈴木さんはGitHub・Notion・Slack・Gmailを常に5タブ開きながら仕事しており、「情報の断片化」が最大のストレスだった。特に「このPRの背景どこかに書いた気がする…」「先月の議事録どこ？」という検索コストが蓄積していた。

```bash
# インストール後、主要5サービスを連携（15分）
# → 20分後にデータ収集完了

# 朝のスタンドアップ準備（以前5分 → 1分）
"今日のスタンドアップ用に昨日の進捗をまとめて"
→ GitHub（コミット・PR）+ Notion（タスク更新）+ Slack（メッセージ）を統合して要約

# コードレビュー中
"PR #142の背景を教えて。なぜこの実装を選んだの？"
→ GitHubのPR description + 関連Issue + Slackの議論を統合して回答

# 採用面接の準備
"次の応募者のレジュメをNotionに入れた。技術面接の質問を考えて"
→ Notion内のレジュメを読んで、職種・スキルに合わせた質問リストを生成

# 3ヶ月後の変化:
# - 「情報を探す」時間: 週3時間 → 週30分
# - PRコンテキスト共有が不要に（全員がAIに聞けばわかる）
# - 新メンバーのオンボーディング時間: 2週間 → 1週間
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| hermes-agent (#21) | VPSで動くサーバーサイドのパーソナルAI（Telegram連携重視） |
| Rewind AI | 画面録画ベースの記憶強化ツール（有料） |
| Mem.ai | 自動整理型ノートアプリ（クラウド） |
| Obsidian + AI plugin | メモ管理特化（OpenHumanのMemory Treeの形式と互換） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/tinyhumansai/openhuman)
