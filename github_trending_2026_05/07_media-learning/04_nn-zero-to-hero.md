# karpathy/nn-zero-to-hero

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [karpathy/nn-zero-to-hero](https://github.com/karpathy/nn-zero-to-hero) |
| 言語 | Jupyter Notebook |
| 総スター数 | 22,438 |
| フォーク数 | 3,247 |
| ライセンス | MIT |
| カテゴリ | 学習 / ニューラルネットワーク入門コース |

---

## 概要

Andrej Karpathy（元Tesla AI責任者・元OpenAI研究者）によるニューラルネットワーク入門シリーズ。**「micrograd」から始まり、GPT・LLMの仕組みを自力で実装しながら理解する**実践的カリキュラム。

YouTubeシリーズと完全に対応したJupyter Notebookが公開されており、数学的背景からTransformerの内部実装まで段階的に学べる。LLM時代を生き抜くAIエンジニアの必修コース。

---

## コースの構成

| 講義 | 内容 | キーワード |
|------|------|-----------|
| #1 micrograd | 自動微分エンジンをゼロから実装 | 逆伝播・計算グラフ |
| #2 makemore (bigram) | 文字レベル言語モデル | バイグラム・確率 |
| #3 makemore (MLP) | 多層パーセプトロンで名前生成 | 埋め込み・活性化関数 |
| #4 makemore (BatchNorm) | バッチ正規化の理論と実装 | BatchNorm・勾配流 |
| #5 makemore (Wavenet) | WaveNetアーキテクチャを実装 | 畳み込み・dilation |
| #6 nanoGPT | GPTをゼロから実装 | Transformer・自己注意機構 |
| #7 nanoGPT+tokenization | BPEトークナイザーを実装 | GPT-2・トークン化 |

---

## あるとないとの違い

| 観点 | 表面的なLLM利用 | nn-zero-to-hero 修了後 |
|------|---------------|----------------------|
| LLMの理解 | ブラックボックス | アーキテクチャを内側から理解 |
| デバッグ能力 | 「なぜ動かないか」分からない | 勾配・損失・アーキテクチャを診断できる |
| ファインチューニング | チュートリアルをコピーするだけ | 各パラメータの意味を理解して調整できる |
| 新論文の読解 | 数式で詰まる | 数学と実装を対応付けて読める |

---

## 環境構築方法

### リポジトリのクローンと環境セットアップ

```bash
git clone https://github.com/karpathy/nn-zero-to-hero
cd nn-zero-to-hero

pip install torch numpy matplotlib jupyter
```

### Jupyter Notebookの起動

```bash
jupyter notebook
# → ブラウザで各レクチャーのnotebookを開く
```

### nanoGPTの動作確認（#6講義より）

```python
# gpt.py（講義で自分でゼロから実装するコード）

import torch
import torch.nn as nn
from torch.nn import functional as F

class Head(nn.Module):
    """自己注意機構の1ヘッド"""
    def __init__(self, head_size):
        super().__init__()
        self.key   = nn.Linear(n_embd, head_size, bias=False)
        self.query = nn.Linear(n_embd, head_size, bias=False)
        self.value = nn.Linear(n_embd, head_size, bias=False)
        self.register_buffer('tril', torch.tril(torch.ones(block_size, block_size)))
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        B, T, C = x.shape
        k = self.key(x)    # (B, T, head_size)
        q = self.query(x)  # (B, T, head_size)
        # アテンションスコアの計算
        wei = q @ k.transpose(-2, -1) * k.shape[-1]**-0.5  # スケーリング
        wei = wei.masked_fill(self.tril[:T,:T] == 0, float('-inf'))  # マスク
        wei = F.softmax(wei, dim=-1)
        wei = self.dropout(wei)
        v = self.value(x)
        return wei @ v
```

---

## ベストプラクティス

1. **動画と並行してNotebookを手打ちする:**
```
# コピペせずに手で打つことで理解が定着する
# Karpathy本人が「書きながら見て」と強調している

学習順序:
1. YouTube動画を見ながらコードを手打ち
2. 一時停止して自分で実装してみる
3. 動画と比較して理解を深める
```

2. **micrograd から始めることが必須:**
```python
# Lecture #1: microgradをゼロから実装

class Value:
    def __init__(self, data, _children=(), _op=''):
        self.data = data
        self.grad = 0.0
        self._backward = lambda: None
        self._prev = set(_children)
        self._op = _op

    def __add__(self, other):
        out = Value(self.data + other.data, (self, other), '+')
        
        def _backward():
            # 逆伝播: 加算は勾配をそのまま流す
            self.grad += out.grad
            other.grad += out.grad
        out._backward = _backward
        return out

    def __mul__(self, other):
        out = Value(self.data * other.data, (self, other), '*')
        
        def _backward():
            # 逆伝播: 積の微分（連鎖律）
            self.grad += other.data * out.grad
            self.grad += self.data * out.grad
        out._backward = _backward
        return out

# これを実装できるとPyTorchの自動微分の仕組みが分かる
a = Value(2.0)
b = Value(3.0)
c = a * b + a
c.backward()  # 逆伝播を実行
print(a.grad)  # dc/da = b + 1 = 4.0
```

3. **nanoGPTで文字レベルシェイクスピア生成を動かす:**
```bash
# 1ファイル（約300行）でGPTを実装 → 動かすと感動する
python gpt.py
# step 0: train loss 4.2, val loss 4.2
# step 500: train loss 2.1, val loss 2.2
# ...
# step 5000: train loss 1.5, val loss 1.6

# 生成結果（シェイクスピア風）:
# "To be, or not that is the question..."
```

---

## セキュリティ観点

```python
# このコースでは外部APIを使わないため、データ漏洩リスクはない
# すべてのモデルはローカルで学習・推論を行う
# 学習データ（tinyshakespeare等）はパブリックドメイン

# 注意: GPUがない場合はCPUでも動くが学習に時間がかかる
# → Google Colab（無料GPU）の使用を推奨
```

---

## ペルソナ設定と使い方

### ペルソナ：佐々木 拓也（25歳・Webエンジニア・LLMの内部構造を理解したい）

佐々木さんはReact/FastAPIでSaaSプロダクトを開発しているが、LLMを使いこなすには仕組みを理解する必要があると感じている。大学は文系で数学に自信がないが、Karpathyのコースはコードベースで直感的に学べると評判で始めてみた。

```
学習記録（6週間）:
Week 1: micrograd実装 → 逆伝播の直感が掴めた
Week 2: makemore(bigram) → 確率モデルの基礎理解
Week 3: makemore(MLP) → 埋め込みと活性化関数
Week 4: BatchNorm講義 → 一番難しかった。3回見た
Week 5: nanoGPT → Transformerを自分の手で動かせた！
Week 6: GPT-2サイズのモデルをColab A100で学習

成果:
- PyTorchのautograd の動作原理が分かった
- ファインチューニングの論文を読めるようになった
- 社内のLLMプロダクトのデバッグでトークナイザーの問題を発見できた
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| [ai-engineering-from-scratch](./03_ai-engineering-from-scratch.md) | AI活用・エージェント開発の実践コース |
| fast.ai | Top-downアプローチのDL入門（Karpathyはbottom-up） |
| d2l.ai | 深層学習の教科書（より網羅的・理論寄り） |
| nanoGPT | このコース派生の軽量GPT実装（独立リポジトリ） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/karpathy/nn-zero-to-hero)
- [YouTubeプレイリスト](https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ)
