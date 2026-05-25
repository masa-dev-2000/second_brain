# can1357/oh-my-pi

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [can1357/oh-my-pi](https://github.com/can1357/oh-my-pi) |
| 言語 | TypeScript |
| 総スター数 | 5,827 |
| 本日のスター | +483 |
| ライセンス | MIT |
| トレンド順位 | #11（2026/05/22） |
| カテゴリ | AIコーディングツール / ターミナルエージェント |

---

## 概要

ターミナル向けAIコーディングエージェント。Mario Zechnerの「Pi」プロジェクトのフォークで、LSP（Language Server Protocol）と実デバッガー（lldb / dlv / debugpy）を組み込んでいる。

最大の特徴は**ハッシュアンカー方式の差分編集**：行番号ではなくコンテンツのハッシュで変更箇所を特定するため、大規模ファイルでも失敗が少なくトークン消費が約61%少ない。

40以上のLLMプロバイダー・100以上のモデルに対応し、サブエージェントによる並列タスク実行も可能。

---

## 主な機能

### コード操作（Claude Codeとの差別化点）
| 機能 | 詳細 |
|------|------|
| **ハッシュアンカー編集** | 行番号でなくコンテンツハッシュで変更位置を特定、ファイル変更後も安定 |
| **LSP統合リファクタリング** | `rename symbol` がimport・再エクスポートを含む全参照を一括更新 |
| **ast-grep構造的書き換え** | プレビュー→承認ワークフローで安全に大規模書き換え |
| **実デバッガー** | lldb（C/C++/Rust）、dlv（Go）、debugpy（Python）でブレークポイント・スタック確認 |

### その他32のビルトインツール
- ファイル操作、Bash実行、Web検索・スクレイピング
- コードベース検索（ripgrep統合）
- 永続的なPython・JS実行環境（ツール再入力可能）
- ブラウザ自動化（ステルスモード対応）

---

## あるとないとの違い

| 観点 | 標準的なAIコーディングツール | oh-my-pi |
|------|------------------------------|---------|
| 大ファイルの部分編集 | 行番号ズレで失敗しやすい | ハッシュアンカーで安定 |
| 関数名変更 | 呼び出し側を見落とす | LSP経由で全参照を一括更新 |
| デバッグ | ログ追加→推測 | 実デバッガーでスタックを直接確認 |
| トークン使用量 | 標準 | 約39%削減（ハッシュ方式の効果） |
| 対応LLMモデル | 限定的 | 100+モデル（Claude/GPT/Gemini/ローカル） |

---

## 環境構築方法

### 前提条件
- Node.js 18以上
- 使用するLLMのAPIキー（Claude / OpenAI / Gemini / Ollamaのいずれか）
- オプション: lldb（Rust/C++デバッグ）、delve（Goデバッグ）、debugpy（Pythonデバッグ）

### インストール手順
```bash
# npm経由
npm install -g oh-my-pi

# または Shell スクリプト（Mac/Linux）
curl -fsSL https://ohmypi.sh | sh

# または Homebrew（Mac）
brew install can1357/tap/omp
```

### 初期設定
```bash
# 設定ファイルを生成
omp init

# ~/.omp/config.json を編集してAPIキーとモデルを設定
```
```json
{
  "provider": "anthropic",
  "api_key": "sk-ant-...",
  "model": "claude-sonnet-4-6"
}
```

### 動作確認
```bash
omp --version
omp "Hello, world と出力するPythonスクリプトを作って"
```

---

## ベストプラクティス

### インストール
```bash
# npm
npm install -g oh-my-pi

# または Shell スクリプト
curl -fsSL https://ohmypi.sh | sh

# または Homebrew（Mac）
brew install can1357/tap/omp
```

### 設定（`~/.omp/config.json`）
```json
{
  "model": "claude-opus-4-7",         // メインモデル
  "fast_model": "claude-haiku-4-5",   // 簡単なタスク用（コスト削減）
  "subagent_model": "claude-sonnet-4-6", // サブエージェント用
  "max_tokens": 8192,
  "tools": {
    "browser": true,
    "debugger": true,
    "lsp": true
  }
}
```

### 効果的な使い方
1. **LSPリファクタリングは事前に保存を確認:**
```bash
omp "rename function processPayment to handlePaymentProcessing"
# → LSPがワークスペース全体をスキャンして一括変更
# → 変更前にgit commitしておくことを推奨
```

2. **デバッガーでのワークフロー:**
```bash
omp "このRustコードのセグフォルトの原因をlldbで調べて"
# → omp がlldbを起動、実行してフォルト地点で停止、スタックトレースを解析
```

3. **並列サブエージェント活用:**
```bash
omp "ユーザー管理モジュールとオーダー管理モジュールを並列でリファクタリングして。
     お互いに依存関係はないので同時に進めていい"
# → 2つのサブエージェントが並列実行 → 作業時間が半分に
```

4. **コスト最適化:**
```
# 単純なタスクはfast_modelを使うよう指示
/model fast
omp "このファイルのコメントを日本語から英語に翻訳して"
```

---

## セキュリティ観点

### デバッガーのリスク
- **プロセスへのアタッチ権限:** dlv/lldb/debugpyはシステムプロセスにアタッチできるため、意図しないプロセスを操作するプロンプトに注意
- **メモリダンプ:** デバッガーは任意のメモリを読めるため、機密情報（パスワード・鍵）が漏洩するリスクがある

### ブラウザ自動化のリスク
- **ステルスモード:** 検出回避機能があるため、利用規約違反のサイトスクレイピングに悪用されないよう注意
- 使用するサイトの利用規約を確認すること

### LLMプロバイダーの選択
```json
// 機密コードはローカルモデルを使用する設定例
{
  "model": "ollama/codellama:70b",  // ローカル実行
  "rules": [
    "機密情報を含むファイルは外部モデルに送信しない"
  ]
}
```

### 推奨事項
- 本番サーバー上での実行は禁止し、ローカル開発環境に限定する
- サブエージェント実行時は `--dry-run` で事前確認する

---

## ペルソナ設定と使い方

### ペルソナ：三浦 大輔（29歳・OSS開発者・Rustとgoの使い手）

三浦さんは個人でRustとGoのOSSライブラリを開発・保守している。「C言語のセグフォルトをAIに調べてもらおうとしたが、ログを貼り付けるだけでは根本原因を特定できなかった」という経験から、デバッガー統合のあるエージェントを探していた。

#### oh-my-piでの日常的な使い方

```bash
# Rustコードのデバッグ
omp "src/parser.rs の241行目付近でpanicが起きている。
     lldbでテストを実行してスタックトレースを確認して原因を特定して"

# → omp がcargo testを lldb経由で実行
# → panic地点でスタック確認
# → 「BorrowErrorが発生。RefCellの借用が解放される前に再借用している」と特定
# → 修正コードを提示・適用

# 大規模リファクタリング
omp "ErrorHandlerトレイトをResultベースからErrorKindベースに変更して。
     全実装箇所をLSP経由で一括更新して"

# → LSPが全トレイト実装を列挙 → 順番に更新 → コンパイルエラーを修正 → 完了

# 並列作業
omp "テストスイートを書きながら、別のサブエージェントにドキュメントを更新させて"
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| Claude Code | Anthropic公式・高品質だが1プロバイダーのみ |
| Aider | マルチモデル対応AIコーディングツール（デバッガー統合なし） |
| Cursor | GUI IDE（ターミナルネイティブではない） |
| openai/codex (#29) | OpenAI公式ターミナルエージェント |

---

## 参考リンク

- [公式リポジトリ](https://github.com/can1357/oh-my-pi)
- [オリジナルPiプロジェクト](https://github.com/mariozechner/pi)
- [ast-grep](https://ast-grep.github.io/)
