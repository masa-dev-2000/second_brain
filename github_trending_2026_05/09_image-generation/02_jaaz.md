# 11cafe/jaaz

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [11cafe/jaaz](https://github.com/11cafe/jaaz) |
| 言語 | TypeScript |
| 総スター数 | 6,286 |
| ライセンス | MIT |
| カテゴリ | 画像生成 / マルチモーダル創作アシスタント |

---

## 概要

jaazは、CanvaやManusの代替となるオープンソースのマルチモーダル創作アシスタント。ローカルファースト設計でプライバシーを重視しており、ComfyUIとStable Diffusionをバックエンドに使って画像生成・編集・デザイン作業を自然言語で行える。

テキストで指示するだけでレイアウト設計・画像合成・コピー作成といったクリエイティブ作業が完結する点が特徴。APIキーは自分で管理し、全ての処理はローカル環境またはセルフホストサーバーで行われるため、機密性の高いデザイン素材も安心して扱える。Canvaのような商用SaaSに依存したくないクリエイターや企業向けのソリューション。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **テキスト → 画像生成** | 自然言語の指示からComfyUI経由で画像を生成 |
| **マルチモーダル編集** | 既存画像を参照しながらテキストで編集指示 |
| **レイアウト自動生成** | バナー・SNS素材・資料のレイアウトを自動構成 |
| **ローカルファースト** | ComfyUIとOllama等のローカルモデルに対応 |
| **マルチLLM対応** | OpenAI・Anthropic・Gemini・ローカルモデルを切り替え可能 |
| **プロジェクト管理** | 作業履歴をプロジェクト単位で管理・再編集 |
| **カスタムワークフロー** | ComfyUIのワークフローJSONをそのまま取り込める |

---

## あるとないとの違い

| 観点 | Canva / Manus（商用SaaS） | jaaz |
|------|--------------------------|------|
| データプライバシー | クラウドにデータが送信される | 完全ローカル処理でデータは外部に出ない |
| コスト | 月額サブスクリプション費用 | オープンソース、ローカル実行は無料 |
| カスタマイズ | 提供機能の範囲内のみ | ComfyUIワークフローを自由に追加 |
| インターネット依存 | オフラインでは使用不可 | ローカルモデルと組み合わせてオフライン動作可能 |
| 企業NDA対応 | 利用規約上の制約あり | セルフホストで完全にコントロール可能 |

---

## 環境構築方法

### 前提条件

```bash
# Node.js 18以上が必要
node --version  # v18.x.x 以上を確認

# ComfyUIが起動していること（画像生成を使う場合）
# http://127.0.0.1:8188 でアクセス可能な状態にしておく
```

### インストールと起動

```bash
git clone https://github.com/11cafe/jaaz.git
cd jaaz

# 依存関係をインストール
npm install

# 設定ファイルを作成
cp .env.example .env
```

### 環境変数の設定

```bash
# .env ファイル
# 使用するLLMのAPIキーを設定（最低1つ必要）
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# ComfyUIのエンドポイント（ローカル実行の場合）
COMFYUI_URL=http://127.0.0.1:8188

# ローカルモデル（Ollama）を使う場合
OLLAMA_URL=http://localhost:11434
```

### 起動

```bash
# 開発モードで起動
npm run dev
# → http://localhost:3000 でアクセス可能

# 本番ビルド
npm run build
npm start
```

### Dockerで起動（推奨）

```yaml
# docker-compose.yml
version: "3.8"
services:
  jaaz:
    image: ghcr.io/11cafe/jaaz:latest
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - COMFYUI_URL=http://comfyui:8188
    depends_on:
      - comfyui
    volumes:
      - ./projects:/app/projects  # プロジェクトデータをローカルに保存

  comfyui:
    image: yanwk/comfyui-boot:cu124
    ports:
      - "8188:8188"
    volumes:
      - ./models:/root/ComfyUI/models
    deploy:
      resources:
        reservations:
          devices:
            - capabilities: [gpu]
```

---

## ベストプラクティス

1. **ComfyUIのカスタムワークフローをjaazに取り込んで高品質生成を実現する:**
```bash
# ComfyUIで作り込んだワークフローをAPIワークフロー形式でエクスポート
# ComfyUI GUI → 「Save(API Format)」→ workflow_api.json として保存

# jaaz の設定画面からワークフローをインポート
# Settings → ComfyUI Workflows → Import → workflow_api.json を選択

# これによりjaaz上のテキスト指示がそのワークフローを呼び出す
```

2. **ローカルLLMと組み合わせて完全オフライン環境を構築する:**
```bash
# Ollamaのインストール
curl -fsSL https://ollama.ai/install.sh | sh

# 日本語対応モデルをダウンロード
ollama pull llama3.1:8b
ollama pull gemma2:9b

# jaazの設定でOllamaを選択
# Settings → LLM Provider → Ollama → Model: llama3.1:8b
```

3. **プロジェクトディレクトリをGit管理して作業履歴を保存する:**
```bash
# jaazのプロジェクトはJSON+画像ファイルで構成される
ls ~/jaaz-projects/my-campaign/
# project.json  assets/  outputs/

# Git LFS で画像ファイルを管理
git lfs install
git lfs track "*.png" "*.jpg" "*.webp"
echo "*.png filter=lfs diff=lfs merge=lfs -text" >> .gitattributes

git add .
git commit -m "キャンペーンビジュアル v1"
```

4. **システムプロンプトをカスタマイズしてブランドガイドラインを自動適用する:**
```json
{
  "system_prompt": "あなたは株式会社XのブランドデザインアシスタントAIです。\n以下のブランドガイドラインを常に遵守してください:\n- メインカラー: #1A73E8（ブルー）、#FFFFFF（ホワイト）\n- フォント: Noto Sans JP\n- トーン: プロフェッショナルかつ親しみやすい\n- 画像スタイル: クリーンでミニマリスト\n- NG: 赤・紫の使用、過剰に装飾的なフォント\n\nユーザーの指示に従いながら、必ずこのブランドガイドラインを反映した提案を行ってください。"
}
```

---

## セキュリティ観点

### APIキーの管理
```bash
# .env ファイルを絶対にGitにコミットしない
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# Docker Secrets を使ったAPIキー管理（本番推奨）
# docker secret create openai_key ./openai_key.txt
```

### セルフホスト環境のアクセス制御
```nginx
# nginx リバースプロキシでBasic認証を設定
server {
    listen 443 ssl;
    server_name jaaz.company.internal;

    auth_basic "jaaz - Company Internal";
    auth_basic_user_file /etc/nginx/.htpasswd;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 生成コンテンツのフィルタリング
- 社内利用時はOpenAIのContent Moderationエンドポイントと組み合わせて不適切な生成を防止する
- 出力ディレクトリには適切なファイルパーミッションを設定し、他ユーザーによるアクセスを制限する
- ComfyUIのAPIは認証なしのため、外部ネットワークからは絶対にアクセスできない構成にする

---

## ペルソナ設定と使い方

### ペルソナ：中村 彩（34歳・中小企業のマーケティング担当・SNS運用とバナー制作を一人でこなしている）

中村さんはEC会社のマーケ担当として、Instagram・Twitter・LINE広告などのバナーを毎週5〜10枚作成している。Canvaを使っているが月額費用が気になること、また新商品の画像をCanvaのサーバーにアップロードすることへの抵抗感があった。自社サーバーで動くデザインツールを探していた。

```bash
# jaazをDockerで自社サーバーに構築
# サーバースペック: Ubuntu 22.04, RTX 3060 (VRAM 12GB)

git clone https://github.com/11cafe/jaaz.git
cd jaaz

cat > .env <<'ENV'
OPENAI_API_KEY=sk-...
COMFYUI_URL=http://comfyui:8188
ENV

docker-compose up -d
```

```
# jaazでの指示例（テキストチャット）

中村: 「新商品の春ニット（添付画像）を使って、
        Instagram Stories用(1080x1920)のバナーを作って。
        コピーは「春色、届いた。」
        ブランドカラーはパステルピンク(#FFB7C5)で、
        余白多めのミニマルデザインで。」

jaaz: [ComfyUIでの画像生成 + レイアウト自動構成]
      → バナー案を3パターン生成、プレビュー表示

中村: 「2番目がいい。コピーのフォントをもう少し大きくして」

jaaz: [指示を理解して該当箇所を修正]
      → 修正版を即座に生成
```

**導入前後の変化:**
- 導入前: Canvaで手作業 → 1バナー15〜30分、月額費用 1,500円/月
- 導入後: テキスト指示でjaazが生成 → 1バナー3〜5分、初期構築コストのみで月額0円、商品画像も社内サーバーから外に出ない

---

## 周辺情報

### 類似・関連プロジェクト

| ツール | 特徴 |
|--------|------|
| Canva | 商用SaaS、豊富なテンプレート、クラウド依存 |
| ComfyUI (#01) | jaazのバックエンド、単体で高度な画像生成が可能 |
| Manus | AIエージェント型アシスタント、クラウドSaaS |
| Stable Diffusion Web UI (A1111) | 直接的な画像生成ツール、デザイン支援機能は限定的 |
| Penpot | オープンソースのFigma代替、UIデザインに特化 |

---

## 参考リンク

- [公式リポジトリ](https://github.com/11cafe/jaaz)
- [デモ動画](https://github.com/11cafe/jaaz#demo)
- [ComfyUI連携ガイド](https://github.com/11cafe/jaaz/wiki)
- [Discordコミュニティ](https://discord.gg/jaaz)
