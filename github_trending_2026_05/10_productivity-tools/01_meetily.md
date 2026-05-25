# Zackriya-Solutions/meetily

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [Zackriya-Solutions/meetily](https://github.com/Zackriya-Solutions/meetily) |
| 言語 | Rust |
| 総スター数 | 12,214 |
| ライセンス | MIT |
| カテゴリ | 生産性ツール / AIミーティングアシスタント |

---

## 概要

Meetilyは、プライバシーファーストを掲げるAIミーティングアシスタント。Parakeet/Whisperモデルによるリアルタイム文字起こし（標準Whisperの4倍速）、話者ダイアライゼーション（誰が話したか識別）、Ollamaによるローカル要約をすべてローカルで処理し、クラウドへのデータ送信を一切行わない。

OtterAI・Fireflies・Granitesなど既存のAI議事録ツールは音声データをクラウドに送信するため、機密性の高い経営会議・法務相談・医療面談には使いにくかった。Meetilyはこの課題を解決し、macOSとWindowsの両方で動作する。Rustで書かれた高速なバックエンドが特徴で、低スペックのマシンでもリアルタイム処理が可能。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **リアルタイム文字起こし** | Parakeet/Whisperモデルによる4倍速の高速文字起こし |
| **話者ダイアライゼーション** | 誰がいつ話したかをリアルタイムに識別・ラベル付け |
| **ローカルAI要約** | Ollamaを使用してミーティング内容をローカルで要約 |
| **完全ローカル処理** | 音声データ・テキストが外部サーバーに送信されない |
| **クロスプラットフォーム** | macOS・Windows両対応 |
| **エクスポート機能** | 文字起こし・要約をMarkdown・TXTでエクスポート |
| **議題・アクションアイテム抽出** | 要約から議題とタスクを自動抽出 |

---

## あるとないとの違い

| 観点 | OtterAI / Firefliesなどクラウド型 | Meetily |
|------|----------------------------------|---------|
| データプライバシー | 音声がクラウドサーバーに送信される | 完全ローカル処理、外部送信なし |
| 機密会議への適用 | NDA・社内規定上リスクあり | 安心して使用可能 |
| オフライン使用 | インターネット必須 | ローカルモデルでオフライン動作 |
| 月額コスト | 1,500〜5,000円/月 | 無料（ハードウェアのみ） |
| カスタマイズ | 提供機能のみ | 要約プロンプトを自由に変更可能 |
| 処理速度 | ネットワーク遅延あり | Rustバックエンドで低遅延処理 |

---

## 環境構築方法

### 前提条件

```bash
# macOS
xcode-select --install  # Xcodeコマンドラインツール

# Windows
# Visual C++ Build Tools が必要
# https://visualstudio.microsoft.com/visual-cpp-build-tools/ からインストール

# Ollamaのインストール（要約機能に必要）
# macOS
brew install ollama
# または https://ollama.ai からダウンロード

# 要約用モデルのダウンロード
ollama pull llama3.1:8b
# 日本語処理の場合はより大きなモデルを推奨
ollama pull llama3.1:70b  # GPU VRAM 40GB以上必要
# または軽量な日本語対応モデル
ollama pull gemma2:9b
```

### バイナリからのインストール

```bash
# GitHubリリースページからOSに対応したバイナリをダウンロード
# https://github.com/Zackriya-Solutions/meetily/releases

# macOS (Apple Silicon)
curl -L https://github.com/Zackriya-Solutions/meetily/releases/latest/download/meetily-macos-aarch64.dmg -o meetily.dmg
open meetily.dmg  # ドラッグ&ドロップでApplicationsフォルダにインストール

# Windows
# meetily-windows-x86_64.msi をダウンロードして実行
```

### ソースからビルド

```bash
# Rustツールチェーンが必要
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

git clone https://github.com/Zackriya-Solutions/meetily.git
cd meetily

# ビルド
cargo build --release

# 実行
./target/release/meetily
```

### 設定ファイル

```toml
# ~/.config/meetily/config.toml

[transcription]
model = "parakeet"          # "parakeet" (高速) または "whisper-large-v3"
language = "ja"             # 言語コード（日本語の場合）
device = "cpu"              # "cpu" または "cuda" (NVIDIA GPU)

[summarization]
provider = "ollama"
model = "llama3.1:8b"
endpoint = "http://localhost:11434"

[output]
directory = "~/Documents/Meetily"
format = ["markdown", "txt"]
auto_save = true

[diarization]
enabled = true
max_speakers = 10
```

---

## ベストプラクティス

1. **会議前に話者名を事前設定して議事録の品質を上げる:**
```toml
# config.toml の speakers セクション
[diarization.speakers]
# 話者名を事前に定義（話者IDを自動割り当て後に名前でマッピング）
auto_label = true
label_format = "{name}さん"
known_speakers = [
    { id = "SPEAKER_00", name = "田中部長" },
    { id = "SPEAKER_01", name = "佐藤課長" },
    { id = "SPEAKER_02", name = "山田（自分）" },
]
```

2. **要約プロンプトをユースケースに合わせてカスタマイズする:**
```toml
# config.toml
[summarization.prompts]
default = """
以下のミーティング文字起こしを分析して、以下の形式で要約してください:

## 会議概要
（3〜5行で会議の目的と結果を要約）

## 主な議題と決定事項
（箇条書きで各議題の決定内容を記載）

## アクションアイテム
（担当者・期限・タスク内容の表形式）

## 次回会議に持ち越す事項
（未解決の課題）

文字起こし:
{transcript}
"""

legal_meeting = """
以下の法務相談の文字起こしから、法的な観点で重要な発言・合意事項・懸念事項を
整理してください。個人を特定できる情報は[REDACTED]で置き換えてください。

{transcript}
"""
```

3. **出力をObsidianなどのナレッジベースと連携させる:**
```bash
# Meetily の出力ディレクトリをObsidianのVaultに設定
# config.toml
# [output]
# directory = "~/Documents/ObsidianVault/Meetings"

# 自動的に日付フォルダに整理
# 出力例: ~/Documents/ObsidianVault/Meetings/2026-05/2026-05-22_週次定例.md
```

4. **GPU加速でリアルタイム処理性能を最大化する:**
```toml
# NVIDIA GPU環境での設定
[transcription]
model = "whisper-large-v3"  # GPUがある場合は大型モデルが使える
device = "cuda"
compute_type = "float16"    # VRAM節約のため半精度を使用
batch_size = 16             # バッチサイズを増やして高速化

# Apple Silicon (M1/M2/M3) での設定
[transcription]
device = "mps"              # Metal Performance Shaders
compute_type = "float16"
```

---

## セキュリティ観点

### データの完全ローカル化の確認

```bash
# ネットワーク通信を監視してデータ送信がないか確認（macOS）
sudo lsof -i -P | grep meetily
# → 何も表示されなければ外部通信なし

# Ollama の外部通信を遮断（念のため）
# /etc/hosts に追記してOllamaのサーバーへのアクセスを制限
# （セルフホスト環境のみ、通常不要）
```

### 録音データの取り扱い

```bash
# 一時ファイルの暗号化（macOSのFileVaultが有効な場合は不要）
# Meetilyの一時音声ファイルは処理後に自動削除されるが
# より安全にするためtmpfsを使う

# Linux環境でのtmpfs使用例
sudo mount -t tmpfs -o size=2G tmpfs /tmp/meetily_audio

# 会議後は必ず一時ファイルを手動削除
find /tmp/meetily* -type f -delete 2>/dev/null
```

### 議事録ファイルの保護

- 出力ディレクトリにはローカルディスク暗号化（FileVault/BitLocker）を使用する
- 機密会議の議事録は共有ドライブに保存せず、ローカルのみに保持する
- アクセス権は最小限の権限（本人のみ）に設定する

---

## ペルソナ設定と使い方

### ペルソナ：鈴木 修一（45歳・製造業の経営企画部長・M&A検討の取締役会議を担当）

鈴木さんはM&A候補企業との秘密保持契約（NDA）下での交渉会議を複数回担当している。OtterAIを試したが「音声データが海外サーバーに送られる」という情報セキュリティ部門の懸念で導入却下。会議後の議事録作成に毎回1〜2時間かかっており、Meetilyのローカル処理に着目した。

```bash
# 経営会議用の設定を準備
mkdir -p ~/.config/meetily/profiles/

cat > ~/.config/meetily/profiles/executive_meeting.toml <<'EOF'
[transcription]
model = "parakeet"
language = "ja"
device = "mps"  # MacBook Pro M3 Max

[diarization]
enabled = true
known_speakers = [
    { id = "SPEAKER_00", name = "代表取締役 CEO" },
    { id = "SPEAKER_01", name = "取締役CFO" },
    { id = "SPEAKER_02", name = "鈴木（自分）" },
    { id = "SPEAKER_03", name = "顧問弁護士 A氏" },
    { id = "SPEAKER_04", name = "FA担当 B氏" },
]

[summarization]
provider = "ollama"
model = "llama3.1:70b"  # 高精度要約のため大型モデル

[summarization.prompts]
default = """
以下はM&Aに関する役員会議の文字起こしです。
機密情報を含むため、以下の形式で要約してください。

## 会議日時・参加者
（文字起こしから推測）

## 討議事項と決定内容
（各議題の賛否・決定事項）

## 財務・法務上の合意事項
（具体的な数値・条件は正確に記録）

## 次のアクションと担当者
（担当者・締め切り・タスク）

## 機密保護事項
（外部に開示してはならない情報のリスト）

文字起こし:
{transcript}
"""

[output]
directory = "/Volumes/EncryptedDisk/MeetingMinutes/MA"
format = ["markdown"]
auto_save = true
filename_format = "{date}_{meeting_type}_議事録"
EOF

# 会議開始時
meetily --profile executive_meeting start

# 会議終了後、自動で議事録生成
# → /Volumes/EncryptedDisk/MeetingMinutes/MA/2026-05-22_executive_meeting_議事録.md
```

**導入前後の変化:**
- 導入前: 手書きメモ → 会議後1〜2時間かけて議事録作成、情報セキュリティリスクから録音もできず
- 導入後: Meetilyが自動文字起こし・要約 → 会議後5分で確認・修正するだけ、完全ローカル処理で情報セキュリティ部門も承認

---

## 周辺情報

### 類似・関連プロジェクト

| ツール | 特徴 |
|--------|------|
| OtterAI | 高精度クラウド型議事録、音声データはクラウドに送信 |
| Fireflies.ai | Zoom/Teams連携が得意なクラウド型 |
| whisper.cpp | Whisperのローカル実行C++実装、バックエンドとして使われることも |
| Ollama | Meetilyの要約バックエンド、ローカルLLM実行基盤 |
| AppFlowy (#02) | オープンソースのNotion代替、議事録の保存先として相性よし |

---

## 参考リンク

- [公式リポジトリ](https://github.com/Zackriya-Solutions/meetily)
- [リリースページ（バイナリダウンロード）](https://github.com/Zackriya-Solutions/meetily/releases)
- [Ollama公式サイト](https://ollama.ai)
- [Parakeetモデル（NVIDIA）](https://github.com/NVIDIA/NeMo)
- [OpenAI Whisper](https://github.com/openai/whisper)
