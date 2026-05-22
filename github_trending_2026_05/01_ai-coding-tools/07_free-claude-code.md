# Alishahryar1/free-claude-code

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [Alishahryar1/free-claude-code](https://github.com/Alishahryar1/free-claude-code) |
| 言語 | Python |
| 総スター数 | 27,479 |
| 本日のスター | +450 |
| ライセンス | MIT |
| トレンド順位 | #27相当（2026/05/22） |
| カテゴリ | AIコーディングツール / コスト最適化 |

---

## 概要

Claude CodeのAPIリクエストをAnthropicバックエンド以外（OpenRouter・Ollama・DeepSeek・Kimi等）にルーティングするオープンソースプロキシ。Claude Codeの操作感・UIはそのままに、無料または低コストのモデルで動作させる。

11以上のバックエンドプロバイダーをサポートし、Opus/Sonnet/Haikuリクエストをそれぞれ別のモデルにルーティングする柔軟な設定が可能。

---

## 対応バックエンドプロバイダー

| プロバイダー | 特徴 |
|-------------|------|
| OpenRouter | 無料枠あり、多数のモデルを選択可能 |
| Ollama | 完全ローカル実行・無料 |
| DeepSeek | 低コスト・高性能 |
| NVIDIA NIM | GPU加速推論 |
| Kimi | コンテキスト長に強み |
| llama.cpp | ローカルGGUFモデル |
| Anthropic | 元のバックエンド（フォールバック用） |

---

## あるとないとの違い

| 観点 | ない場合 | ある場合 |
|------|----------|----------|
| Claude Codeの費用 | 月$20〜$100+（Anthropic API） | 無料〜数百円（OpenRouter無料枠 / Ollama） |
| 操作感 | Claude Code UI | Claude Code UI（変わらない） |
| モデル選択 | ClaudeのみAnthropicが決定 | 用途別に最適なモデルを自分で選択 |
| データプライバシー | Anthropicにコードが送信される | ローカルOllama使用時はコードが外部に出ない |

---

## 環境構築方法

### 前提条件
- Python 3.10以上
- Claude Code インストール済み
- 使用するバックエンドのAPIキー（OpenRouterなら無料登録で取得可）

### インストール手順
```bash
# リポジトリのクローン
git clone https://github.com/Alishahryar1/free-claude-code
cd free-claude-code

# 依存関係インストール
pip install -r requirements.txt

# 設定ファイルの作成
cp config.example.yaml config.yaml
```

### 設定例（OpenRouter使用）
```yaml
# config.yaml
backend: openrouter
api_key: "sk-or-..."
model_mapping:
  opus: "meta-llama/llama-3.1-405b-instruct:free"
  sonnet: "anthropic/claude-3.5-sonnet"
  haiku: "google/gemini-flash-1.5:free"
```

### 設定例（完全ローカル）
```yaml
backend: ollama
base_url: "http://localhost:11434"
model_mapping:
  opus: "codellama:70b"
  sonnet: "codellama:34b"
  haiku: "codellama:13b"
```

### 起動とClaude Code連携
```bash
# プロキシサーバーを起動
python main.py  # デフォルト: localhost:8080

# Claude Codeの環境変数を設定してプロキシ経由に向ける
export ANTHROPIC_BASE_URL="http://localhost:8080"
claude  # 通常通りClaude Codeを起動
```

### 動作確認
```bash
# 簡単なテスト
curl http://localhost:8080/health
# → {"status": "ok", "backend": "openrouter"}
```

---

## ベストプラクティス

1. **用途でモデルを使い分ける:**
```yaml
model_mapping:
  opus: "anthropic/claude-opus-4-7"      # 複雑なタスクは本物のClaude
  sonnet: "deepseek/deepseek-coder-v3"    # コーディングは高コスパモデル
  haiku: "google/gemini-flash-1.5:free"   # 簡単な質問は無料モデル
```

2. **重要な作業は本物のAnthropicにフォールバック:**
```yaml
fallback:
  enabled: true
  on_error: anthropic  # エラー時は本家Anthropicに自動フォールバック
```

3. **機密コードはOllamaでローカル実行:**
```bash
# 社内秘コードを扱う場合は完全ローカルに切り替え
export FREE_CLAUDE_BACKEND=ollama
```

4. **レート制限を監視:**
```bash
python main.py --log-level info  # リクエストログを確認
```

---

## セキュリティ観点

### 重大なリスク
- **モデルの品質差:** Anthropic公式モデルと比べてセキュリティや倫理的な制約が緩いモデルが混在する可能性
- **APIキー管理:** `config.yaml` に複数プロバイダーのAPIキーが集中するため、このファイルの漏洩は全サービスへの不正アクセスにつながる
- **ローカルプロキシの脆弱性:** localhost:8080 が他のプロセスからアクセス可能

### 対策
```bash
# config.yaml を .gitignore に追加（必須）
echo "config.yaml" >> .gitignore

# 環境変数でAPIキーを管理（config.yamlに書かない）
export OPENROUTER_API_KEY="sk-or-..."

# プロキシのポートを認証付きで公開しない
# 必ずlocalhost限定で使用する
```

### 利用規約の確認
- OpenRouter等の利用規約でAnthropicのシステムプロンプト・ツール定義を他サービスに送信することが許可されているか確認する
- 企業での使用前に法務確認を推奨

---

## ペルソナ設定と使い方

### ペルソナ：李 志遠（22歳・大学院生・AI研究室所属）

李さんはClaude Codeを使いたいが、研究室の予算でAnthropicのAPIキーに月$50は出せない。かといってCursorやCopilotの操作感はClaude Codeより劣る気がしていた。

```bash
# 1. OpenRouterで無料アカウントを作成（1分）
# 2. free-claude-codeをセットアップ

# 平日の研究作業（無料枠で十分）
python main.py --backend openrouter  # 無料モデルで動作

# 重要な論文用コードは本物のClaude
export FREE_CLAUDE_BACKEND=anthropic  # 一時的に切り替え

# 機密データを含む実験コード
export FREE_CLAUDE_BACKEND=ollama     # ローカルで処理

# 月のAPI費用: $50 → $5以下
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| sub2api (#31) | サブスクをチームでシェアするゲートウェイ |
| LiteLLM | マルチプロバイダーAPIプロキシ（汎用） |
| OpenRouter | 多数のモデルを統一APIで使えるプロキシサービス |

---

## 参考リンク

- [公式リポジトリ](https://github.com/Alishahryar1/free-claude-code)
- [OpenRouter（無料モデル一覧）](https://openrouter.ai/models?max_price=0)
- [Ollama（ローカルモデル実行）](https://ollama.ai/)
