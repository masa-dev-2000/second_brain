# HKUDS/ViMax

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [HKUDS/ViMax](https://github.com/HKUDS/ViMax) |
| 言語 | Python |
| 総スター数 | 6,452 |
| 本日のスター | +537 |
| ライセンス | MIT |
| トレンド順位 | #25相当（2026/05/22） |
| カテゴリ | コンテンツ自動化 / AI動画生成 |

---

## 概要

アイデア・小説・脚本を入力すると、監督・脚本家・プロデューサー・映像生成AIが分業して長尺・一貫したキャラクターの動画を自動生成するマルチエージェントフレームワーク。

従来のAI動画ツールが「数秒の単発クリップ」しか生成できないのに対し、物語の流れを保ちながら複数シーンを連続生成し、キャラクターの外観の一貫性を保つ点が最大の特徴。

---

## 4つの生成モード

| モード | 入力 | 出力 |
|--------|------|------|
| **Idea2Video** | アイデア・コンセプト（一文） | 台本→絵コンテ→動画 |
| **Novel2Video** | 小説テキスト | 文学的な映像化 |
| **Script2Video** | 脚本 | セリフ・ト書きから動画生成 |
| **AutoCameo** | キャラクター参照画像 | 全シーンでそのキャラが登場 |

---

## あるとないとの違い

| 観点 | 従来のAI動画ツール | ViMax |
|------|-------------------|-------|
| 生成長さ | 数秒〜15秒程度 | 複数シーンを連続生成 |
| キャラクターの一貫性 | シーンが変わるたびに顔が変わる | AutoCameoが全シーンで統一 |
| 物語性 | なし（単発映像） | 台本→絵コンテ→映像の流れを保持 |
| 制作プロセス | 人間がシーンごとに個別生成 | エージェントが全体を自動管理 |

---

## 環境構築方法

### 前提条件
- Python 3.10以上
- NVIDIA GPU（VRAM 16GB以上推奨）
- CUDA 12.0以上
- AIエージェントのAPIキー（Claude/OpenAI）

### インストール手順
```bash
# リポジトリのクローン
git clone https://github.com/HKUDS/ViMax
cd ViMax

# 依存関係インストール（時間がかかる）
pip install -r requirements.txt

# モデルのダウンロード
python scripts/download_models.py
```

### 環境変数の設定
```bash
export ANTHROPIC_API_KEY=sk-ant-...  # エージェント制御に使用
# またはOpenAI
export OPENAI_API_KEY=sk-...
```

### 設定ファイル（`config.yaml`）
```yaml
models:
  director: "claude-opus-4-7"      # 最高品質のモデルを使用
  screenwriter: "claude-sonnet-4-6"
  video_model: "wan2.1"             # 動画生成モデル
  
output:
  resolution: "1280x720"
  fps: 24
  format: "mp4"

autocameo:
  enabled: true
  consistency_strength: 0.8  # キャラクター一貫性の強さ（0〜1）
```

### 動作確認（Idea2Video）
```bash
python vimax.py idea2video \
  --idea "夕暮れの海辺で少女がリュートを弾いている" \
  --duration 30 \
  --output test_video.mp4

# → 30秒の動画が生成されれば成功
```

---

## ベストプラクティス

1. **キャラクター参照画像を用意してからAutoCameoを使う:**
```bash
# 参照画像は複数角度のものを用意（3〜5枚推奨）
python vimax.py novel2video \
  --input story.txt \
  --character-ref ./refs/hero_front.jpg \
  --character-ref ./refs/hero_side.jpg \
  --character-name "主人公・アオイ" \
  --output novel_video.mp4
```

2. **短いシーンから始めてパラメータを調整:**
```bash
# まず30秒で試してから長尺に移行
python vimax.py script2video \
  --input script.txt \
  --scenes 1-3 \    # 最初の3シーンだけ生成
  --output test_scene.mp4
```

3. **物語の長さに応じてモデルを調整:**
```yaml
# 短編（30秒〜2分）: デフォルト設定
# 長編（5分〜）: max_context を増やす
models:
  max_context: 32000  # 長い物語には大きなコンテキストが必要
```

4. **生成結果をフォルダ別に管理:**
```bash
vimax.py novel2video --input story.txt --output-dir projects/story_v1/
```

---

## セキュリティ観点

### 著作権
- 小説・脚本の著作権を確認してから入力する
- 著作権保護された作品のキャラクター参照画像の使用は避ける

### 生成コンテンツの権利
- AI生成動画の著作権は各国で法整備が進んでいる
- 商業利用前に使用するモデル（wan2.1等）のライセンスを確認する

### GPUリソースの管理
```bash
# GPU使用量を制限（他プロセスへの影響を抑制）
CUDA_VISIBLE_DEVICES=1 python vimax.py ...
```

---

## ペルソナ設定と使い方

### ペルソナ：高橋 里奈（32歳・個人Vtuber・チャンネル登録者8万人）

高橋さんはオリジナルアニメ風の動画を作りたいが、アニメーター雇用は予算的に無理。毎回AIで絵を生成するとキャラクターの顔が変わってしまい、「シリーズものが作れない」という悩みがあった。

```python
# 1. キャラクター参照画像を用意（自分のVtuberアバター）
# refs/rinachan_front.png, refs/rinachan_side.png

# 2. 短編ストーリーを書く（3000文字）
# story.txt に保存

# 3. ViMaxで動画生成
python vimax.py novel2video \
  --input story.txt \
  --character-ref refs/rinachan_front.png \
  --character-ref refs/rinachan_side.png \
  --character-name "里奈ちゃん" \
  --duration 4min \
  --style anime \
  --output episode01.mp4

# ViMaxが自動的に：
# 1. Screenwriter Agent: 3000文字の小説を6シーンの台本に変換
# 2. Director Agent: 各シーンのカメラワーク・構図を決定
# 3. AutoCameo: 里奈ちゃんの顔を全シーンで統一
# 4. Video Generator: 各シーンを生成して結合

# 出力: 4分間の一貫したキャラクターのミニアニメ
# チャンネルに投稿 → 「里奈ちゃんのアニメシリーズ」として連載可能

# 以前: アニメーターに外注 → 1話10万円〜
# 以後: GPU費用のみ（数百円〜数千円）
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| Sora (OpenAI) | 高品質動画生成（API経由・高価格） |
| RunwayML | 動画生成・編集SaaS |
| Wan2.1 | 動画生成モデル（ViMaxが内部で使用） |
| presenton (#26) | プレゼンテーション生成（動画ではなくスライド） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/HKUDS/ViMax)
