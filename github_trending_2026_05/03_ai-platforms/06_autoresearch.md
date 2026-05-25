# karpathy/autoresearch

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [karpathy/autoresearch](https://github.com/karpathy/autoresearch) |
| 言語 | Python |
| 総スター数 | 82,576 |
| 本日のスター | +259 |
| ライセンス | MIT |
| トレンド順位 | #32相当（2026/05/22） |
| カテゴリ | AIプラットフォーム / 自律ML研究 |

---

## 概要

Andrej Karpathy（元OpenAI共同創業者）作。1枚のGPUでnanoGPT（小規模LLM）の学習実験をAIエージェントが夜通し自律的に繰り返すシステム。

「AI研究者に自分自身を研究させる」コンセプト。エージェントは `train.py` を編集→5分間実験→val_lossを記録→次の仮説を立てる、というサイクルをオーバーナイトで100回以上繰り返す。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **自律実験ループ** | 仮説→コード変更→実験→評価→次の仮説を自律実行 |
| **固定制約** | 5分/実験・1GPU・1ファイルのみ変更（比較可能性を担保） |
| **実験ログ** | 全実験の変更内容・val_loss・仮説を構造化して記録 |
| **最良設定の保存** | 最も良いval_lossを達成したコードを自動バックアップ |
| **朝のレポート** | 実験結果のサマリーと推奨設定をMarkdownで出力 |

---

## あるとないとの違い

| 観点 | ない場合（手動研究） | ある場合 |
|------|---------------------|---------|
| 1日の実験回数 | 3〜5回（起動・確認・次の実験の手動サイクル） | 80〜120回（完全自律） |
| 研究者の作業時間 | ほぼ1日中モニタリング | 起動30分 + 朝のレポート確認30分 |
| 実験の一貫性 | 手動変更でパラメータが混在しやすい | 1ファイル・5分という制約で再現性を確保 |
| 仮説の多様性 | 研究者の思考バイアスに制約される | AIが思いつかない組み合わせも試みる |

---

## 環境構築方法

### 前提条件
- Python 3.10以上
- NVIDIA GPU（VRAM 8GB以上推奨）
- CUDA 11.8以上
- AIエージェントのAPIキー（Claude推奨）

### インストール手順
```bash
# リポジトリのクローン
git clone https://github.com/karpathy/autoresearch
cd autoresearch

# 依存関係インストール
pip install -r requirements.txt

# nanoGPTの設定確認
python data/shakespeare/prepare.py  # サンプルデータセット準備
```

### 設定ファイル
```yaml
# config.yaml
experiment:
  budget_hours: 8          # 実験予算（夜間8時間）
  max_time_per_run: 300    # 1実験の最大時間（秒）
  
agent:
  model: "claude-opus-4-7"  # 仮説生成・コード変更に使用
  api_key: "sk-ant-..."

gpu:
  device: "cuda:0"
  
baseline:
  run_before_start: true   # 開始前にベースライン計測
```

### 実行
```bash
# 夜間実行（朝起きたら結果が出ている）
python autoresearch.py \
  --config config.yaml \
  --hypothesis "学習率スケジューラの種類が収束速度に与える影響を調査" \
  --log-dir experiments/$(date +%Y%m%d)

# バックグラウンドで実行
nohup python autoresearch.py --config config.yaml &

# 翌朝、レポートを確認
cat experiments/20260522/summary.md
```

### 動作確認
```bash
# 1回だけ試して動作確認
python autoresearch.py --config config.yaml --max-runs 3
# → 3回の実験が完了して結果が出力されれば成功
```

---

## ベストプラクティス

1. **ベースラインを必ず記録する:**
```bash
# 実験前に現在のval_lossを記録
python train.py --eval-only --baseline
# → 改善の基準値を明確にする
```

2. **仮説を具体的に設定する:**
```yaml
# 曖昧（避ける）
hypothesis: "モデルを改善する"

# 具体的（推奨）
hypothesis: "AdamWのweight_decayを0.0から0.1に増やすとval_lossが改善するか？
            特に小規模データセットでの汎化性能への影響を確認する"
```

3. **変更スコープを制限する:**
```yaml
# train.py の変更可能な領域を制限（安全性のため）
allowed_sections:
  - optimizer_config
  - lr_scheduler
  - model_architecture
  # data_loading や logging は変更させない
```

4. **実験ログをバージョン管理:**
```bash
git add experiments/
git commit -m "autoresearch results: 2026-05-22 overnight run"
# → 結果を永続化して後で参照できるようにする
```

---

## セキュリティ観点

### コード自動変更のリスク
- エージェントが `train.py` を自動的に書き換えるため、意図しない変更が入る可能性がある
- **対策:** `git stash` または別ブランチで実行し、元のコードを保護する

```bash
# 実験用ブランチを作成
git checkout -b autoresearch-experiment-$(date +%Y%m%d)

# 実験完了後、良い結果だけをmainにマージ
git checkout main
git cherry-pick <best-commit-hash>
```

### GPU使用量とコスト
```bash
# GPU温度・使用率を監視
watch -n 5 nvidia-smi

# 電力消費の見積もり（RTX 4090: 450W × 8時間 = 3.6kWh）
```

### APIコストの上限設定
```yaml
# 実験ごとのAPIコストを制限
max_api_cost_per_run: 0.50  # 1実験あたり最大$0.50
total_budget: 5.00           # 全体で最大$5.00
```

---

## ペルソナ設定と使い方

### ペルソナ：松本 健二（31歳・ML研究者・博士課程）

松本さんは「学習率とバッチサイズの組み合わせを試したい」と思っても、1実験5分×100パターン=8時間。日中は別の研究があるので実験サイクルが週1〜2回しか回らない。

```bash
# 夜11時に研究室のGPUサーバーにSSHして起動
python autoresearch.py \
  --budget "8h" \
  --hypothesis "cosine annealing with warm restarts vs. linear decay:
                長い文脈での予測精度への影響を比較する。
                warm restart周期を10・20・50ステップで試す" \
  --log experiments/lr_scheduler_study/

# 翌朝7時（研究室に来る前にSlackで確認）
cat experiments/lr_scheduler_study/summary.md

# 結果:
# 実施実験数: 96
# 最優秀設定: cosine_annealing_warmup + lr=3e-4 + warmup_steps=20
# 改善率: baseline比 val_loss -8.3%
# 2番手との差: 2.1pp

# 手動では3週間かかる探索が1晩で完了
# 博士論文の実験セクションが大幅に充実
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| nanoGPT | Karpathy作の教育用LLMトレーニングコード（autoresearchの実験対象） |
| MLflow | 実験トラッキングツール（結果の記録・可視化） |
| Optuna | ハイパーパラメータ最適化（ベイズ最適化・人間の仮説不要） |
| AutoML | 機械学習の自動化（autoresearchより高次元） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/karpathy/autoresearch)
- [nanoGPT（実験対象）](https://github.com/karpathy/nanoGPT)
