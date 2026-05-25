# docmost/docmost

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [docmost/docmost](https://github.com/docmost/docmost) |
| 言語 | TypeScript |
| 総スター数 | 20,310 |
| ライセンス | AGPL-3.0 |
| カテゴリ | 生産性ツール / Wikiドキュメント管理 |

---

## 概要

Docmostは、ConfluenceとNotionのオープンソース代替として開発されたコラボレーティブWikiおよびドキュメント管理ソフトウェア。リアルタイム共同編集、スペース（ワークスペース）による組織化、豊富なリッチテキスト機能を備えており、チームのナレッジベース構築に最適化されている。

Confluenceは高額な月額費用（チーム10名で月15,000円超）と複雑なUIで知られる。DocmostはDockerで数分でセルフホストでき、シンプルで直感的なUIを維持しながらConfluence相当の機能を提供する。TypeScriptで書かれたモダンなスタックで、運用・カスタマイズがしやすい。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **リアルタイム共同編集** | 複数ユーザーが同時に同じドキュメントを編集可能 |
| **スペース管理** | チーム・プロジェクト・部門ごとにスペースを分割 |
| **リッチテキストエディタ** | 見出し・表・コードブロック・画像・動画埋め込み対応 |
| **ページツリー** | 階層構造でドキュメントを整理 |
| **コメント・メンション** | ドキュメントへのインラインコメントと@メンション |
| **権限管理** | スペース・ページ単位でアクセス制御 |
| **検索** | 全文検索で素早くドキュメントを発見 |
| **絵文字・カバー画像** | Notionライクなビジュアルカスタマイズ |

---

## あるとないとの違い

| 観点 | Confluence（クラウド） | Docmost |
|------|----------------------|---------|
| 月額費用（10名） | 約15,000円〜 | 無料（セルフホスト） |
| データ所在 | Atlassianクラウド | 自社サーバー |
| UIの複雑さ | 多機能だが複雑 | シンプルで直感的 |
| セットアップ | 即利用可（クラウド） | Docker数分でデプロイ |
| カスタマイズ | 有料プラグインのみ | OSSなので自由に改変 |
| オフライン | 不可 | セルフホストでLAN内利用可 |

---

## 環境構築方法

### Dockerでセルフホスト（最小構成）

```yaml
# docker-compose.yml
version: "3.8"
services:
  docmost:
    image: docmost/docmost:latest
    depends_on:
      - db
      - redis
    environment:
      APP_URL: "http://localhost:3000"
      APP_SECRET: "change-this-to-a-strong-random-secret"
      DATABASE_URL: "postgresql://docmost:docmostpassword@db:5432/docmost"
      REDIS_URL: "redis://redis:6379"
    ports:
      - "3000:3000"
    volumes:
      - docmost_storage:/app/data/storage
    restart: unless-stopped

  db:
    image: postgres:16
    environment:
      POSTGRES_DB: docmost
      POSTGRES_USER: docmost
      POSTGRES_PASSWORD: docmostpassword
    volumes:
      - db_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7.2-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  docmost_storage:
  db_data:
  redis_data:
```

```bash
# 起動
docker-compose up -d

# ブラウザで http://localhost:3000 にアクセス
# 初回起動時にアドミンアカウントを作成
```

### 本番環境設定（HTTPS + メール通知）

```dotenv
# .env
APP_URL=https://wiki.company.com
APP_SECRET=your-very-long-random-secret-here
DATABASE_URL=postgresql://docmost:password@db:5432/docmost
REDIS_URL=redis://redis:6379

# メール通知（SMTPサーバー）
MAIL_DRIVER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=noreply@company.com
SMTP_PASSWORD=your-app-password
MAIL_FROM_ADDRESS=noreply@company.com
MAIL_FROM_NAME=Company Wiki

# ファイルストレージ（S3互換ストレージを使う場合）
STORAGE_DRIVER=s3
AWS_S3_BUCKET=docmost-storage
AWS_S3_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
# MinIO等のセルフホストS3を使う場合
AWS_S3_ENDPOINT=https://minio.company.com
```

### nginxリバースプロキシ設定

```nginx
server {
    listen 443 ssl http2;
    server_name wiki.company.com;

    ssl_certificate /etc/letsencrypt/live/wiki.company.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wiki.company.com/privkey.pem;

    client_max_body_size 50M;  # ファイルアップロード上限

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        # リアルタイム共同編集（WebSocket）のために必要
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## ベストプラクティス

1. **スペースをチーム・目的別に分けて情報を整理する:**
```
推奨スペース構成:
├── 🏠 Company（全社共有）
│   ├── 会社概要・ビジョン
│   ├── 組織図
│   └── 全社ポリシー
├── 💻 Engineering（エンジニアリングチーム）
│   ├── 技術スタック
│   ├── 開発環境セットアップ
│   ├── API仕様書
│   └── インシデント記録
├── 📊 Product（プロダクトチーム）
│   ├── 機能仕様書
│   ├── ユーザーリサーチ
│   └── ロードマップ
└── 🔒 HR（人事・閲覧権限制限）
    ├── 採用プロセス
    └── 評価制度
```

2. **テンプレートページを活用して記述の統一化を図る:**
```markdown
<!-- 障害報告テンプレート例 -->
# 障害報告: [サービス名] - [日付]

## 概要
- **発生日時**: 
- **復旧日時**: 
- **影響範囲**: 
- **重大度**: P1 / P2 / P3

## タイムライン
| 時刻 | 対応内容 | 担当者 |
|------|---------|--------|
|      |         |        |

## 根本原因

## 再発防止策
- [ ] アクション1（担当: @username、期限: ）
- [ ] アクション2（担当: @username、期限: ）
```

3. **定期的なバックアップとリストア手順を確立する:**
```bash
#!/bin/bash
# backup_docmost.sh

DATE=$(date +%Y%m%d_%H%M)
BACKUP_DIR="/backup/docmost/$DATE"
mkdir -p "$BACKUP_DIR"

# PostgreSQLのバックアップ
docker exec docmost-db-1 pg_dump -U docmost docmost \
  | gzip > "$BACKUP_DIR/docmost_db.sql.gz"

# ファイルストレージのバックアップ
docker run --rm \
  -v docmost_docmost_storage:/data \
  -v "$BACKUP_DIR":/backup \
  alpine tar czf /backup/storage.tar.gz /data

echo "バックアップ完了: $BACKUP_DIR"

# リストア手順（緊急時）:
# docker exec -i docmost-db-1 psql -U docmost docmost < backup.sql
```

4. **ページのバージョン履歴を活用してドキュメントの変更を追跡する:**
```
# Docmostの変更履歴機能
ページ右上 → 「...」→「Page history」
→ 各バージョンの diff を確認
→ 古いバージョンに一クリックでロールバック

# 重要ドキュメントの変更通知を有効化
ページ右上 → 「...」→「Notifications」→「Email me when this page changes」
```

---

## セキュリティ観点

### APP_SECRETの強固な設定

```bash
# 安全な APP_SECRET の生成
openssl rand -base64 64
# → 88文字のランダムな文字列

# デフォルト値や短い文字列は必ず変更すること
# APP_SECRET が漏洩するとセッションが偽造される
```

### データベースの認証情報管理

```bash
# 本番環境ではDocker Secrets を使用
echo "your-db-password" | docker secret create docmost_db_password -

# docker-compose.yml でSecrets参照
services:
  db:
    secrets:
      - docmost_db_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/docmost_db_password

secrets:
  docmost_db_password:
    external: true
```

### アクセス制御のベストプラクティス
- 外部公開する場合はVPN経由アクセスを推奨し、IPホワイトリストを設定する
- 管理者アカウントには専用のメールアドレスを使用し、定期的にパスワードを変更する
- スペースごとの権限設定を定期的に棚卸しし、退職者のアカウントを即座に無効化する

---

## ペルソナ設定と使い方

### ペルソナ：伊藤 誠（38歳・SaaS企業のエンジニアリングマネージャー・Confluenceから脱却したい）

伊藤さんのチームはConfluence Cloudを使っているが、15名のエンジニア・デザイナー・PMで月額24,000円の出費が経営からコスト削減圧力を受けている。また「ページ構成が複雑でドキュメントを書くのが億劫」という声が多く、情報の鮮度が落ちていた。

```bash
# 移行手順: Confluence → Docmost

# Step 1: Confluenceからエクスポート
# Confluence管理画面 → Space Settings → Export
# → HTML形式でエクスポート（confluence-export.zip）

# Step 2: Docmostをデプロイ
docker-compose up -d
# → http://internal-wiki.company.com:3000

# Step 3: 変換スクリプトで移行
# （コミュニティ製の移行ツールを使用）
npm install -g confluence-to-docmost
confluence-to-docmost \
  --input ./confluence-export \
  --output ./docmost-import \
  --base-url https://internal-wiki.company.com

# Step 4: インポートAPIで一括登録
curl -X POST https://internal-wiki.company.com/api/import \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "file=@docmost-import.zip"

# Step 5: チームに周知
# Slackで移行完了アナウンス
```

```markdown
# 移行後のチームWiki構成
## Engineeringスペース

### 開発環境セットアップ（新入社員向け）
1. macOSのセットアップ手順
2. Dockerインストール
3. リポジトリのクローン・ビルド手順
4. APIキーの取得方法

### アーキテクチャドキュメント
- システム全体図
- サービス間の依存関係
- データフロー図

### 運用手順書
- デプロイ手順（ゼロダウンタイム）
- 障害対応フローチャート
- オンコール担当ローテーション
```

**導入前後の変化:**
- 導入前: Confluence月額24,000円/月、「ページ作成が面倒」でドキュメント文化が根付かない
- 導入後: コスト削減24,000円/月（年間288,000円削減）、シンプルUIで書くハードル低下、ドキュメント作成件数が月12件→月35件に増加

---

## 周辺情報

### 類似・関連プロジェクト

| ツール | 特徴 |
|--------|------|
| Confluence | 最大手のエンタープライズWiki、高額で複雑 |
| Outline | チームWiki OSS、シンプルで人気、Markdownネイティブ |
| AppFlowy (#02) | Notion代替、データベース・プロジェクト管理も統合 |
| BookStack | シンプルWiki OSS、PHP製、Confluenceより軽量 |
| Wiki.js | Node.js製Wiki OSS、多機能で高カスタマイズ性 |

---

## 参考リンク

- [公式リポジトリ](https://github.com/docmost/docmost)
- [公式ドキュメント](https://docmost.com/docs)
- [Dockerハブ](https://hub.docker.com/r/docmost/docmost)
- [ロードマップ](https://github.com/docmost/docmost/projects)
