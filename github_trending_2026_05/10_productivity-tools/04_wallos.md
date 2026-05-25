# ellite/Wallos

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [ellite/Wallos](https://github.com/ellite/Wallos) |
| 言語 | PHP |
| 総スター数 | 7,935 |
| ライセンス | GPL-3.0 |
| カテゴリ | 生産性ツール / サブスクリプション管理 |

---

## 概要

Wallosは、個人または家族の定期課金（サブスクリプション）を一元管理するセルフホスト型トラッカー。Netflix・Spotify・AWSなど複数のサービスの月額・年額課金を可視化し、支出を把握・削減するためのダッシュボードを提供する。

サブスクリプション経済の普及でサービスへの分散課金が当たり前になった現代において、「気づいたら毎月3万円以上課金している」という状況を整理するためのツール。クレジットカード明細を手動で確認する手間なく、通知機能で更新タイミングも事前にアラートできる。PHP+SQLiteで構成されているため軽量で、Raspberry Piでも動作する。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **サブスク一覧管理** | 全サービスの課金情報（金額・頻度・カード）を一元管理 |
| **支出ダッシュボード** | 月次・年次コストをグラフで可視化 |
| **更新アラート通知** | 更新日が近づいたらメール・Webプッシュで通知 |
| **通貨換算** | 複数通貨（USD・EUR・JPY等）を自動換算して合計表示 |
| **カテゴリ管理** | エンタメ・仕事・開発ツール等のカテゴリで分類 |
| **共有ダッシュボード** | 家族や会社でコストを共有 |
| **モバイル対応** | スマートフォンからも確認・追加が可能 |
| **500以上のロゴ** | 主要サービスのロゴを自動表示 |

---

## あるとないとの違い

| 観点 | 手動管理（スプレッドシート） | Wallos |
|------|--------------------------|--------|
| 把握のしやすさ | 更新が滞りがち | ダッシュボードで常に最新の状態 |
| 更新タイミング | 気づかず自動更新されることが多い | 更新日前に自動通知 |
| コスト分析 | 月次集計が手間 | リアルタイムで月額・年額の合計表示 |
| カードごとの管理 | 複数カードをまとめにくい | カード単位でフィルタリング可能 |
| プライバシー | Googleが見ている | セルフホストで完全プライベート |

---

## 環境構築方法

### Dockerでセルフホスト（推奨）

```yaml
# docker-compose.yml
version: "3.8"
services:
  wallos:
    image: bellamy/wallos:latest
    container_name: wallos
    ports:
      - "8282:80"
    environment:
      TZ: Asia/Tokyo
    volumes:
      - ./wallos_db:/var/www/html/db
      - ./wallos_logos:/var/www/html/images/uploads/logos
    restart: unless-stopped
```

```bash
# 起動
docker-compose up -d

# http://localhost:8282 にアクセス
# 初回アクセスでアカウント作成
```

### 手動インストール（Raspberry Pi等）

```bash
# PHP 8.x + Apache/nginx が必要
sudo apt install php8.2 php8.2-sqlite3 php8.2-curl php8.2-gd apache2

# Wallosをダウンロード
git clone https://github.com/ellite/Wallos.git /var/www/html/wallos

# パーミッションを設定
sudo chown -R www-data:www-data /var/www/html/wallos
sudo chmod -R 755 /var/www/html/wallos
sudo chmod -R 777 /var/www/html/wallos/db

# Apache 設定
sudo a2enmod rewrite
# /etc/apache2/sites-available/wallos.conf を作成してApache再起動
```

### Unraidコミュニティアプリからインストール

```
# Unraidユーザーは Community Applications から
# 「Wallos」を検索して1クリックでインストール可能
# データパス: /mnt/user/appdata/wallos/
```

### バックアップ設定

```bash
# WallosのSQLiteデータベースを定期バックアップ
# crontabに追加: crontab -e

0 2 * * * cp /path/to/wallos/db/wallos.db /backup/wallos_$(date +\%Y\%m\%d).db

# 古いバックアップを自動削除（30日以上）
0 3 * * * find /backup -name "wallos_*.db" -mtime +30 -delete
```

---

## ベストプラクティス

1. **カテゴリを設定してコスト構造を可視化する:**
```
推奨カテゴリ設定:
- エンタメ: Netflix, Spotify, Disney+, Amazon Prime Video
- 仕事・生産性: Notion, Slack, GitHub, Figma, Adobe CC
- 開発ツール: AWS, Vercel, Cloudflare, GitHub Copilot, OpenAI
- 健康・フィットネス: ジムメンバーシップ, 瞑想アプリ
- 教育: Udemy, Coursera, O'Reilly
- クラウドストレージ: iCloud, Google One, Dropbox
- SaaSツール: Zoom, LastPass, 1Password
```

2. **更新通知をSlack/メールと連携させて見逃しを防ぐ:**
```bash
# Wallos の Settings → Notifications から設定
# メール通知: SMTP設定を入力（Gmail App Passwordを使用）

# Slack Webhook連携の設定例
# Wallos → Settings → Notifications → Webhook
# Webhook URL: https://hooks.slack.com/services/T.../B.../...
# メッセージテンプレート:
# "⚠️ 【Wallos】{name}の更新日まで{days}日です。金額: {price}{currency}"

# 通知タイミング: 30日前・7日前・1日前の3回
```

3. **年額プランのコスパを月額換算で比較する:**
```
Wallosの活用方法:
- 月額プランと年額プランを別エントリで登録
- 年額プランは「Frequency: Yearly」で登録
- ダッシュボードの月額換算（年額÷12）で比較

例: Adobe CC
- 月額プラン: 7,780円/月 = 年93,360円
- 年額プラン: 72,336円/年 = 月6,028円
→ 年額の方が約18%安い（年21,024円節約）
```

4. **家族・チームで共有してコスト重複を発見する:**
```
# 家族でWallosを共有する場合:
# Wallos → Settings → Sharing → Create Share Link
# → URLを家族に共有（閲覧のみのリンク）

# 重複チェックの例:
# 夫: Amazon Prime Video（月600円）
# 妻: Amazon Prime Video（別アカウント、月600円）
# → 同一世帯なのに重複課金！ファミリープランで統一 → 月600円節約
```

---

## セキュリティ観点

### 認証とアクセス制御

```bash
# Wallosはデフォルトでパスワード認証あり
# 外部公開する場合はHTTPSを必ず設定

# nginx リバースプロキシ + Let's Encrypt
server {
    listen 443 ssl;
    server_name wallos.home.example.com;

    ssl_certificate /etc/letsencrypt/live/wallos.home.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wallos.home.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8282;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# 外部公開する場合は追加でBasic認証またはVPN推奨
```

### データのプライバシー

```bash
# Wallosに登録する情報
# - サービス名と金額（機密性は低い）
# - クレジットカード名（カード番号は登録しない設計）

# セルフホストにより第三者にデータが渡らない
# ただしDockerイメージの定期更新が必要
docker pull bellamy/wallos:latest && docker-compose up -d
```

### データベースの保護

```bash
# SQLiteファイルのパーミッションを確認
ls -la wallos_db/wallos.db
# → 権限: 600 (オーナーのみ読み書き可能)

# バックアップファイルも同様に保護
chmod 600 /backup/wallos_*.db
```

---

## ペルソナ設定と使い方

### ペルソナ：松本 大介（33歳・フリーランスWebエンジニア・毎月のサブスク費用が把握できていない）

松本さんはフリーランスとして独立して3年目。開発ツール・クラウド・学習サービスを次々と契約した結果、毎月いくらサブスクに払っているか把握できなくなっていた。確定申告の際にクレジットカード明細を見て経費計上できるサービスを整理しようとして初めて月8万円超えに気づいた。

```bash
# Wallosを Raspberry Pi にインストール
# 家庭内Homelab用サーバー (Raspberry Pi 4, 4GB RAM)

# Docker経由でインストール
docker-compose up -d

# ブラウザで http://192.168.1.100:8282 にアクセス
# 初回セットアップ:
# - 言語: Japanese
# - 通貨: JPY
# - タイムゾーン: Asia/Tokyo
```

```
# 登録したサブスクリプション一覧（登録後に判明した状況）

# 開発ツール (月計: ¥38,500)
GitHub Copilot:          ¥1,284/月
Vercel Pro:              ¥2,400/月
AWS (概算):              ¥15,000/月
Cloudflare Pro:          ¥2,500/月
MongoDB Atlas:           ¥2,000/月
Figma Pro:               ¥1,800/月
GitHub Pro:              ¥1,050/月
Postman:                 ¥1,200/月
Datadog:                 ¥11,266/月（※使ってない！）

# 学習 (月計: ¥12,000)
O'Reilly:                ¥4,800/月
Udemy Business:          ¥3,600/月
ChatGPT Plus:            ¥3,200/月
Perplexity Pro:          ¥2,400/月（※ChatGPTで代替できる？）

# エンタメ (月計: ¥4,200)
Netflix:                 ¥1,800/月
Spotify:                 ¥980/月
Amazon Prime:            ¥600/月（年額→月換算）
Disney+:                 ¥990/月（※あまり見ていない）

# 合計: 約¥54,700/月 → 年間約¥656,400
```

**Wallos導入後のアクション:**
```
1. Datadog → 解約（¥11,266/月削減）
   → CloudWatch Logsで代替

2. Disney+ → 解約（¥990/月削減）
   → あまり見ていなかった

3. Perplexity Pro → 解約（¥2,400/月削減）
   → ChatGPT Plusで代替

→ 月合計 ¥14,656節約 → 年間 ¥175,872削減
```

**導入前後の変化:**
- 導入前: クレカ明細を確認しないと総額が不明、無駄な課金を発見できない
- 導入後: ダッシュボードでリアルタイムに月額合計を確認、更新日7日前に通知でキャンセル判断の機会が生まれ、年間17万円以上の節約を実現

---

## 周辺情報

### 類似・関連プロジェクト

| ツール | 特徴 |
|--------|------|
| Cally | サブスク管理アプリ（iOS/Android）、クラウドサービス |
| Subtrack | iOS向けサブスク管理、Apple Card連携 |
| Maybe Finance | 個人資産管理OSS（サブスク管理も含む） |
| Actual Budget | ゼロベース予算管理のセルフホストOSS |
| Firefly III | 包括的な個人財務管理OSS |

---

## 参考リンク

- [公式リポジトリ](https://github.com/ellite/Wallos)
- [Dockerハブ](https://hub.docker.com/r/bellamy/wallos)
- [デモサイト](https://wallos.io/demo)
- [ドキュメント](https://github.com/ellite/Wallos/wiki)
