# google-labs-code/stitch-skills

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [google-labs-code/stitch-skills](https://github.com/google-labs-code/stitch-skills) |
| 言語 | TypeScript |
| 総スター数 | 5,612 |
| 本日のスター | +69 |
| ライセンス | Apache 2.0 |
| トレンド順位 | #39相当（2026/05/22） |
| カテゴリ | AIコーディングツール / デザイン→コード変換 |

---

## 概要

Google Stitch（デザインファイル→コード変換MCPサーバー）と連携するAIエージェントスキルライブラリ。デザインからコードを生成する際にAIエージェントが使う専門知識（Material Designコンポーネント・Angularの命名規則・Googleの設計規約）を提供する。

スキルなしでデザインからコードを生成すると汎用的なHTMLが出てくるが、このスキルを使うことでGoogleのフレームワーク規約に準拠したコードが生成される。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| Material Design 3 統合 | MDCコンポーネントを適切に選択・使用 |
| Angular最適化 | NgModules・Standalone Componentsの適切な選択 |
| Google UXガイドライン | アクセシビリティ・インタラクションパターンの適用 |
| デザイントークン変換 | Figmaのデザイントークン→CSS変数への変換 |
| レスポンシブレイアウト | Googleのグリッドシステムに準拠した実装 |

---

## あるとないとの違い

| 観点 | ない場合 | ある場合 |
|------|----------|----------|
| ボタンコンポーネント | `<button class="btn">` が生成される | `<mat-button>` (Material Angular) が適切に生成 |
| フォーム | 汎用HTMLフォーム | `ReactiveFormsModule` + `mat-form-field` で生成 |
| スタイリング | インラインCSS | Googleのテーマ変数を使ったスタイル |
| アクセシビリティ | ARIA属性が不足 | Material Designのアクセシビリティ基準に準拠 |

---

## 環境構築方法

### 前提条件
- Node.js 18以上
- Google Stitch MCPサーバーのインストール（別途必要）
- Claude Code またはCursor

### Google Stitch MCPサーバーのインストール
```bash
npm install -g @google-labs/stitch-mcp
```

### stitch-skillsのインストール
```bash
# Claude Code プラグインとして
/plugin install google-stitch@claude-plugins-official

# または npm
npm install -g @google-labs-code/stitch-skills
```

### 設定（`.mcp.json`）
```json
{
  "mcpServers": {
    "stitch": {
      "command": "stitch-mcp",
      "env": {
        "FIGMA_TOKEN": "fig_..."
      }
    }
  }
}
```

### 動作確認
```bash
# Figmaファイルへのアクセステスト
stitch-mcp validate --figma-url "https://figma.com/file/..."
```

---

## ベストプラクティス

1. **Angularバージョンを明示:**
```
"このFigmaデザインをAngular 17のStandalone Component形式でコンバートして。
Material Design 3を使うこと"
```

2. **デザイントークンを先にセットアップ:**
```bash
stitch export-tokens --figma-url "..." --output src/styles/_tokens.scss
# → 先にデザイントークンを整備してからコンポーネント生成
```

3. **レビューの観点を明確に:**
```
"生成されたコンポーネントのアクセシビリティを確認して。
WCAG 2.1 AA基準を満たしているか？"
```

---

## セキュリティ観点

### FigmaトークンのリスクFigmaトークンはデザインファイルへの読み取りアクセスを許可するため、環境変数で管理し、`.env` ファイルをgitignoreに追加する。

```bash
echo "FIGMA_TOKEN=..." >> .env
echo ".env" >> .gitignore
```

---

## ペルソナ設定と使い方

### ペルソナ：加藤 由香（30歳・フロントエンドエンジニア・Googleエコシステム利用中）

加藤さんはAngular + Material Designで社内ツールを開発中。FigmaのデザインをAIに渡してコードを生成させているが、「MatButtonではなくbuttonタグを使う」「独自CSSを書いてしまう」という問題があった。

```bash
# stitch-skillsをインストール後

# Figmaファイルを共有してコンポーネント生成
"このFigmaの設定画面コンポーネントをAngular 17で実装して"

# スキルなし（以前）：
# → <button>タグ、インラインスタイル、独自のform実装が生成
# → 加藤さんが30分かけてAngular Material仕様に書き直し

# スキルあり（以後）：
# → <mat-button>、<mat-form-field>、ReactiveFormsModuleで正確に生成
# → ARIA属性も自動で付与
# → 修正なしでそのままcommit可能
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| Figma Dev Mode | Figmaの公式コード出力（フレームワーク最適化は限定的） |
| v0 by Vercel | React/Tailwind特化のAIデザイン→コード |
| Locofy | Figma→Reactの自動変換ツール |

---

## 参考リンク

- [公式リポジトリ](https://github.com/google-labs-code/stitch-skills)
- [Google Stitch](https://stitch.google.com/)
- [Material Design 3](https://m3.material.io/)
