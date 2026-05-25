# wavetermdev/waveterm

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [wavetermdev/waveterm](https://github.com/wavetermdev/waveterm) |
| 言語 | TypeScript / Go |
| 総スター数 | 29,743 |
| 本日のスター | +521 |
| ライセンス | Apache 2.0 |
| トレンド順位 | #20相当（2026/05/22） |
| カテゴリ | インフラ・開発ツール / AIターミナル |

---

## 概要

AI統合・SSH持続接続・ファイルエディタ・ウェブブラウザをすべて1つのウィンドウに統合したオープンソースターミナル。iTerm2・Terminal.appの代替として、開発者の「ターミナル・エディタ・ブラウザを行き来する」という煩雑さを解消する。

SSH接続が切断されても自動再接続してセッションを継続（tmuxなしで）、AIアシスタントにターミナルの出力を直接解析させる機能が特徴。TypeScript（Electron）+ Go（バックエンド）構成。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **タブ/ペイン管理** | 複数ターミナル・エディタ・ブラウザをタブ/分割画面で管理 |
| **SSH持続接続** | 切断されても自動再接続・セッション状態を保持 |
| **ファイルエディタ** | ターミナル内蔵エディタ（VS Code風）でリモートファイルを直接編集 |
| **インラインブラウザ** | サイドパネルでWebページを確認しながらターミナルを操作 |
| **AIアシスタント** | ターミナル出力をLLMに解析させてエラーを自動診断 |
| **ブロック共有** | ターミナル出力・設定をチームに共有可能 |

---

## あるとないとの違い

| 観点 | 従来のターミナル（iTerm2等） | WaveTerm |
|------|---------------------------|---------|
| SSH切断時 | セッションが失われる（tmuxが必要） | 自動再接続でセッション継続 |
| リモートファイル編集 | sftp/scpでローカルにコピーして編集→アップロード | ターミナル内でそのまま編集 |
| エラーの調査 | エラーコードをコピーしてブラウザで検索 | AIがターミナル出力を解析して即座に診断 |
| コンテキスト切替 | ターミナル/エディタ/ブラウザをAlt-Tabで切替 | 1ウィンドウですべて完結 |

---

## 環境構築方法

### インストール（Mac/Windows/Linux）

```bash
# Mac（Homebrew）
brew install --cask waveterm

# または公式サイトからインストーラをダウンロード
# https://www.waveterm.dev/download

# Linux（AppImage）
chmod +x WaveTerm-*.AppImage
./WaveTerm-*.AppImage

# Windows
# インストーラー（.exe）を実行
```

### AI機能の設定
```bash
# WaveTermを起動後、設定（Cmd/Ctrl+,）を開く

# AI設定で以下を選択:
# Provider: Anthropic
# API Key: sk-ant-...
# Model: claude-opus-4-7

# または OpenAI
# Provider: OpenAI
# API Key: sk-...
# Model: gpt-4o

# ローカルモデル（プライバシー重視）
# Provider: Ollama
# Base URL: http://localhost:11434
# Model: llama3.1:8b
```

### SSH設定の移行
```bash
# 既存の~/.ssh/configを自動で読み込み
# WaveTermを起動すると既存のSSHホストが自動で表示される

# 新しいSSHホストの追加
# Cmd+K で接続ダイアログを開く
# host: your-server.com
# user: ubuntu
# identity_file: ~/.ssh/mykey.pem
```

### 動作確認
```bash
# ターミナルで通常コマンドが動作するか確認
ls -la
# → ファイルリストが表示されれば成功

# AIアシスタントのテスト
# エラーを含むコマンドを実行後、ブロックを右クリック > "AIに解析"
```

---

## ベストプラクティス

1. **エラーをAIに即座に解析させる:**
```bash
# コマンド実行後にエラーが発生したら
# 出力ブロックを右クリック > "AIに解析"
# または Cmd+Shift+A で現在の出力を解析

# AIが以下を返す:
# 「エラー原因: libssl.so.1.1が見つかりません
#  解決策: sudo apt install libssl1.1
#  または apt-cache search libssl で利用可能なバージョンを確認」
```

2. **SSH持続接続でリモート開発を効率化:**
```bash
# ~/.config/waveterm/config.yaml
ssh:
  reconnect_on_disconnect: true
  reconnect_interval_seconds: 5
  max_reconnect_attempts: 10

# 新幹線や電車でも安心
# → WiFiが切れても自動再接続してコマンド履歴が残る
```

3. **リモートファイルを直接編集:**
```
# SSHセッション内で:
# Cmd+E でファイルエディタが開く
# または:
wv edit /etc/nginx/nginx.conf

# → VS Codeのような編集画面がターミナル内に表示
# → 保存するとリモートサーバーのファイルが更新される
# sftp/scpが不要
```

4. **複数サーバーの並列作業:**
```
# 分割画面設定例:
# 左上: 本番サーバーのログ（tail -f）
# 右上: ステージングサーバー
# 左下: ローカル開発
# 右下: AIアシスタントとの対話

# Cmd+D で画面を分割
# Cmd+T で新しいタブを作成
```

---

## セキュリティ観点

### SSH鍵の管理
```bash
# WaveTermは~/.ssh/の鍵を使用
# 秘密鍵のパーミッション確認
chmod 600 ~/.ssh/id_ed25519
chmod 700 ~/.ssh

# パスフレーズ付き鍵を推奨（SSH Agentで利便性を保つ）
ssh-add ~/.ssh/id_ed25519
```

### AIへの情報送信
```bash
# AIアシスタントは選択した出力をLLM APIに送信
# 機密情報（パスワード・APIキー）が出力に含まれる場合は注意

# ローカルモデルを使用してデータを外部に送らない設定
# Provider: Ollama（ローカルLLM）
# → コマンド出力が外部サービスに送信されない
```

### ターミナルの出力保存
```bash
# WaveTermはターミナル出力を保存しているため
# 機密情報を含むコマンドの出力は定期的に削除する
# 設定 > 履歴の削除 で過去の出力をクリア
```

---

## ペルソナ設定と使い方

### ペルソナ：西田 康平（31歳・バックエンドエンジニア・5台のサーバーをSSH管理）

西田さんは本番・ステージング・開発・DB・監視の5サーバーを管理している。iTerm2で5つのタブを開き、tmuxでセッションを管理し、VS Codeでリモート編集、Chromeでログを確認という4つのウィンドウを行き来していた。「Alt-Tabしすぎてどのウィンドウがどれかわからなくなる」が口癖だった。

```bash
# WaveTermの設定:

# タブ1: 本番サーバーグループ
# 左ペイン: prod-web-01 (tail -f /var/log/nginx/error.log)
# 右ペイン: prod-db-01 (watch -n 5 'mysql -e "SHOW PROCESSLIST"')

# タブ2: デプロイ作業
# 上ペイン: GitHub Actions の出力（ウォッチ中）
# 中ペイン: staging サーバー
# 下ペイン: AIアシスタント

# 典型的なデプロイ作業:
# 1. ステージングにデプロイ
ssh staging
cd /app && git pull && ./deploy.sh

# 2. エラー発生時
# deploy.sh のエラー出力を右クリック > "AIに解析"
# AI: 「npm install が失敗しています。node_modules の権限エラーです。
#       sudo chown -R $USER:$USER node_modules で解決できます」

# 3. リモートのnginx.confを即座に編集
wv edit /etc/nginx/sites-available/myapp.conf
# → エディタで編集 → 保存 → nginx -t → nginx -s reload

# 4. 本番の監視しながらステージングで並行作業
# 新幹線でWiFiが切れても5秒後に自動再接続
# → 作業継続

# 西田さんの感想:
# 「Alt-Tabが1/3に減った。SSH切断を気にしなくなった。
#  エラーをAIに投げる癖がついたら調査時間が半減した」
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| iTerm2 | Mac定番ターミナル（AI機能なし・SSH持続なし） |
| Warp | AIターミナル（クラウド依存・プロプライエタリ） |
| Zellij | ターミナルマルチプレクサ（UI統合なし） |
| tmux | SSH持続接続（GUI・AI機能なし） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/wavetermdev/waveterm)
- [公式サイト](https://www.waveterm.dev/)
