# colbymchenry/codegraph

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) |
| 言語 | TypeScript |
| 総スター数 | 13,318 |
| 本日のスター | +4,222（本日最多） |
| ライセンス | MIT |
| トレンド順位 | #2（2026/05/22） |
| カテゴリ | AIコーディングツール / コスト最適化 |

---

## 概要

tree-sitterでコードを構文解析し、関数・クラス・インポート・継承関係をSQLiteのローカルグラフDBに事前インデックス化するMCPサーバー。

AIエージェント（Claude Code、Codex、Cursor等）がコードベースを理解する際に、都度grep/glob/readを繰り返す代わりに、このグラフに問い合わせることでトークン使用量とツール呼び出し回数を大幅に削減する。

**ベンチマーク（7つの実コードベースで計測）:**
- ツール呼び出し回数：約70%削減
- トークンコスト：約35%削減

---

## 主な機能

### 6つのMCPツール
| ツール名 | 用途 |
|---------|------|
| `search_symbols` | 関数名・クラス名のあいまい検索 |
| `get_symbol_definition` | シンボルの定義箇所を即取得 |
| `find_references` | 関数・変数の全参照箇所を列挙 |
| `get_call_graph` | 関数の呼び出し関係グラフを取得 |
| `get_imports` | モジュールの依存関係を取得 |
| `get_class_hierarchy` | クラス継承ツリーを取得 |

### 自動インデックス更新
- ファイルウォッチャーが変更を検知して自動で差分更新
- 初回インデックス後は常に最新状態を維持

### 対応言語
Python、TypeScript/JavaScript、Java、Go、Rust、C/C++、Ruby など主要言語

---

## あるとないとの違い

| 観点 | ない場合（従来） | ある場合 |
|------|-----------------|----------|
| 「この関数どこで使われてる？」 | ripgrepで全ファイルスキャン（多数のツール呼び出し） | 1回のDBクエリで即回答 |
| アーキテクチャ質問 | 何十ファイルも読む | グラフから構造を即取得 |
| コスト（30分作業） | 約$1.20相当のトークン | 約$0.43相当（-64%） |
| 初回インデックス時間 | — | コードベース規模に依存（中規模で数分） |

---

## 環境構築方法

### 前提条件
- Node.js 18以上
- Claude Code またはMCP対応AIツール

### インストール手順
```bash
# グローバルインストール
npm install -g @colbymchenry/codegraph

# またはnpxで実行
npx @colbymchenry/codegraph
```

### プロジェクトへの組み込み
```bash
# プロジェクトルートで初回インデックス作成
codegraph init -i

# Claude Codeの設定ファイルに追加（~/.claude/settings.json または .claude/settings.json）
```
```json
{
  "mcpServers": {
    "codegraph": {
      "command": "codegraph",
      "args": ["serve"]
    }
  }
}
```

### 動作確認
```bash
codegraph status    # インデックス状態を確認
codegraph stats     # インデックス統計を表示
```

---

## ベストプラクティス

### セットアップ
```bash
# 1. インストール
npx @colbymchenry/codegraph

# 2. プロジェクトをインデックス（プロジェクトルートで実行）
codegraph init -i

# 3. Claude Codeの .mcp.json に登録
{
  "mcpServers": {
    "codegraph": {
      "command": "codegraph",
      "args": ["serve"]
    }
  }
}
```

### 効果的な使い方
1. **モノレポでは各パッケージをそれぞれインデックス:** ルートから全部インデックスするとノイズが増える
2. **`node_modules` / `dist` / `.git` は除外設定に追加:** デフォルトで除外されているが、カスタムディレクトリは手動設定
3. **CI/CDでのインデックス更新:** マージ時にインデックスを再構築するCIステップを追加すると、常に最新状態を保てる

```yaml
# GitHub Actions例
- name: Update codegraph index
  run: codegraph init -i --output .codegraph/
- name: Commit index
  run: git add .codegraph/ && git commit -m "Update codegraph index"
```

4. **大規模リファクタリング前に使う:** `get_call_graph` で影響範囲を事前把握
5. **新メンバーのオンボーディングに活用:** `get_class_hierarchy` でアーキテクチャを視覚的に理解

---

## セキュリティ観点

### データローカリティ
- **全データはローカルのSQLiteファイルに保存:** コードがクラウドに送信されない
- MCP経由でAIエージェントと通信するが、グラフデータ（シンボル名・ファイルパス・関係性）のみを公開

### 注意点
- **コミットするかどうか:** `.codegraph/` ディレクトリをgit管理するかは判断が必要
  - コミットする → チームで共有可、CIでの再構築不要
  - コミットしない → ファイルサイズが増えない、各自ローカルで生成
- **`.gitignore` に秘密情報のあるファイルパスが漏れないか確認:** シンボル名やファイルパスにビジネスロジックの手がかりが含まれる場合がある

```bash
# セキュリティ確認：インデックスにパスワードや鍵が含まれていないか
grep -r "password\|secret\|key" .codegraph/
```

---

## ペルソナ設定と使い方

### ペルソナ：吉田 誠（34歳・バックエンドエンジニア・レガシーコードの保守担当）

吉田さんは15万行のPHPレガシーコードを保守している。Claude Codeを使ってリファクタリングを始めたが、「`getUser()` という関数が何百箇所で呼ばれているか調べて」というたびにAPIコストが膨らむのが悩みだった。月のAPI代が$180を超えたこともある。

#### codegraph導入後の変化

```bash
# インデックス作成（初回30分かかったが以降は差分のみ）
codegraph init -i

# 以前：Claude Codeに「getUser関数の全参照を調べて」
# → 15万行をgrepするため50回以上のツール呼び出し、$0.80消費

# 以後：Claude Codeが自動的にcodegraphを使う
# → find_references('getUser') の1回のDB呼び出し、$0.03消費

# 「getOrderService がどのクラスから利用されているか教えて」
# → get_call_graph('OrderService') で依存関係を即可視化

# 1ヶ月後：API代 $180 → $65 (-64%)
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| ctags | 古典的なシンボルインデックス（AIエージェント非対応） |
| LSP (Language Server) | IDEでの補完に特化（MCPとの統合は別途必要） |
| understand-anything (#19) | コードを知識グラフとして可視化（エージェント最適化ではなく人間向け） |
| semgrep | 静的解析特化（CodeGraph的な参照解析はない） |

### トークンコスト削減の試算
月のClaude Code API費用 × 35% = 毎月の節約額  
例：月$100かかっている場合 → 月$35節約 → 年間$420節約

---

## 参考リンク

- [公式リポジトリ](https://github.com/colbymchenry/codegraph)
- [MCP（Model Context Protocol）仕様](https://modelcontextprotocol.io/)
- [tree-sitter（構文解析エンジン）](https://tree-sitter.github.io/)
