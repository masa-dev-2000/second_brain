# Lum1104/Understand-Anything

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [Lum1104/Understand-Anything](https://github.com/Lum1104/Understand-Anything) |
| 言語 | TypeScript |
| 総スター数 | 16,574 |
| 本日のスター | +854 |
| ライセンス | MIT |
| トレンド順位 | #19（2026/05/22） |
| カテゴリ | AIコーディングツール / コード可視化 |

---

## 概要

コードベースを解析してインタラクティブな知識グラフを生成するプラグイン。ファイル間の依存関係・関数の呼び出し関係・モジュール構造を視覚的なグラフとして表示し、自然言語で質問できる。

12のプログラミング言語に対応し、ジェネリクス・デコレータ・クロージャも解析。Claude Code・Cursor・VS Code（Copilot）など主要AIツールと統合できる。

---

## 主なコマンド

| コマンド | 用途 |
|---------|------|
| `/understand` | コードを解析してグラフをJSONで保存 |
| `/understand-dashboard` | ブラウザでインタラクティブ表示（ズーム・検索・パン） |
| `/understand-chat` | 「この決済フローはどこを通る？」と自然言語で質問 |
| `/understand-diff` | 現在の変更が影響するモジュール範囲を可視化 |
| `/understand-domain` | ビジネスロジック・プロセスフローを抽出 |

---

## あるとないとの違い

| 観点 | ない場合 | ある場合 |
|------|----------|----------|
| 新規参画時の学習 | 200,000行のコードを端から読む（数日〜数週間） | ダッシュボードでアーキテクチャを30分で把握 |
| 影響範囲の確認 | 関連ファイルを手動で洗い出す | `/understand-diff` で即可視化 |
| ビジネスロジックの把握 | ドキュメントがなければコードから読み解く | `/understand-domain` でプロセスフロー抽出 |
| チーム間のコミュニケーション | 口頭やWhiteboardで説明 | ダッシュボードのURLを共有 |

---

## 環境構築方法

### 前提条件
- Node.js 18以上
- Claude Code またはCursor（プラグイン対応AIツール）

### インストール手順
```bash
# Claude Code プラグインとしてインストール
/plugin install understand-anything@claude-plugins-official

# またはnpmで直接インストール
npm install -g @lum1104/understand-anything
```

### プロジェクトへの適用
```bash
# 初回解析（プロジェクトルートで実行）
/understand

# ダッシュボードをブラウザで開く
/understand-dashboard
# → http://localhost:8765 が自動で開く
```

### 動作確認
```bash
/understand --version
/understand-chat "このプロジェクトのエントリーポイントはどこ？"
```

---

## ベストプラクティス

### セットアップ
```bash
# Claude Codeにインストール
/plugin install understand-anything@claude-plugins-official

# または直接
npm install -g @lum1104/understand-anything
```

### 効果的な使い方

1. **初回オンボーディング時に実行:**
```bash
/understand --depth full --output .understand/

# ブラウザで開く
/understand-dashboard
# → ズーム・検索・ノードクリックで詳細確認
```

2. **PR前の影響確認:**
```bash
git diff main --name-only | xargs /understand-diff
# → 変更ファイルが影響するモジュールを可視化
# → 予期せぬ波及効果を事前に発見
```

3. **グラフのバージョン管理:**
```yaml
# .gitignoreに追加
.understand/cache/

# コミットするもの（チームで共有）
.understand/graph.json
.understand/domain.json
```

4. **ペルソナ別の表示モード:**
```bash
/understand-dashboard --persona junior  # 単純化した表示
/understand-dashboard --persona pm      # ビジネスロジックを強調
/understand-dashboard --persona senior  # フル技術詳細
```

5. **ドキュメント生成に活用:**
```bash
/understand-domain --output docs/architecture.md
# → ビジネスロジックの自動ドキュメント生成
```

---

## セキュリティ観点

### グラフデータの機密性
- グラフJSONにはファイルパス・関数名・クラス名・依存関係が含まれる
- これらはコードの設計思想やビジネスロジックを示す可能性がある
- **公開リポジトリへのグラフJSONコミットは要注意**（内部設計が露出する）

### 対策
```bash
# .gitignore での管理方針を明確化
.understand/         # 外部公開プロジェクトでは全体をignore
!.understand/schema/ # スキーマ定義だけ共有する場合
```

### ダッシュボードの公開リスク
- ダッシュボードをローカルホスト以外で公開する場合は認証を追加する
- コードの構造情報は社外秘として扱う

---

## ペルソナ設定と使い方

### ペルソナ：石井 里奈（26歳・新卒2年目エンジニア・大規模金融システムに配属）

石井さんは入社8ヶ月で金融系レガシーシステムのチームに異動になった。250,000行のJavaコードで、ドキュメントは古く、「聞ける人は3人しかいない」という状況。「どこから読めばよいかわからない」と毎日残業していた。

#### understand-anything導入後の変化

```bash
# 配属初日にチームリーダーが実行
/understand --depth full
/understand-dashboard

# 石井さんはブラウザで
# → "payment" で検索 → PaymentProcessor → OrderService → AccountRepository の依存チェーンが一目で見える
# → "どこで消費税計算してる？" → /understand-chat で質問
# → "TaxCalculationServiceクラスの89行目です" と即回答

# 1週間後
"このバグ修正でどのモジュールに影響出る？"
/understand-diff  # 変更予定のファイルを指定 → 影響範囲マップが表示

# 先輩への質問数 1日10回 → 1日2〜3回に減少
# オンボーディング期間 3ヶ月 → 6週間に短縮
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| codegraph (#2) | AIエージェントのコスト削減最適化（可視化は補助的） |
| Sourcetrail | コード可視化ツール（AI統合なし、開発停止） |
| CodeScene | 行動分析付きコード可視化（有料） |
| Architecture Haiku | AIによるアーキテクチャ図自動生成 |

---

## 参考リンク

- [公式リポジトリ](https://github.com/Lum1104/Understand-Anything)
