# manaflow-ai/cmux

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [manaflow-ai/cmux](https://github.com/manaflow-ai/cmux) |
| 言語 | Swift |
| 総スター数 | 19,078 |
| ライセンス | MIT |
| カテゴリ | インフラ・開発ツール / AIエージェント向けmacOSターミナル |

---

## 概要

**AIコーディングエージェント専用に設計されたmacOSターミナル**。Ghosttyをベースに構築し、縦タブ・エージェント通知・マルチセッション管理をネイティブサポート。

Claude Code・Codex・Cursor等を並列で走らせながら、どのエージェントが何をしているかを一画面で把握できる。「エージェントを並列で回す」が当たり前になった時代のターミナル。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **縦タブ** | セッションを縦に並べてエージェントを区別しやすく |
| **エージェント通知** | タスク完了・エラー発生をmacOS通知で受け取る |
| **マルチセッション** | Claude Code複数インスタンスを同時管理 |
| **プロセス監視** | 各エージェントのCPU・メモリ・トークン使用状況 |
| **Ghosttyベース** | 高速レンダリング・GPU加速 |

---

## あるとないとの違い

| 観点 | 通常のiTerm2/Warp | cmux |
|------|-----------------|------|
| エージェント管理 | タブが増えて混乱 | 縦タブで整理 |
| タスク完了通知 | 画面を常に監視する必要 | macOS通知で受け取る |
| 並列エージェント | どれが何をしているか分からない | プロセス一覧で把握 |
| AIエージェント特化機能 | なし | エージェント専用UI |

---

## 環境構築方法

```bash
# Homebrewでインストール
brew install --cask cmux

# または GitHub Releasesから直接ダウンロード
# https://github.com/manaflow-ai/cmux/releases
```

### セットアップ

```bash
# Claude Codeをcmuxで起動
cmux new-session --name "feature-auth" --agent claude-code
cmux new-session --name "test-runner" --agent claude-code
cmux new-session --name "doc-writer"  --agent claude-code

# 3つのClaudeが並列で動いている状態
# → 縦タブで切り替え、通知で完了を受け取る
```

### 通知設定

```json
// ~/.cmux/config.json
{
  "notifications": {
    "on_agent_complete": true,
    "on_error": true,
    "on_token_limit": true,
    "token_threshold": 100000
  },
  "sessions": {
    "auto_restore": true,
    "max_parallel": 5
  }
}
```

---

## ベストプラクティス

```bash
# マルチエージェントワークフローの例

# セッション1: メイン機能実装
cmux session "feature" -c "claude-code --task 'ユーザー認証機能を実装して'"

# セッション2: テスト自動生成（並列）
cmux session "tests" -c "claude-code --task 'featureブランチのテストを書いて'"

# セッション3: ドキュメント更新（並列）
cmux session "docs" -c "claude-code --task 'APIドキュメントを更新して'"

# 全セッションのステータスを一覧表示
cmux status
# feature: ✓ Complete (12min, 45k tokens)
# tests:   ⟳ Running  (8min, 23k tokens)
# docs:    ✓ Complete (5min, 12k tokens)
```

---

## セキュリティ観点

```json
// セッションごとに作業ディレクトリを分離
{
  "sessions": {
    "sandbox": true,         // サンドボックスモード
    "allowed_paths": [       // アクセス許可パスを限定
      "/home/user/project"
    ],
    "network_isolation": false  // ネットワークアクセスの制御
  }
}
```

---

## 周辺情報

| ツール | 特徴 |
|--------|------|
| [waveterm](./04_waveterm.md) | AIターミナル（クロスプラットフォーム） |
| Ghostty | cmuxのベースとなっている高速ターミナル |
| Warp | AI機能付きターミナル（商用） |
| iTerm2 | macOSの定番ターミナル（エージェント非特化） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/manaflow-ai/cmux)
