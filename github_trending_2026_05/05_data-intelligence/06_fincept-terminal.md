# Fincept-Corporation/FinceptTerminal

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [Fincept-Corporation/FinceptTerminal](https://github.com/Fincept-Corporation/FinceptTerminal) |
| 言語 | Python |
| 総スター数 | 22,706 |
| フォーク数 | 3,131 |
| ライセンス | Other |
| カテゴリ | データ・インテリジェンス / 金融分析ターミナル |

---

## 概要

オープンソースのBloomberg端末代替。市場データ・投資リサーチ・経済指標をターミナル上でインタラクティブに探索できる金融分析ツール。AIエージェント連携・アルゴリズム取引・定量分析に対応し、**個人投資家からクオンツまで無料で本格的な金融データ分析環境**を提供する。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **マーケット分析** | 株式・ETF・先物・オプションのリアルタイム/履歴データ |
| **投資リサーチ** | ファンダメンタル分析・財務諸表・バリュエーション指標 |
| **経済データ** | GDP・インフレ率・雇用統計等のマクロ経済指標 |
| **アルゴリズム取引** | バックテスト環境・戦略開発フレームワーク |
| **AI連携** | AIエージェントへのデータ供給インターフェース |
| **ポートフォリオ管理** | リスク分析・パフォーマンス追跡 |

---

## あるとないとの違い

| 観点 | Bloomberg/Refinitiv | FinceptTerminal |
|------|--------------------|----|
| 月額コスト | $2,000〜$30,000 | 無料 |
| セットアップ | 専用端末が必要 | pip install だけ |
| カスタマイズ性 | 限定的 | フルOSS・改造自由 |
| AI連携 | 別途API契約が必要 | ネイティブ対応 |
| アルゴリズム取引 | 別製品（Bloomberg TOMS等） | 同一環境内で完結 |

---

## 環境構築方法

### インストール
```bash
pip install fincept-terminal

# または最新版をリポジトリから
git clone https://github.com/Fincept-Corporation/FinceptTerminal
cd FinceptTerminal
pip install -e .
```

### 起動
```bash
fincept

# → インタラクティブなターミナルUIが起動
```

### 基本的な使い方
```python
from fincept_terminal import FinceptTerminal

terminal = FinceptTerminal()

# 株式データの取得
stock_data = terminal.get_stock_data("AAPL", period="1y")

# 財務諸表
financials = terminal.get_financials("NVDA")

# 経済指標
gdp_data = terminal.get_economic_data("GDP", country="US")

# AIエージェント向けのデータ供給
context = terminal.build_market_context(
    tickers=["AAPL", "MSFT", "GOOGL"],
    include_news=True,
    include_fundamentals=True,
)
```

---

## ベストプラクティス

1. **LLMへの市場コンテキスト提供:**
```python
from fincept_terminal import FinceptTerminal
import anthropic

terminal = FinceptTerminal()
client = anthropic.Anthropic()

def analyze_stock_with_ai(ticker: str, question: str) -> str:
    # 市場データ・財務・ニュースを一括取得
    context = terminal.build_market_context(
        tickers=[ticker],
        include_news=True,
        include_fundamentals=True,
        include_technicals=True,
    )
    
    response = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=2048,
        messages=[{
            "role": "user",
            "content": f"以下の市場データを参考に分析してください。\n\n{context}\n\n質問: {question}"
        }]
    )
    return response.content[0].text

# 使用例
analysis = analyze_stock_with_ai("NVDA", "現在の投資判断と主なリスクは？")
```

2. **バックテスト環境の活用:**
```python
from fincept_terminal.backtesting import Strategy, Backtest

class MovingAverageCross(Strategy):
    def init(self):
        self.sma50 = self.data.Close.rolling(50).mean()
        self.sma200 = self.data.Close.rolling(200).mean()
    
    def next(self):
        if self.sma50[-1] > self.sma200[-1]:
            self.buy()
        elif self.sma50[-1] < self.sma200[-1]:
            self.sell()

bt = Backtest(
    data=terminal.get_stock_data("SPY", period="5y"),
    strategy=MovingAverageCross,
    cash=100_000,
)
results = bt.run()
print(results)
```

---

## セキュリティ観点

```python
# APIキーの管理
# 一部データソースは有料APIキーが必要
# .env ファイルで管理し、リポジトリにコミットしない
import os
from dotenv import load_dotenv

load_dotenv()
terminal = FinceptTerminal(
    alpha_vantage_key=os.getenv("ALPHA_VANTAGE_KEY"),
    fred_api_key=os.getenv("FRED_API_KEY"),
)
```

---

## ペルソナ設定と使い方

### ペルソナ：橋本 誠（29歳・個人投資家兼エンジニア・副業でクオンツ戦略を開発中）

橋本さんは昼間はSREとして働きながら、夜間にアルゴリズム取引戦略を開発している。Bloomberg端末は月額が高すぎて手が出ず、yfinanceだけでは物足りなかった。AIと組み合わせた投資分析環境を無料で構築したい。

```python
from fincept_terminal import FinceptTerminal
import anthropic
import pandas as pd

terminal = FinceptTerminal()
client = anthropic.Anthropic()

# 週次レポートの自動生成
def weekly_portfolio_report(portfolio: dict) -> str:
    tickers = list(portfolio.keys())
    
    # 保有銘柄の最新データ取得
    market_data = terminal.build_market_context(tickers=tickers)
    
    # 各銘柄の比重と損益
    positions = "\n".join([
        f"- {ticker}: {weight*100:.0f}%保有"
        for ticker, weight in portfolio.items()
    ])
    
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"""以下のポートフォリオについて週次レポートを作成してください。
            
ポジション:
{positions}

市場データ:
{market_data}

レポートに含める内容:
1. 各銘柄の今週のパフォーマンス
2. 注目すべきニュース・イベント
3. リスク要因
4. 来週の注目点"""
        }]
    )
    return response.content[0].text

portfolio = {"AAPL": 0.30, "NVDA": 0.25, "MSFT": 0.20, "VTI": 0.25}
report = weekly_portfolio_report(portfolio)
print(report)
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| yfinance | シンプルな株価取得（UIなし） |
| OpenBB | 同系のOSS金融ターミナル（より成熟） |
| QuantLib | クオンツ金融計算ライブラリ |
| Zipline/Backtrader | バックテスト専用フレームワーク |
| daily-stock-analysis (#03) | 日次分析レポート自動生成 |

---

## 参考リンク

- [公式リポジトリ](https://github.com/Fincept-Corporation/FinceptTerminal)
- [公式サイト](https://fincept.in)
