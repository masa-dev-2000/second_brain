# presenton/presenton

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [presenton/presenton](https://github.com/presenton/presenton) |
| 言語 | JavaScript / TypeScript |
| 総スター数 | 5,645 |
| 本日のスター | +479 |
| ライセンス | MIT |
| トレンド順位 | #26相当（2026/05/22） |
| カテゴリ | コンテンツ自動化 / AIプレゼンテーション生成 |

---

## 概要

Gamma・Beautiful AI・Decktopusの完全オープンソース代替。テキストプロンプトやドキュメントからPowerPoint（PPTX）プレゼンテーションをAIで自動生成し、自己ホスト可能。

OpenAI・Anthropic・Gemini・Ollamaなど複数のLLMプロバイダーに対応し、HTML+Tailwind CSSで定義したカスタマイズ可能なテンプレート、画像生成統合、API経由のプログラマティック生成もサポート。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **PPTX生成** | PowerPoint形式で直接ダウンロード可能 |
| **PDF出力** | プレゼン用PDFも同時生成 |
| **マルチLLM対応** | OpenAI・Anthropic・Gemini・Ollama・任意のAPIを選択 |
| **カスタムテンプレート** | HTML+Tailwindで自分でテンプレートを作成 |
| **画像生成** | DALL-E・Stable Diffusion等と統合 |
| **REST API** | プログラムからプレゼン生成を呼び出せる |
| **自己ホスト** | Docker・デスクトップアプリ・ローカルで動作 |

---

## あるとないとの違い

| 観点 | Gamma/Beautiful AI（有料SaaS） | Presenton（OSS） |
|------|-------------------------------|-----------------|
| 費用 | $12〜$40/月のサブスクリプション | 自己ホストで無料 |
| データの場所 | クラウドサービス上 | 自サーバー・ローカル |
| カスタマイズ | 限られたテンプレート | HTMLで完全自由にテンプレート作成 |
| AI制御 | サービス指定のモデル | 使いたいLLMを自由選択 |
| API | 有料または未提供 | 無料で使えるREST API |

---

## 環境構築方法

### 方法1：Docker（推奨・最速）
```bash
# Dockerで起動（最速5分）
docker run -d \
  -p 3000:3000 \
  -e OPENAI_API_KEY="sk-..." \
  -e ANTHROPIC_API_KEY="sk-ant-..." \
  presenton/presenton:latest

# ブラウザで http://localhost:3000 にアクセス
```

### 方法2：Docker Compose（推奨・本番向け）
```bash
git clone https://github.com/presenton/presenton
cd presenton
cp .env.example .env
nano .env  # APIキーを設定

docker-compose up -d
```

### .env の設定
```bash
# 使用するLLMの設定（どれか1つ以上）
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...

# 完全ローカルの場合（APIキー不要）
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# 画像生成（オプション）
DALLE_ENABLED=true

# ポート設定
PORT=3000
```

### 方法3：デスクトップアプリ
```bash
# Mac/Windows/Linux用のデスクトップアプリをダウンロード
# https://github.com/presenton/presenton/releases
# → インストーラーを実行するだけ
```

### 動作確認
```bash
# ブラウザで http://localhost:3000 にアクセス
# テキストを入力してプレゼン生成を試す
```

---

## ベストプラクティス

1. **具体的な指示で品質を上げる:**
```
# 曖昧（避ける）
"DX推進について"

# 具体的（推奨）
"DX推進プロジェクトの中間報告。
対象: 製造業クライアントの経営陣（技術非専門家）。
KPI: 業務効率化30%達成。
課題: 現場定着率が50%にとどまる。
次フェーズの予算案（3000万円）も含む。
スライド枚数: 12枚。語調: 丁寧・簡潔。"
```

2. **ドキュメントからの生成を活用:**
```bash
# PDFやWordドキュメントからプレゼン生成
# → 既存の報告書・調査資料を素早くプレゼン化
curl -X POST http://localhost:3000/api/generate \
  -F "document=@report.pdf" \
  -F "slides=15" \
  -F "style=corporate"
```

3. **テンプレートを会社ロゴに合わせてカスタマイズ:**
```html
<!-- templates/company-template.html -->
<!-- 会社のカラーコード・フォント・ロゴを設定 -->
<div class="slide" style="background: #003366;">
  <img src="/assets/logo.png" class="logo">
  <!-- Tailwindでレイアウト -->
</div>
```

4. **APIで定期レポートを自動化:**
```python
# 毎週月曜日に前週の売上データからプレゼン自動生成
import requests

response = requests.post('http://localhost:3000/api/generate', json={
    'prompt': f'前週の売上レポート: {weekly_data}',
    'template': 'sales-report',
    'slides': 10
})
pptx_url = response.json()['download_url']
```

---

## セキュリティ観点

### 社内データの保護
- **自己ホストのメリット:** 社外秘情報が外部サービスに送信されない
- ただし、使用するLLM APIには入力データが送信される
- 機密情報を扱う場合はOllamaのローカルモデルを使用する

```bash
# 完全ローカル設定（機密情報も安全）
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:70b
# OpenAI/Anthropicの設定は空にする
```

### アクセス制限
```nginx
# 社内からのみアクセス可能にする（Nginx設定）
location / {
    allow 192.168.0.0/16;  # 社内ネットワーク
    deny all;
}
```

### 生成コンテンツの確認
- AIが生成したスライドの内容は必ず人間がレビューする
- 数値・固有名詞・引用は特に確認する（ハルシネーションの可能性）

---

## ペルソナ設定と使い方

### ペルソナ：中村 健太（41歳・コンサルティングファーム部長・週2回提案書作成）

中村さんは提案書作成に毎回3〜4時間かけていた。GammaやBeautiful AIを試したが、会社の情報セキュリティポリシー上「外部サービスへのデータ送信禁止」のため使用できなかった。IT部門に申請したが「承認に3ヶ月かかる」と言われた。

```bash
# 社内Dockerサーバーにセルフホスト（IT部門から承認不要・社内完結）
docker-compose up -d
# → http://intranet.company.com:3000 で全社員がアクセス可能に

# 毎週のクライアント提案書作成
"製造業A社向けのDXコンサルティング提案書。
 現状分析: 手作業が多くDX未対応。
 提案: 3フェーズでの段階的デジタル化。
 Phase1: プロセスマッピング（3ヶ月・500万円）
 Phase2: システム導入（6ヶ月・2000万円）
 Phase3: 定着化支援（3ヶ月・500万円）
 スライド15枚。経営陣向けのエグゼクティブサマリー含む。"

→ 12分で15スライドのPPTX生成
→ 中村さんが20分かけて数値・固有名詞を確認・調整
→ 完成

# 以前: 3〜4時間 → 以後: 30〜40分
# 年間削減時間: 週2回×3時間×50週 = 300時間
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| Gamma | 人気のAIプレゼン生成SaaS（$12/月〜） |
| Beautiful AI | デザイン重視のAIプレゼンツール |
| Marp | Markdownからスライドを生成（AIなし） |
| reveal.js | HTML/JSプレゼンフレームワーク |

---

## 参考リンク

- [公式リポジトリ](https://github.com/presenton/presenton)
