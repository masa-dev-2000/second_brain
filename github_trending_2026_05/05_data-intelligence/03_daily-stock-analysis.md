# ZhuLinsen/daily_stock_analysis

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [ZhuLinsen/daily_stock_analysis](https://github.com/ZhuLinsen/daily_stock_analysis) |
| 言語 | Python |
| 総スター数 | 38,326 |
| 本日のスター | +226 |
| ライセンス | MIT |
| トレンド順位 | #33相当（2026/05/22） |
| カテゴリ | データ・インテリジェンス / AI株式分析 |

---

## 概要

A株（中国）・香港株・米国株の市場データ・テクニカル指標・ニュース・決算情報を自動収集し、LLMが統合分析してWeChat・Telegram・Discord・Feishu・メールに毎日レポートを配信するシステム。GitHub Actionsで無料で自動実行できる。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **データ収集** | 株価・出来高・テクニカル指標（MA/RSI/MACD）を自動取得 |
| **ニュース統合** | 企業ニュース・決算発表・規制動向を収集 |
| **AI分析** | LLMが全データを統合して主要結論・リスク・シグナルを生成 |
| **通知チャネル** | WeChat・Telegram・Discord・Feishu・メール |
| **Agent質問** | 特定銘柄について深掘り質問できるAIエージェント機能 |
| **無料実行** | GitHub Actionsのcronで完全無料で毎日実行可能 |

---

## あるとないとの違い

| 観点 | ない場合 | ある場合 |
|------|----------|----------|
| 朝の情報収集 | 各ニュースサイト・証券会社アプリを30〜60分チェック | スマホに分析済みのブリーフィングが届いている |
| 複数市場の把握 | 市場ごとに別々に確認 | A株・香港株・米国株を1通のレポートで把握 |
| ニュースとチャートの連動 | 別々で確認・頭の中で関連づける | AIが自動で関連づけて提示 |
| 銘柄の深掘り | 自分で検索・分析 | AIエージェントに「この銘柄のリスクは？」と質問 |

---

## 環境構築方法

### 方法1：GitHub Actions（推奨・無料・ゼロサーバー管理）

```bash
# 1. リポジトリをフォーク
# GitHub.com で ZhuLinsen/daily_stock_analysis を Fork

# 2. Secretsにキーを設定
# Settings > Secrets and variables > Actions > New repository secret
# 以下を追加:
# - ANTHROPIC_API_KEY: AIの分析に使用
# - TELEGRAM_BOT_TOKEN: 通知に使用
# - TELEGRAM_CHAT_ID: 送信先のチャットID

# 3. ウォッチリストの設定
# config/stocks.yaml を編集
```

### config/stocks.yaml の設定
```yaml
watchlists:
  us_stocks:
    - NVDA    # NVIDIA
    - AAPL    # Apple
    - TSLA    # Tesla
    - META    # Meta
  
  hk_stocks:
    - 9988.HK  # Alibaba
    - 0700.HK  # Tencent
  
  cn_stocks:
    - 600519  # 貴州茅台
    - 000858  # 五粮液

notification:
  telegram:
    enabled: true
  discord:
    webhook_url: "https://discord.com/api/webhooks/..."
  
schedule:
  daily_report: "0 21 * * 1-5"  # 月〜金 21:00 UTC（日本時間翌6:00）
```

### 方法2：Docker（ローカル実行）
```bash
git clone https://github.com/ZhuLinsen/daily_stock_analysis
cd daily_stock_analysis

cp .env.example .env
nano .env  # APIキーを設定

docker-compose up -d

# 手動実行
docker exec daily-stock python main.py --run-now
```

### 環境変数の設定
```bash
# .env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...  # 代替LLM

# 通知チャネル（どれか1つ以上）
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
DISCORD_WEBHOOK_URL=...

# データソース（デフォルトで無料APIを使用）
ALPHA_VANTAGE_API_KEY=...  # オプション：より詳細なデータ
```

### 動作確認
```bash
# 手動実行してTelegramに届くか確認
python main.py --run-now --stocks NVDA,AAPL

# → Telegramにレポートが届けば成功
```

---

## ベストプラクティス

1. **ウォッチリストを絞り込む:**
```yaml
# 多すぎると分析精度が落ちる
# 最大20〜30銘柄を推奨
# セクターごとに分けたリストを複数作成することも可能
watchlists:
  semiconductor: [NVDA, AMD, ASML, TSM]
  tech_giants: [AAPL, MSFT, GOOG, META]
  portfolio: [NVDA, 9988.HK, 600519]  # 自分の保有銘柄
```

2. **通知のスケジュールを最適化:**
```yaml
# 米国市場向け: 市場前（9時前）に送信
schedule:
  daily_report: "30 12 * * 1-5"  # UTC 12:30 = 日本時間 21:30（米国市場終了後）

# 中国市場向け: 中国時間8時前に送信
  cn_report: "00 23 * * 1-4"  # UTC 23:00 = 北京時間7:00
```

3. **AIエージェントで深掘り分析:**
```bash
# Telegram Botに直接質問
"NVDAの来四半期の見通しを教えて"
"TSMCがNVIDIAの供給を絞った場合のAMDへの影響は？"
→ 蓄積したデータと最新ニュースを組み合わせて回答
```

4. **アラートを設定:**
```yaml
alerts:
  price_change:
    threshold: 5  # 5%以上の変動でアラート
  
  earnings:
    notify_before: 2  # 決算の2日前に通知
  
  rsi:
    oversold: 30  # RSI 30以下で「売られすぎ」アラート
    overbought: 70  # RSI 70以上で「買われすぎ」アラート
```

---

## セキュリティ観点

### 重要な免責事項
- **このツールは投資アドバイスではない**
- AIの分析・シグナルは参考情報であり、投資判断は自己責任
- 過去のパフォーマンスは将来の結果を保証しない

### APIキーの管理
```bash
# GitHub Secretsに保存することで.envファイルをコミットしない
# ローカルで使う場合も.gitignoreに.envを追加
echo ".env" >> .gitignore
```

### データソースの信頼性
- 無料のAPIは遅延・不正確なデータが含まれる場合がある
- 重要な投資判断前には公式のデータソースで確認する

---

## ペルソナ設定と使い方

### ペルソナ：岡田 正（52歳・サラリーマン投資家・米国株・中国株を保有）

岡田さんは朝7時に起きて、米国市場の終値・決算発表・ニュースを確認してから出勤する。毎朝1時間かかるこのルーティンが「もう少し寝たい」「重要な情報を見落とす」という2つの悩みの原因だった。

```bash
# GitHubをフォーク → Secretsを設定 → config/stocks.yamlを自分の保有銘柄に変更
# → 以後は完全に自動

# 毎朝6時にTelegramに届くメッセージ
"📊 2026/05/22 モーニングブリーフ（米国時間5/21引け後）

🔴 主要指数:
S&P500: +0.8% / NASDAQ: +1.2% / DOW: +0.5%

🎯 ウォッチリスト（あなたの保有銘柄）:
• NVDA: +2.3% / 決算EPS$4.12(予想$3.89) ✅ 強いシグナル
• BABA(9988.HK): -1.2% / 規制懸念ニュース ⚠️ 注意
• 貴州茅台: +0.4% / 特段のニュースなし → ホールド推奨

📰 本日の重要ニュース:
1. NVIDIA、Blackwell Ultraを予想を上回るペースで出荷
2. 中国SECが新規制を発表（Alibaba等に影響の可能性）

💡 本日のアクション候補:
NVDA: 好決算を受けて強気継続
BABA: 規制リスクが顕在化する前に一部利確も検討"

# 岡田さんは7分でレポートを読んで出勤。朝53分の節約。
# 重要ニュースの見落としもほぼゼロに。
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| worldmonitor (#38) | より広い地政学・経済インテリジェンス（株式特化ではない） |
| Quantlib | 定量分析ライブラリ（AIなし） |
| backtrader | バックテストフレームワーク |

---

## 参考リンク

- [公式リポジトリ](https://github.com/ZhuLinsen/daily_stock_analysis)

> **免責事項:** このツールによる分析は投資アドバイスではありません。投資判断は必ず自己責任で行ってください。
