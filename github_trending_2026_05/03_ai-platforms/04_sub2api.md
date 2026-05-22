# Wei-Shaw/sub2api

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [Wei-Shaw/sub2api](https://github.com/Wei-Shaw/sub2api) |
| 言語 | Go |
| 総スター数 | 22,558 |
| 本日のスター | +299 |
| ライセンス | MIT |
| トレンド順位 | #31相当（2026/05/22） |
| カテゴリ | AIプラットフォーム / コスト最適化・ゲートウェイ |

---

## 概要

Claude・OpenAI・Gemini・Antigravityなど複数のAIサービスサブスクリプションを束ねて統一APIキーとして配布するゲートウェイ。トークン単位の使用量追跡・ユーザー管理・コスト配分機能を持ち、チームでのAIサブスク共有基盤として機能する。

Goバックエンド・Vue3フロントエンド・PostgreSQL・Redisで構成され、Docker一発で起動できる。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **マルチサービス統合** | Claude・OpenAI・Gemini・Antigravityを1つのAPIキーで提供 |
| **ユーザー管理** | ダッシュボードでユーザーごとにAPIキー発行・使用制限設定 |
| **使用量追跡** | トークン単位でリアルタイム使用量を計測・記録 |
| **コスト配分** | 使用量に基づいてコストを自動按分 |
| **クォータ設定** | ユーザー・チームごとに月次上限を設定 |
| **ルーティング** | Opus/Sonnet/Haikuリクエストを適切なサービスに転送 |

---

## あるとないとの違い

| 観点 | ない場合 | ある場合 |
|------|----------|----------|
| チームのAI費用 | 人数×サブスク費用 | 1〜2枚のサブスクをシェア |
| APIキー管理 | 各自が自分のキーを管理 | 管理者が一元管理・一括失効可能 |
| 使用量の把握 | 誰がどれだけ使ったか不明 | ダッシュボードでリアルタイム確認 |
| 新メンバーのセットアップ | 各サービスのアカウント作成が必要 | 管理者がキー発行するだけ（5秒） |

---

## 環境構築方法

### 前提条件
- Docker & Docker Compose
- 配布するAIサービスのアカウント（Claude Pro等）

### インストール手順
```bash
# リポジトリのクローン
git clone https://github.com/Wei-Shaw/sub2api
cd sub2api

# 設定ファイルの作成
cp .env.example .env
nano .env
```

### .env の設定
```bash
# データベース
POSTGRES_PASSWORD=secure_password_here
REDIS_PASSWORD=redis_password_here

# 管理者アカウント
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=admin_password

# AIサービスのアカウント情報
CLAUDE_SUBSCRIPTION_TOKEN=...    # Claude ProのCookieトークン
OPENAI_SESSION_TOKEN=...         # ChatGPT PlusのCookieトークン
GEMINI_API_KEY=AIza...           # Gemini APIキー

# サーバー設定
PORT=8080
SECRET_KEY=your_secret_key
```

### 起動
```bash
docker-compose up -d

# ブラウザで http://localhost:8080 にアクセス
# 管理者アカウントでログイン
```

### 動作確認
```bash
# APIキー発行後、動作確認
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer YOUR_ISSUED_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "claude-sonnet-4-6", "messages": [{"role": "user", "content": "Hello"}]}'
```

### ユーザーへのAPIキー配布
```
管理ダッシュボード:
1. Users > Add User（メールアドレスを入力）
2. Set Quota（月あたり500,000トークンなど）
3. Generate API Key
4. ユーザーにキーを共有
→ ユーザーはClaude CodeやVS Code設定でこのキーを使用
```

---

## ベストプラクティス

1. **クォータを設定してコストを管理:**
```yaml
# ユーザー種別ごとのクォータ例
admin:        unlimited
developer:    1,000,000 tokens/month
contractor:   200,000 tokens/month
intern:       50,000 tokens/month
```

2. **使用量アラートを設定:**
```
Dashboard > Settings > Alerts
→ ユーザーのクォータが80%に達したらメール通知
→ 異常な使用（1時間に5万トークン以上）で即時アラート
```

3. **定期的なキーのローテーション:**
```
# 3ヶ月ごとにAPIキーを再発行
Dashboard > Users > Rotate All Keys
```

4. **ログの保存期間を設定:**
```yaml
# 使用量ログは3ヶ月分保存
log_retention_days: 90
```

---

## セキュリティ観点

### 重大なリスク
- **Cookieトークンを使ったサービス接続:** 利用規約的にグレーゾーンの場合がある。各サービスの利用規約を確認する
- **APIキーの集中管理:** このサーバーが侵害されると全サービスへのアクセスを失う
- **中間者攻撃:** sub2apiは全リクエストの内容を把握できる

### 対策
```bash
# サーバーをHTTPSにする（必須）
# リバースプロキシ（Nginx + Let's Encrypt）を設定
certbot --nginx -d api.yourcompany.com

# アクセス制限
# 社内IPからのみアクセス可能にする
ufw allow from 192.168.0.0/16 to any port 8080
ufw deny 8080

# 管理者パスワードは強力なものを使用
# バックアップデータは暗号化して保存
```

### 利用規約の確認（重要）
```
各サービスの利用規約でAPIキーの共有・再配布が許可されているか確認する。
Claude Pro: サブスクリプションの共有は通常禁止されている可能性がある。
企業での使用はTeam/Enterpriseプランの正規利用を検討すること。
```

---

## ペルソナ設定と使い方

### ペルソナ：伊藤 大輔（38歳・Web制作会社の経営者・社員8名）

伊藤さんの会社では全員がAIツールを使いたいが、Claude Pro×8人分の費用は月$160。「全員にProを買ってやる余裕はないが、誰かがFreeで不満を持つのも嫌」という状況だった。

```bash
# セットアップ（30分で完了）
docker-compose up -d
# → ブラウザでダッシュボードにアクセス

# 1枚のClaude Proアカウントを登録
# → 8人用のAPIキーを発行（各自の使用量上限を設定）

# 社員のClaude Code設定
export ANTHROPIC_BASE_URL=http://company-ai.internal:8080
export ANTHROPIC_API_KEY=user123_issued_key

# 毎月のダッシュボード確認
# → 山田さんが今月50万トークン使用（最多）
# → 田中さんが5万トークン（Claude Code未活用）
# → 使用量に基づいてクォータを調整

# 月のAI費用（以前）: $160（8人×$20）
# 月のAI費用（以後）: $20〜$40（Claude Pro 1〜2枚でシェア）
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| free-claude-code (#27) | 個人向け・バックエンドを無料モデルに切り替え |
| LiteLLM | 汎用LLMプロキシ（エンタープライズ向け） |
| One API | 別のAPIゲートウェイ実装 |
| Anthropic Team Plan | 正規のチームプラン（推奨） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/Wei-Shaw/sub2api)
