# AppFlowy-IO/AppFlowy

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [AppFlowy-IO/AppFlowy](https://github.com/AppFlowy-IO/AppFlowy) |
| 言語 | Dart / Flutter |
| 総スター数 | 70,972 |
| ライセンス | AGPL-3.0 |
| カテゴリ | 生産性ツール / オープンソースNotion代替 |

---

## 概要

AppFlowyは、Notionのオープンソース代替として最も注目を集めているコラボレーションワークスペース。ドキュメント・データベース・プロジェクト管理・Wiki・チームコミュニケーションを一つのプラットフォームに統合している。70,000スター超えで、Notion代替OSSの中でトップクラスの人気を誇る。

Notionとの最大の違いは「データの完全制御」。セルフホスト可能なため、機密データが第三者クラウドに送信されることなく、企業の独自インフラ上で運用できる。Flutter製のクロスプラットフォームアプリとして、macOS・Windows・Linux・iOS・Androidに対応。AIアシスタント機能も内蔵しており、ドキュメント作成・要約・翻訳をワークスペース内で完結できる。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **ドキュメントエディタ** | ブロックベースのリッチテキストエディタ（Notionライク） |
| **データベース** | テーブル・ボード（カンバン）・カレンダー・ギャラリービュー |
| **AIアシスタント** | 文書作成・要約・翻訳・質問応答（OpenAI/ローカルモデル対応） |
| **プロジェクト管理** | タスク・マイルストーン・担当者管理 |
| **チームコラボ** | リアルタイム共同編集・コメント・メンション |
| **セルフホスト** | DockerでプライベートサーバーにAppFlowyを展開 |
| **マルチプラットフォーム** | macOS・Windows・Linux・iOS・Androidのすべてに対応 |
| **オフライン対応** | インターネット不要でローカル動作、後で同期 |

---

## あるとないとの違い

| 観点 | Notion | AppFlowy |
|------|--------|----------|
| データ所在 | Notionのクラウドのみ | セルフホストで自社サーバーに保存可能 |
| 料金 | 無料プランあり、チームは1,650円/月〜 | セルフホストは完全無料 |
| オフライン | 制限あり | ローカルファースト設計でオフライン完全対応 |
| カスタマイズ | 提供機能のみ | OSSなのでソースを改変可能 |
| AIの使い方 | NotionAI（追加課金） | 自前のOpenAI APIキーまたはローカルLLM |
| AGPL要件 | なし | セルフホスト改変版の公開義務に注意 |

---

## 環境構築方法

### Dockerでセルフホスト（推奨）

```bash
# docker-compose.yml をダウンロード
curl -O https://raw.githubusercontent.com/AppFlowy-IO/AppFlowy-Cloud/main/docker-compose.yml

# 設定ファイルを作成
cp .env.example .env
```

```dotenv
# .env ファイルの設定
APPFLOWY_DATABASE_URL=postgres://appflowy:password@postgres:5432/appflowy
APPFLOWY_REDIS_URL=redis://redis:6379
APPFLOWY_JWT_SECRET=your-super-secret-jwt-key-here-change-this

# AI機能（オプション）
APPFLOWY_AI_OPENAI_API_KEY=sk-...
# または ローカルOllamaを使う場合
APPFLOWY_AI_OLLAMA_URL=http://host.docker.internal:11434
```

```yaml
# docker-compose.yml（主要部分）
version: "3.8"
services:
  appflowy-cloud:
    image: appflowyinc/appflowy-cloud:latest
    env_file: .env
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: appflowy
      POSTGRES_PASSWORD: password
      POSTGRES_DB: appflowy
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

```bash
# 起動
docker-compose up -d

# デスクトップアプリからセルフホストサーバーに接続
# AppFlowy起動 → 「Sign Up」→ 「Use AppFlowy Cloud (Self-Hosted)」
# URL: http://your-server:8000 を入力
```

### デスクトップアプリのインストール

```bash
# macOS（Homebrew）
brew install --cask appflowy

# Linux（Snap）
sudo snap install appflowy

# Windows
# https://github.com/AppFlowy-IO/AppFlowy/releases から
# AppFlowy-windows-x86_64.exe をダウンロード
```

---

## ベストプラクティス

1. **テンプレートを作成してチームのドキュメント標準化を図る:**
```
# AppFlowy内でテンプレートを作成する手順
1. テンプレートにするページを開く
2. 右上の「...」→「Add to Templates」を選択
3. テンプレートライブラリに保存

# 推奨テンプレート
- 週次チームミーティング
- プロジェクト計画書
- ふりかえり（KPT）
- 障害報告書
```

2. **データベースのフィルターとグループ化でプロジェクト管理を効率化する:**
```
# タスクデータベースの推奨プロパティ設定
プロパティ:
  - ステータス: Not Started / In Progress / Done / Blocked
  - 担当者: Person型
  - 期限: Date型
  - 優先度: Select型 (High / Medium / Low)
  - スプリント: Select型

# ビューを複数作成
- 「今週のタスク」: 期限フィルター（今週） + 担当者でグループ
- 「自分のタスク」: 担当者フィルター（自分）
- 「高優先度」: 優先度フィルター（High）
- 「スプリントボード」: ステータスでカンバン表示
```

3. **AIアシスタントを使って議事録の要約と次のアクション抽出を自動化する:**
```
# 会議ドキュメント内でAIコマンドを使う
/ai → 「この会議メモからアクションアイテムを箇条書きで抽出して」

# ドキュメントを選択してAI操作
選択 → 右クリック → 「AI」 → 「要約」or「改善」or「翻訳」

# AIは自前のOpenAI APIキーを使用するため追加課金なし
```

4. **バックアップスクリプトでデータを定期的にエクスポートする:**
```bash
#!/bin/bash
# backup_appflowy.sh

BACKUP_DIR="/backup/appflowy/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

# Postgresのバックアップ
docker exec appflowy-postgres pg_dump -U appflowy appflowy \
  | gzip > "$BACKUP_DIR/db.sql.gz"

# AppFlowyのファイルストレージをバックアップ
docker cp appflowy-minio:/data "$BACKUP_DIR/files"

echo "バックアップ完了: $BACKUP_DIR"

# 30日以上古いバックアップを削除
find /backup/appflowy -maxdepth 1 -type d -mtime +30 -exec rm -rf {} \;
```

---

## セキュリティ観点

### JWTシークレットの強固な設定

```bash
# 安全なJWTシークレットを生成
openssl rand -hex 64
# → 128文字のランダム文字列を .env の APPFLOWY_JWT_SECRET に設定

# デフォルト値や短い文字列は絶対に使わない
```

### HTTPS化（本番環境必須）

```nginx
# nginx リバースプロキシ設定
server {
    listen 443 ssl http2;
    server_name appflowy.company.com;

    ssl_certificate /etc/letsencrypt/live/appflowy.company.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/appflowy.company.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # WebSocket対応
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### アクセス制御
- インターネット公開する場合はVPN経由のアクセスを推奨する
- メールドメイン制限で社内ユーザーのみ登録を許可する
- 管理者アカウントには二要素認証（2FA）を設定する

---

## ペルソナ設定と使い方

### ペルソナ：高橋 雄介（41歳・ITスタートアップのCTO・エンジニアリングチームのナレッジ管理に悩んでいる）

高橋さんは20名のエンジニアチームを率いており、技術ドキュメント・設計書・障害報告・プロジェクト計画がSlack・Notion・Googleドライブに散在している状態に悩んでいた。Notionは月額コストと「データがどこにあるか不明」という不安から社内のセキュリティ部門が承認しない。AppFlowyのセルフホストで課題を解決することにした。

```bash
# 社内サーバー（Ubuntu 22.04, 8コア, 32GB RAM）にデプロイ

# 1. セットアップ
git clone https://github.com/AppFlowy-IO/AppFlowy-Cloud.git
cd AppFlowy-Cloud

# 2. 設定
cp .env.example .env
# APPFLOWY_JWT_SECRET を強固なランダム文字列に設定
# SMTP設定でSlack通知と連携

# 3. 起動
docker-compose -f docker-compose.yml up -d

# 4. 初期ワークスペース構成
# 以下の構造を作成:
```

```
📁 Workspace: TechTeam
├── 📁 エンジニアリング
│   ├── 📄 技術スタック一覧
│   ├── 📄 アーキテクチャ設計
│   ├── 📁 API ドキュメント
│   └── 📁 ADR（アーキテクチャ決定記録）
├── 📁 プロジェクト管理
│   ├── 🗃️ タスクDB（カンバン）
│   ├── 🗃️ スプリントDB
│   └── 📄 ロードマップ
├── 📁 インシデント管理
│   ├── 🗃️ 障害記録DB
│   └── 📄 ポストモーテムテンプレート
└── 📁 オンボーディング
    ├── 📄 開発環境セットアップ手順
    └── 📄 コーディング規約
```

**導入前後の変化:**
- 導入前: ドキュメントがSlack・Notion・Gドライブに散在 → 必要な情報を探すのに毎日15〜30分ロス
- 導入後: AppFlowyに集約 → 情報が一元管理され検索時間が短縮、セルフホストでセキュリティ部門も承認、月額Notion費用20名分（約33,000円/月）の削減

---

## 周辺情報

### 類似・関連プロジェクト

| ツール | 特徴 |
|--------|------|
| Notion | 最も機能豊富な商用ツール、クラウドのみ |
| Obsidian | ローカルMarkdownファースト、個人利用向け |
| docmost (#03) | シンプルなWikiとドキュメント管理OSS |
| Outline | チームWiki OSS、Confluenceの代替 |
| Logseq | グラフベースナレッジ管理、オープンソース |

---

## 参考リンク

- [公式リポジトリ](https://github.com/AppFlowy-IO/AppFlowy)
- [AppFlowy Cloud（セルフホスト用）](https://github.com/AppFlowy-IO/AppFlowy-Cloud)
- [公式ドキュメント](https://docs.appflowy.io/)
- [テンプレートギャラリー](https://appflowy.io/templates)
- [Discordコミュニティ](https://discord.gg/9Q2xaN37tV)
