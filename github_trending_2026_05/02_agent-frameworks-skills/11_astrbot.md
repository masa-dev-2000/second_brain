# AstrBotDevs/AstrBot

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [AstrBotDevs/AstrBot](https://github.com/AstrBotDevs/AstrBot) |
| 言語 | Python |
| 総スター数 | 32,765 |
| ライセンス | AGPL-3.0 |
| カテゴリ | エージェントフレームワーク / マルチIM AIエージェントプラットフォーム |

---

## 概要

Discord・Telegram・QQ・WeChat・LINEなど複数のIMプラットフォームを統合したAIエージェントプラットフォーム。OpenAI・Anthropic・Gemini・Llama等の多数のLLMに対応し、MCPサーバー・プラグインで機能を拡張できる。

「ChatGPTのような体験を自分が使うIMで、自己ホストで実現する」というコンセプト。OpenClaw（Claude.ai）の代替として明示されている。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **マルチIM** | Discord・Telegram・QQ・WeChat・LINE等に対応 |
| **マルチLLM** | OpenAI・Anthropic・Gemini・Ollama・Qwen等200+モデル |
| **MCP対応** | MCPサーバーのツールをエージェントに統合 |
| **プラグイン** | コミュニティプラグインで機能拡張 |
| **Web UI** | ブラウザから設定・会話履歴・プラグイン管理 |
| **グループ対応** | グループチャットでのAI応答に対応 |

---

## あるとないとの違い

| 観点 | 各プラットフォームの公式AI | AstrBot |
|------|--------------------------|---------|
| プラットフォーム | 1つのアプリのみ | Discord・Telegram等を一元管理 |
| モデル選択 | サービス指定のモデルのみ | 200+モデルから選択 |
| プライバシー | クラウドに履歴が残る | 自己ホストで完全管理 |
| カスタマイズ | 限定的 | プラグインで自由に拡張 |
| 費用 | 月額サブスク | 自己ホストで無料 |

---

## 環境構築方法

### Docker（推奨）
```bash
docker run -d \
  --name astrbot \
  -p 6185:6185 \
  -v /path/to/data:/AstrBot/data \
  soulter/astrbot:latest

# Web UIにアクセス
# → http://localhost:6185
# ユーザー名: astrbot / パスワード: astrbot（初回）
```

### pip インストール
```bash
pip install astrbot

astrbot run
# → http://localhost:6185 で管理画面にアクセス
```

### LLMの設定（Web UIから）
```
1. 設定 > LLMプロバイダー > 追加
2. プロバイダーを選択（Anthropic/OpenAI/Ollama等）
3. APIキーを入力
4. デフォルトモデルを選択
```

### Telegramボットの接続
```
1. BotFatherで新しいボットを作成してトークンを取得
2. AstrBot管理画面 > プラットフォーム > Telegram > トークンを入力
3. ボットとのチャットを開始してメッセージを送る
→ AIが応答すれば成功
```

---

## ベストプラクティス

1. **MCPサーバーでツールを追加:**
```json
// AstrBot管理画面 > MCP設定
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"]
    },
    "web-search": {
      "command": "python",
      "args": ["-m", "mcp_web_search"]
    }
  }
}
// → ボットに「このファイルを読んで」「これを検索して」と言えるようになる
```

2. **グループチャットでの使い方:**
```
Telegram/Discordのグループに追加した場合:
- @ボット名 + メッセージ でAIに話しかける
- ボットをメンションせずにすべてのメッセージに応答させることも可能（設定で切替）
- グループごとに異なるシステムプロンプトを設定できる
```

3. **プラグインでカスタム機能を追加:**
```python
# カスタムプラグインの例
from astrbot.api.event import filter
from astrbot.api import star

@star(name="天気予報", desc="天気を答えるプラグイン")
class WeatherPlugin:
    @filter.command("weather")
    async def get_weather(self, event, city: str):
        weather = fetch_weather(city)
        yield event.plain_result(f"{city}の天気: {weather}")
```

4. **ロールプレイ・キャラクター設定:**
```
管理画面 > キャラクター > 追加
- キャラクター名: さくら
- システムプロンプト: あなたはさくらという名の20代の女性アシスタントです...
- アバター画像: アップロード

→ Telegramボットが「さくら」というキャラクターとして応答する
```

---

## セキュリティ観点

### 管理画面の保護
```bash
# デフォルトのパスワードを即座に変更
# 管理画面 > 設定 > パスワード変更

# 外部からのアクセスを制限（自宅サーバーの場合）
# Nginx reverse proxy + Basic認証を追加
```

### APIキーの保護
```bash
# Docker環境での秘密管理
docker run -d \
  --name astrbot \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  # 直接コマンドラインに書かず環境変数で渡す
```

### IM APIの利用規約
- WhatsApp・LINEは非公式APIを使うため利用規約に違反する可能性がある
- Telegram・Discordは公式Bot APIがあるため問題なし

---

## ペルソナ設定と使い方

### ペルソナ：青木 誠（44歳・個人事業主・チームのSlack/Discordで情報収集を効率化したい）

青木さんは3人のフリーランスチームで仕事をしており、全員がDiscordを使っている。ChatGPTは個人で使っているが、チームの会話の中で「これどう思う？」「この文章添削して」とAIに聞くのにアプリを切り替えるのが面倒だった。

```
# AstrBotをVPSに設置してDiscordサーバーに追加

設定:
- プラットフォーム: Discord
- LLM: claude-opus-4-7（高品質）+ claude-haiku-4-5（軽い質問用）
- システムプロンプト: チームのコンテキスト（業種・専門用語）を設定

チームでの使い方:
@AI この提案書の文章を簡潔にして
→ 即座にAIが添削

@AI 今週のタスクを整理してリスト化して [会議メモを貼り付け]
→ 箇条書きのタスクリストが返ってくる

@AI このJSONのパースエラーの原因は？[コードを貼り付け]
→ 原因と修正方法が返ってくる

# 効果:
# チームメンバーがAIを使う頻度: 週5回 → 毎日数十回
# ChatGPTを個人で開く手間: ほぼゼロ
# 月額: VPS 880円のみ（3人でChatGPT Plus $60/月を節約）
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| OpenWA (#06フォルダ) | WhatsApp特化のAPIゲートウェイ |
| discord.py | Discord Bot開発ライブラリ（AIなし） |
| python-telegram-bot | Telegram Bot開発ライブラリ（AIなし） |
| ChatGPT Telegram Bot | Telegram特化のChatGPTボット |

---

## 参考リンク

- [公式リポジトリ](https://github.com/AstrBotDevs/AstrBot)
- [公式ドキュメント](https://astrbot.app/)
