# HKUDS/CLI-Anything

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [HKUDS/CLI-Anything](https://github.com/HKUDS/CLI-Anything) |
| 言語 | Python |
| 総スター数 | 39,101 |
| 本日のスター | +644 |
| ライセンス | MIT |
| トレンド順位 | #6（2026/05/22） |
| カテゴリ | コンテンツ自動化 / ソフトウェアエージェント化 |

---

## 概要

既存ソフトウェア（GIMP・Blender・LibreOffice・Zoom等）のソースコードを解析し、AIエージェントが操作できるCLIを自動生成するシステム。7フェーズの自動パイプラインで本番品質のCLIを生成し、2,330以上のテストで検証済み。40以上のアプリに対応。

「ソフトウェアをエージェントネイティブにする」ことで、AIが専用APIのないアプリケーションも直接操作できるようにする。

---

## 7フェーズの自動パイプライン

| フェーズ | 処理内容 |
|---------|---------|
| 1. Analyze | ソースコードをスキャンして機能をマッピング |
| 2. Design | コマンドグループとJSON出力形式を設計 |
| 3. Implement | Click CLI + REPL + JSON出力を実装 |
| 4. Plan Tests | 包括的なテスト戦略を策定 |
| 5. Write Tests | ユニット・E2Eテストを実装 |
| 6. Document | CLIのドキュメントを自動生成 |
| 7. Publish | インストール可能なパッケージを作成 |

---

## 対応済みアプリ（40以上）

| カテゴリ | アプリ |
|---------|--------|
| 画像・映像編集 | GIMP, Blender, Kdenlive, Inkscape |
| オフィス | LibreOffice Writer/Calc/Impress |
| ビデオ会議 | Zoom, Teams |
| CAD・3D | FreeCAD, OpenSCAD |
| ゲーム | Godot Engine |
| その他 | Audacity（音声）, Scribus（出版） |

---

## あるとないとの違い

| 観点 | ない場合 | ある場合 |
|------|----------|----------|
| GIMPでの画像処理 | Python-fuスクリプトを手動作成・GUIを手動操作 | `cli-anything-gimp image resize --width 1920` |
| Blenderでの3D | Pythonコンソールに直接コマンド入力 | `cli-anything-blender render execute --output out.png` |
| AIエージェントとの統合 | 専用API・SDK不要アプリは操作不可 | 生成されたCLI経由でエージェントが直接操作 |
| 大量バッチ処理 | 手動または複雑なスクリプト | `for f in *.png; do cli-anything-gimp process $f; done` |

---

## 環境構築方法

### 前提条件
- Python 3.10以上
- 操作したいソフトウェアのソースコード（またはインストール済みバイナリ）
- AIエージェントのAPIキー（CLI生成に使用）

### インストール手順
```bash
# pip インストール
pip install cli-anything

# または開発版
git clone https://github.com/HKUDS/CLI-Anything
cd CLI-Anything
pip install -e .
```

### 環境変数の設定
```bash
export ANTHROPIC_API_KEY=sk-ant-...  # CLI生成に使用するLLM
# またはOpenAI
export OPENAI_API_KEY=sk-...
```

### Claude Codeとの統合
```bash
# Claude Codeプラグインとしてインストール
/plugin install cli-anything@claude-plugins-official
```

### CLIの生成
```bash
# GIMPのCLIを生成（ソースコードパスを指定）
/cli-anything ./gimp-2.10/
# またはインストール済みバイナリから
cli-anything generate --app gimp --output ~/.local/bin/

# 生成完了後にテスト
cli-anything-gimp --help
# → 生成されたコマンド一覧が表示される
```

### 動作確認
```bash
# 基本的な操作テスト
cli-anything-gimp image open --file test.png
cli-anything-gimp image resize --width 1920 --height 1080
cli-anything-gimp image export --output resized.png
cli-anything-gimp quit
```

---

## ベストプラクティス

1. **生成後は必ずテストを実行:**
```bash
# 生成されたCLIのテストスイートを実行
cd cli-anything-gimp/
pytest tests/ -v
# → 2330以上のテストのうち、対象アプリ分が全てパスすることを確認
```

2. **AIエージェントとの組み合わせ方:**
```bash
# Claude Codeに依頼
"cli-anything-blenderを使って、
 この3Dモデル(model.obj)をPNGでレンダリングして。
 背景は白、解像度は1920x1080、カメラは正面から"

→ エージェントが自動的に:
cli-anything-blender scene load --file model.obj
cli-anything-blender camera set --position front --background white
cli-anything-blender render execute --output render.png --width 1920 --height 1080
```

3. **バッチ処理でのコスト削減:**
```bash
# 100枚の画像を一括でリサイズ（GUIより高速）
ls *.jpg | xargs -I {} cli-anything-gimp image resize \
  --file {} \
  --width 800 \
  --output resized_{}
```

---

## セキュリティ観点

### ソフトウェアへのフルアクセス
- 生成されたCLIはそのソフトウェアの全機能を呼び出せる
- ファイル削除・外部通信・システム変更を行う機能も含まれる
- **対策:** 生成されたCLIの `--help` で機能一覧を確認し、不要な機能はコマンドレベルで無効化する

### 生成コードのレビュー
```bash
# 生成されたCLIのコードを必ずレビュー
cat cli-anything-gimp/cli.py

# 特に確認すべき箇所:
# - os.system() や subprocess の使用箇所
# - ファイルシステムへのアクセス範囲
# - ネットワーク接続の有無
```

### サンドボックスでのテスト
```bash
# 本番環境に展開する前にDocker内でテスト
docker run --rm -v $(pwd):/work python:3.12 \
  bash -c "pip install cli-anything && cli-anything-gimp image --help"
```

---

## ペルソナ設定と使い方

### ペルソナ：田村 優子（38歳・フリーランスのグラフィックデザイナー・AI活用に積極的）

田村さんはGIMPを使って商品画像の加工を大量にこなしているが、「同じ作業を1000枚に繰り返す」というバッチ処理が毎回つらかった。Pythonは少し書けるがGIMPのScript-Fuは覚えたくない。

```bash
# CLI-AnythingでGIMPのCLIを生成（一回だけ）
cli-anything generate --app gimp

# 以後、AIエージェントと組み合わせて大量処理
claude "cli-anything-gimpを使って、products/フォルダ内の全JPGを
        白背景に変換して、ウォーターマークを追加して、
        800x800にリサイズしてoutput/に保存して"

→ Claude Codeが自動的に：
for img in products/*.jpg:
    cli-anything-gimp image open --file $img
    cli-anything-gimp background set --color white
    cli-anything-gimp watermark add --text "© TanakaCo" --position bottom-right
    cli-anything-gimp image resize --width 800 --height 800 --maintain-aspect
    cli-anything-gimp image export --output output/processed_$img

# 200枚の処理：以前は2日 → 現在は30分（自動実行中に別作業）
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| GIMP Script-Fu | GIMP公式スクリプト言語（CLI-Anythingより低レベル） |
| ImageMagick | 画像処理CLIツール（GUI連携はない） |
| FFmpeg | 動画処理CLI（Blenderとは別用途） |
| Automator（Mac） | Mac限定のGUI自動化ツール |

---

## 参考リンク

- [公式リポジトリ](https://github.com/HKUDS/CLI-Anything)
