# hesreallyhim/awesome-claude-code

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) |
| 言語 | Python |
| 総スター数 | 44,562 |
| フォーク数 | 3,837 |
| ライセンス | MIT |
| カテゴリ | AIコーディングツール / Claude Code リソース集 |

---

## 概要

Claude Code向けのSkills・Hooks・スラッシュコマンド・エージェントオーケストレーター・アプリ・プラグインを厳選したawesome list。**コード品質・セキュリティ・オリジナリティ**を基準に審査されたリソースのみを収録。

Claude Codeを使いこなすために「何を入れれば何ができるか」が一覧できる公式に近い位置付けのリポジトリ。

---

## カバーするカテゴリ

| カテゴリ | 内容 |
|---------|------|
| **Skills** | Claude Codeのスラッシュコマンドで呼び出せる再利用可能なエージェント機能 |
| **Hooks** | ツール実行前後・セッション開始時等に自動実行されるシェルスクリプト |
| **Slash Commands** | `/コマンド名` で起動するタスク自動化 |
| **Agent Orchestrators** | 複数エージェントを協調させるフレームワーク |
| **Applications** | Claude Codeを活用して構築されたアプリ・ツール |
| **Plugins / MCP** | Model Context Protocolサーバー・Claude Codeプラグイン |
| **Status Lines** | Claude Codeのステータスライン表示をカスタマイズするツール |
| **Developer Tooling** | 開発ワークフローを強化するユーティリティ |

---

## あるとないとの違い

| 観点 | ない場合 | awesome-claude-code |
|------|---------|---------------------|
| Skillの発見 | GitHubを自分で検索する | 審査済みリストから選べる |
| 品質担保 | 動くか試さないと分からない | コード品質基準で審査済み |
| カテゴリ横断 | 目的別に別々のリポジトリを探す | 1か所で網羅 |
| 最新動向 | トレンドを見逃す | 継続的に更新される |

---

## 使い方

### Skillを探して導入する

```bash
# 1. awesome-claude-codeでSkillを見つける
#    → 例: ultrareview (コードレビューSkill)

# 2. Claude CodeにSkillを追加
/add-skill <skill-url>
# または ~/.claude/skills/ にファイルを配置

# 3. 使う
/ultrareview
```

### Hookを探して設定する

```bash
# 1. awesome-claude-codeでHookを見つける
#    → 例: 「git commitの前にlintを走らせるHook」

# 2. settings.jsonに追加
# ~/.claude/settings.json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/my-hook.sh"
          }
        ]
      }
    ]
  }
}
```

---

## 収録リソースの例

### 注目Skills（カテゴリ別）

```
コードレビュー・品質:
  - ultrareview     : マルチエージェントPRレビュー
  - security-review : セキュリティ脆弱性スキャン
  - code-review     : インラインコメント付きレビュー

生産性・自動化:
  - loop            : 定期実行・ポーリング自動化
  - init            : CLAUDE.mdの自動生成
  - verify          : 変更の動作確認自動化

学習・ドキュメント:
  - claude-api      : Anthropic SDK実装ガイド付きSkill
  - session-start-hook: Webセッション向けセットアップフック
```

### Hooks カテゴリ

```bash
# 代表的なHookパターン

# 1. ストップフック: セッション終了時にgit statusを確認
# ~/.claude/stop-hook-git-check.sh
#!/bin/bash
if [[ -n $(git status --porcelain) ]]; then
  echo "未コミットの変更があります"
  exit 1
fi

# 2. PreToolUseフック: Bash実行前に危険コマンドをブロック
#!/bin/bash
COMMAND=$(echo "$CLAUDE_TOOL_INPUT" | jq -r '.command')
if echo "$COMMAND" | grep -qE "rm -rf|DROP TABLE|format C:"; then
  echo "危険なコマンドをブロックしました: $COMMAND"
  exit 2  # exit 2 = Claudeへのフィードバックとしてブロック
fi
```

---

## ベストプラクティス

1. **Claude Codeを新しい環境でセットアップする際の出発点にする:**
```bash
# プロジェクト開始時の推奨フロー
# 1. awesome-claude-code を確認
# 2. 用途に合ったSkillをリストアップ
#    - Webアプリ開発 → security-review + verify + code-review
#    - データ分析   → claude-api + loop
#    - OSSプロジェクト → ultrareview + init
# 3. 必要なものだけ導入（全部入れない）
```

2. **Hookで繰り返し作業を自動化:**
```json
// .claude/settings.json（プロジェクト固有）
{
  "hooks": {
    "Stop": [
      {
        "hooks": [{
          "type": "command",
          "command": "bash .claude/stop-hook-git-check.sh"
        }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit",
        "hooks": [{
          "type": "command",
          "command": "npx prettier --write $CLAUDE_TOOL_OUTPUT_FILE 2>/dev/null || true"
        }]
      }
    ]
  }
}
// → Editツール実行のたびにPrettierが自動適用される
```

3. **自作SkillをPRして収録を目指す:**
```
審査基準（掲載されるには）:
✓ コードの品質が高い
✓ セキュリティ上の問題がない
✓ 既存Skillと重複しないオリジナリティ
✓ README・使い方ドキュメントが整備されている
✓ MITなどOSSライセンスである
```

---

## セキュリティ観点

```bash
# awesome-claude-codeに収録されたリソースでも、実行前に確認すべき点:

# 1. Hookは任意のシェルコマンドを実行できる
#    → 内容を必ず読んでから設定する

# 2. MCPサーバーはネットワーク通信を行う場合がある
#    → 外部送信先を確認する

# 3. Skillはプロンプトとして Claude に渡される
#    → プロンプトインジェクションのリスクを評価する

# → 審査済みリストとはいえ、自己責任での確認を推奨
```

---

## ペルソナ設定と使い方

### ペルソナ：村田 健（31歳・フルスタックエンジニア・Claude Codeを業務に導入したばかり）

村田さんのチームはClaude Codeを導入したが、デフォルト機能しか使っていない。「他に何ができるか」を調べる時間がなく、awesome-claude-codeを週に1回チェックして使えそうなSkillを試す習慣を作った。

```bash
# 月曜の朝ルーティン
# awesome-claude-codeのREADMEを確認
# 先週追加されたSkillで業務に使えそうなものをピックアップ

# 今週試したSkill: ultrareview
/ultrareview
# → PRに自動でインラインレビューコメントが付いた
# → 今まで1時間かかっていたコードレビューが15分に

# 来週試す予定: security-review
# → 本番デプロイ前のセキュリティチェックを自動化

# 3ヶ月後の効果:
# 導入Skill数: 8個
# 自動化できた作業: コードレビュー・テスト確認・git check・ドキュメント生成
# 見積もり時間削減: 週約5時間
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| [claude-plugins-official](./01_claude-plugins-official.md) | Anthropic公式プラグインディレクトリ |
| [travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills) | Skills特化のawesome list（12.8k stars） |
| [learn-claude-code](../07_media-learning/05_learn-claude-code.md) | Skillの仕組みを実装して学ぶ |

---

## 参考リンク

- [公式リポジトリ](https://github.com/hesreallyhim/awesome-claude-code)
