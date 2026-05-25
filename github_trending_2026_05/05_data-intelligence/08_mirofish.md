# 666ghj/MiroFish

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [666ghj/MiroFish](https://github.com/666ghj/MiroFish) |
| 言語 | Python |
| 総スター数 | 62,236 |
| ライセンス | MIT |
| カテゴリ | データ・インテリジェンス / 群知能予測エンジン |

---

## 概要

**シンプルかつ汎用的な群知能（Swarm Intelligence）エンジン**。複数の予測モデルやエージェントが「群れ」として協調し、単一モデルより精度の高い予測・最適化・意思決定を実現する。

株価予測・需要予測・異常検知・パラメータ最適化など「正解が確率的に分布するタスク」で特に有効。LLM・ML・ルールベースの各モデルを群れの一員として組み込める。

---

## 群知能とは

```
通常の予測:
  単一モデル → 予測結果

MiroFish の群知能:
  モデルA（LSTM）  ┐
  モデルB（XGBoost）├→ 投票・重み付け → 統合予測（より精度高）
  モデルC（LLM）   ┘
  ルールD（移動平均）┘
```

個々のモデルの弱点を群れ全体でカバーし、**アンサンブル学習より柔軟に構成できる**のが特徴。

---

## あるとないとの違い

| 観点 | 単一モデル | MiroFish |
|------|-----------|---------|
| 予測精度 | モデルの限界に依存 | 群れ全体で補完 |
| 過学習リスク | 高い | 分散により緩和 |
| 新しいモデルの追加 | 再学習が必要 | プラグインとして追加 |
| 不確実性の定量化 | 困難 | 群れのばらつきで自然に表現 |

---

## 環境構築方法

```bash
pip install mirofish
```

### 基本的な使い方

```python
from mirofish import Swarm, Agent
from mirofish.agents import LSTMAgent, XGBoostAgent, LLMAgent

# 群れを構成するエージェントを定義
swarm = Swarm(
    agents=[
        LSTMAgent(name="lstm", weight=0.3),
        XGBoostAgent(name="xgb", weight=0.4),
        LLMAgent(
            name="llm",
            model="claude-haiku-4-5-20251001",
            weight=0.3,
        ),
    ],
    voting="weighted_average",  # 重み付き平均で統合
)

# 学習
swarm.fit(X_train, y_train)

# 予測（群れ全体の合意）
predictions = swarm.predict(X_test)
uncertainty = swarm.uncertainty(X_test)  # 群れのばらつき＝不確実性

print(f"予測: {predictions[0]:.2f} ± {uncertainty[0]:.2f}")
```

### カスタムエージェントの追加

```python
from mirofish import BaseAgent

class MyRuleAgent(BaseAgent):
    """移動平均ベースのルールエージェント"""
    def predict(self, X):
        ma5  = X["close"].rolling(5).mean()
        ma20 = X["close"].rolling(20).mean()
        # ゴールデンクロスで強気、デッドクロスで弱気
        return (ma5 > ma20).astype(float)

swarm.add_agent(MyRuleAgent(name="ma_rule", weight=0.2))
swarm.rebalance_weights()  # 重みを自動再調整
```

---

## ベストプラクティス

```python
# 動的な重み調整（パフォーマンスに応じて自動更新）
swarm = Swarm(
    agents=[...],
    voting="adaptive",      # 精度が高いエージェントの重みを増やす
    adaptation_window=30,   # 直近30日のパフォーマンスで調整
)

# 外れ値・異常値の検出
outliers = swarm.detect_outliers(X_test, threshold=2.0)
# → 群れの意見が大きく割れた点が異常シグナル
```

---

## 周辺情報

| ツール | 特徴 |
|--------|------|
| [Kronos](./07_kronos.md) | 金融市場向け Foundation Model |
| [FinceptTerminal](./06_fincept-terminal.md) | 金融データ分析ターミナル |
| scikit-learn ensemble | ランダムフォレスト等の古典的アンサンブル |
| Ray | 分散コンピューティングで群れをスケール |

---

## 参考リンク

- [公式リポジトリ](https://github.com/666ghj/MiroFish)
