# shiyu-coder/Kronos

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [shiyu-coder/Kronos](https://github.com/shiyu-coder/Kronos) |
| 言語 | Python |
| 総スター数 | 25,833 |
| ライセンス | MIT |
| カテゴリ | データ・インテリジェンス / 金融市場向けFoundation Model |

---

## 概要

**金融市場の「言語」に特化したFoundation Model**。株価・出来高・ニュース・財務指標・マクロ経済データを統合的に学習し、金融時系列の予測・分析・生成を行う。

汎用LLMが苦手とする「数値時系列の時間的パターン認識」と「金融ドメイン知識」を組み合わせた専門特化モデル。RAGや汎用LLMへの金融コンテキスト供給ベースとしても機能する。

---

## 汎用LLMとの違い

| 観点 | GPT-4/Claude（汎用） | Kronos |
|------|---------------------|--------|
| 時系列数値の理解 | テキストとして処理（精度低） | 金融時系列として処理 |
| マーケットパターン | 事前学習に依存・古い | 継続的に更新 |
| 予測出力 | 定性的な文章 | 定量的な確率分布 |
| ドメイン知識 | 一般的な金融知識 | 市場固有の非線形パターン |

---

## 環境構築方法

```bash
git clone https://github.com/shiyu-coder/Kronos
cd Kronos
pip install -r requirements.txt

# モデルのダウンロード
python download_model.py --model kronos-base
```

### 基本的な使い方

```python
from kronos import KronosModel

model = KronosModel.from_pretrained("kronos-base")

# 株価時系列の予測
import pandas as pd
price_data = pd.DataFrame({
    "close": [150.0, 152.3, 149.8, 153.1, 155.0],
    "volume": [1e6, 1.2e6, 0.9e6, 1.4e6, 1.1e6],
    "date": pd.date_range("2026-05-01", periods=5),
})

forecast = model.predict(
    data=price_data,
    horizon=5,          # 5営業日先を予測
    confidence=0.95,    # 95%信頼区間
)
print(forecast)
# {'mean': [156.2, 157.8, 155.4, 158.9, 160.1],
#  'lower': [152.1, 153.3, 150.8, 154.2, 155.6],
#  'upper': [160.3, 162.3, 160.0, 163.6, 164.6]}
```

### LLMへの金融コンテキスト供給

```python
from kronos import KronosModel
import anthropic

model = KronosModel.from_pretrained("kronos-base")
client = anthropic.Anthropic()

def financial_analysis(ticker: str, question: str) -> str:
    # Kronosで定量分析を実行
    analysis = model.analyze(
        ticker=ticker,
        features=["trend", "volatility", "support_resistance", "anomaly"],
    )

    # 定量結果をLLMに渡して定性解釈を生成
    response = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"""
Kronosの定量分析結果:
{analysis.to_text()}

質問: {question}
上記の定量データに基づいて投資判断の観点から分析してください。
"""
        }]
    )
    return response.content[0].text
```

---

## ベストプラクティス

```python
# 異常検知でアラートを設定
anomalies = model.detect_anomalies(
    data=price_data,
    sensitivity=0.95,  # 95パーセンタイルの動きを異常とみなす
)
if anomalies.any():
    print(f"異常検知: {anomalies[anomalies].index.tolist()}")
    # → Slack通知・ポジション見直し等のトリガーに

# ポートフォリオリスク評価
risk = model.portfolio_risk(
    holdings={"AAPL": 0.3, "NVDA": 0.25, "MSFT": 0.2, "VTI": 0.25},
    horizon=20,  # 20営業日
)
print(f"VaR(95%): {risk.var_95:.2%}")
print(f"Expected Shortfall: {risk.es_95:.2%}")
```

---

## 周辺情報

| ツール | 特徴 |
|--------|------|
| [FinceptTerminal](./06_fincept-terminal.md) | 金融データ取得・分析ターミナル |
| [daily-stock-analysis](./03_daily-stock-analysis.md) | 日次株式分析レポート自動生成 |
| TimesFM (Google) | 汎用時系列Foundation Model |
| Chronos (Amazon) | 時系列予測Foundation Model |

---

## 参考リンク

- [公式リポジトリ](https://github.com/shiyu-coder/Kronos)
