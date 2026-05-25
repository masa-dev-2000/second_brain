# NousResearch/hermes-agent

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) |
| 言語 | Python |
| 総スター数 | 161,478 |
| 本日のスター | +2,056 |
| ライセンス | Apache 2.0 |
| トレンド順位 | #21相当（2026/05/22） |
| カテゴリ | AIプラットフォーム / 自己学習型エージェント |

---

## 概要

Nous Researchが開発する自己学習型AIアシスタント。経験から自動でスキルを構築・改善し続ける「成長するエージェント」。$5/月のVPSから起動でき、Telegram・Discord・Slack経由でどこからでも操作できる。

200以上のLLMプロバイダーに対応し、ユーザーごとに深く学習することで、使えば使うほど説明不要になる「パーソナルAI同僚」を実現する。

---

## 主な特徴

| 特徴 | 詳細 |
|------|------|
| **自律スキル学習** | 経験からスキルを自動生成・改善（唯一の実装） |
| **永続メモリ** | 会話履歴の全文検索、クロスセッション記憶 |
| **マルチプラットフォーム** | Telegram, Discord, Slack, Web UI |
| **200+モデル対応** | Anthropic, OpenAI, HuggingFace等を自由に切り替え |
| **スケジューリング** | 自然言語で定期タスクを設定 |
| **自律スクレイピング** | Webからのリアルタイム情報収集 |

---

## あるとないとの違い

| 観点 | 普通のAIチャット | hermes-agent |
|------|----------------|-------------|
| コンテキスト | 毎回最初から説明 | 過去の会話・好み・プロジェクトを記憶 |
| スキルの成長 | 常に同じ能力 | 使うたびに新しいスキルを獲得 |
| アクセス方法 | ブラウザのみ | Telegram・Discord・Slackから常時アクセス |
| 定期作業 | 手動で指示 | 「毎朝9時に市場レポートを送って」で自動化 |
| インフラ | クラウドサービス依存 | 自前VPSで完全自己ホスト可能 |

---

## 環境構築方法

### 前提条件
- Python 3.11以上
- $5〜$10/月のVPS（または自宅サーバー）
- 使用するLLMのAPIキー（Claude推奨）
- Telegramアカウント（Botトークン取得用）

### インストール手順（VPS）
```bash
# VPSにSSH接続後
git clone https://github.com/NousResearch/hermes-agent
cd hermes-agent

# 環境変数の設定
cp .env.example .env
nano .env
```

### .env の設定
```bash
# 必須
ANTHROPIC_API_KEY=sk-ant-...    # またはOpenAI/Gemini等
PRIMARY_MODEL=claude-opus-4-7

# Telegram連携（オプション）
TELEGRAM_BOT_TOKEN=...          # BotFatherから取得
TELEGRAM_USER_ID=...            # 自分のTelegram ID

# Discord連携（オプション）
DISCORD_BOT_TOKEN=...

# メモリDB
MEMORY_BACKEND=sqlite            # ローカル / または postgres / redis
```

### インストールと起動
```bash
pip install -r requirements.txt

# バックグラウンドで起動
nohup python main.py &

# またはsystemdサービスとして設定
sudo cp hermes.service /etc/systemd/system/
sudo systemctl enable hermes && sudo systemctl start hermes
```

### 動作確認
```bash
# Telegramでbotに話しかける
"こんにちは"
# → 応答が来れば成功

# スキルテスト
"東京の天気を調べて"
# → Web検索してリアルタイムの天気を返せば成功
```

---

## ベストプラクティス

1. **最初の1週間は積極的にフィードバックを与える:**
```
"この回答は長すぎる。次から要点だけ3行で答えて"
→ エージェントがスタイルを学習し、以後は自動的に3行で回答
```

2. **定期タスクを自然言語で設定:**
```
"毎朝7時にBTCとETHの価格と主要ニュースをTelegramで送って"
"毎週月曜日の9時に先週の作業ログをまとめてSlackに投稿して"
```

3. **プロジェクトコンテキストを事前に共有:**
```
"私はWebコンサルで、主なクライアントはAがECサイト、BがSaaS、CがBrick&Mortar。
 毎月20日に各クライアントへの月次報告書を作成する。これを覚えておいて"
→ 以後、「Aクライアントの報告書」と言えばECサイト向けの内容で作成
```

4. **複数モデルを用途別に設定:**
```yaml
# モデルルーティング設定
model_routing:
  complex_analysis: claude-opus-4-7    # 複雑な分析
  quick_tasks: claude-haiku-4-5         # 簡単な質問（コスト削減）
  coding: claude-sonnet-4-6             # コーディング作業
```

---

## セキュリティ観点

### VPSのセキュリティ
```bash
# SSH鍵認証のみ（パスワード認証を無効化）
echo "PasswordAuthentication no" >> /etc/ssh/sshd_config
systemctl restart sshd

# ファイアウォール設定
ufw allow 22/tcp   # SSH
ufw deny 8080/tcp  # Webポートを外部に公開しない
ufw enable
```

### APIキーの管理
```bash
# .envファイルのパーミッションを制限
chmod 600 .env

# Gitに含めない
echo ".env" >> .gitignore
```

### Telegramのセキュリティ
```python
# 許可するTelegram IDを制限（自分だけ）
ALLOWED_TELEGRAM_IDS=[YOUR_USER_ID]  # 他人が使えないよう制限
```

### メモリの定期クリーニング
```bash
# 定期的にメモリDB内の機密情報を確認・削除
python manage.py cleanup-memory --days 90
```

---

## ペルソナ設定と使い方

### ペルソナ：田中 誠（37歳・フリーランスWebコンサルタント・1人社員）

田中さんは毎日10社以上のクライアントとやり取りしながら、提案書・報告書・技術調査を並行してこなしている。ChatGPTは使うが、毎回「私はWebコンサルで、クライアントAはEコマース企業で…」と背景を説明するのに疲れていた。

```bash
# Digitaloceanの$6/月VPSにセットアップ
# TelegramBotと接続

# 初日（コンテキスト共有）
田中: "私のクライアント一覧を覚えて: A社がEC(食品), B社がBtoB SaaS, C社が小売店"
→ hermes-agent: 記憶に保存しました。次回から背景説明不要です。

# 1週間後（背景説明なしで作業）
田中: "A社向けの提案書の骨子を作って。先週の打ち合わせの内容も参考にして"
→ 先週の会話からA社の要件を引き出して提案書骨子を自動生成

# 2週間後（自律的なサポート）
→ hermes-agent: "B社の月次レポートの時期です。先月の数値はXXXでした。今月版を作りますか？"
→ 田中さんが何も言わなくてもリマインド＆前回フォーマットで自動生成

# 3ヶ月後の変化
# - 定型作業にかかる時間: 週10時間 → 週3時間
# - クライアントへのレスポンス速度: 2倍に
# - 「田中さん対応が早い」とクライアント満足度向上
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| openhuman (#22) | デスクトップ統合型パーソナルAI（サービス接続重視） |
| multica (#13) | チーム向けエージェント管理プラットフォーム |
| MemGPT | 長期記憶特化のAIエージェント |
| Auto-GPT | 自律型エージェント（先駆け） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/NousResearch/hermes-agent)
- [Nous Research](https://nousresearch.com/)
