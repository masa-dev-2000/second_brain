# trimstray/the-book-of-secret-knowledge

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [trimstray/the-book-of-secret-knowledge](https://github.com/trimstray/the-book-of-secret-knowledge) |
| 言語 | Markdown（ドキュメント） |
| 総スター数 | 222,405 |
| 本日のスター | +312 |
| ライセンス | MIT |
| トレンド順位 | #35相当（2026/05/22） |
| カテゴリ | データ・インテリジェンス / DevOps・セキュリティ知識ベース |

---

## 概要

システム管理者・DevOpsエンジニア・ネットワーク管理者・セキュリティエンジニアのための膨大なチートシート・ツール・リソースを1つのリポジトリに集約した「秘密の知識の書」。

CLI/ターミナルの使い方から、Webアプリのセキュリティ・ネットワーク診断・サーバー強化まで、実践的なコマンド例とリソースが体系的に整理されている。222,405スターは「Gitで最もスターが多いドキュメント集の1つ」。

---

## 主なカテゴリ

| カテゴリ | 内容 |
|---------|------|
| **CLIツール** | curl/wget/ssh/netcat/openssl等の実践コマンド集 |
| **Webセキュリティ** | HTTPヘッダ・TLS設定・認証・WAFのベストプラクティス |
| **ネットワーク** | tcpdump/nmap/traceroute/iptablesの実践的使い方 |
| **システム強化** | Linux/Nginx/Apacheのハードニングチェックリスト |
| **DNS** | DNS設定・デバッグ・セキュリティ（DNSSEC/DoH） |
| **システム管理** | パフォーマンス分析・ログ管理・バックアップ戦略 |
| **セキュリティツール** | Metasploit/Burp Suite/Wireshark等の使い方 |

---

## あるとないとの違い

| 観点 | ない場合 | ある場合 |
|------|----------|----------|
| コマンドを忘れた | Google検索 → Stack Overflow → 正しいオプションを探す（5〜15分） | リポジトリ内検索で即座に実用例を発見（30秒） |
| サーバー強化 | セキュリティブログを横断検索 | ハードニングチェックリストをそのまま実行 |
| 新人エンジニア教育 | 「このコマンドは何？」と先輩に都度聞く | 体系的なリファレンスで自己解決できる |
| ペネトレーションテスト | ツールの使い方を毎回調べる | 実践的なone-linerが整理済み |

---

## 環境構築方法

### 利用方法（インストール不要）

ドキュメントリポジトリのためインストールは不要。以下の方法でアクセスできる。

```bash
# オフライン参照のためにローカルにクローン
git clone https://github.com/trimstray/the-book-of-secret-knowledge
cd the-book-of-secret-knowledge

# キーワード検索
grep -r "curl" . --include="*.md" -l
grep -r "SSL certificate" . --include="*.md" -n
```

### ローカルドキュメントサーバーとして起動（オプション）
```bash
# MkDocsでHTMLサイトとして閲覧
pip install mkdocs mkdocs-material
cd the-book-of-secret-knowledge

# mkdocs.ymlが存在する場合
mkdocs serve
# → http://localhost:8000 でブラウザ閲覧

# または単純なHTTPサーバー
python -m http.server 8000
```

### 個人Wikiとして取り込む
```bash
# Obsidian/Notionに取り込む場合
# markdownファイルをそのままObsidianのVaultにコピーするだけ
cp -r the-book-of-secret-knowledge/. ~/ObsidianVault/references/
```

---

## ベストプラクティス

1. **チームの「社内版」を派生させる:**
```bash
# リポジトリをフォークして社内固有の情報を追加
git fork trimstray/the-book-of-secret-knowledge
# → 社内のNaming convention・特定ツールのコマンド等を追加
# → 新人研修資料として活用
```

2. **よく使うセクションをブックマーク:**
```bash
# 特定セクションへの直接リンクをブラウザブックマークに追加
# 例: SSHのhardening
# https://github.com/trimstray/the-book-of-secret-knowledge#ssh

# ローカル版でシンボリックリンクを作成
ln -s ~/the-book-of-secret-knowledge/README.md ~/Desktop/secret-knowledge.md
```

3. **OpenSSLコマンドの実践例を活用:**
```bash
# 証明書の確認（よく使うがいつも忘れるコマンド）
# 本リポジトリのOpenSSLセクションより

# 証明書の有効期限を確認
openssl s_client -connect example.com:443 2>/dev/null | openssl x509 -noout -dates

# 証明書の詳細表示
openssl x509 -in cert.pem -text -noout

# CSRの生成
openssl req -new -newkey rsa:2048 -nodes -keyout server.key -out server.csr
```

4. **Nginxハードニングチェックリストを活用:**
```nginx
# 本リポジトリのNginx強化セクションより抜粋

# セキュリティヘッダーの設定
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'" always;

# TLS設定
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
ssl_prefer_server_ciphers off;
```

---

## セキュリティ観点

### 情報の利用目的に注意
- 攻撃的なセキュリティ技術（ペネトレーションテスト・脆弱性スキャン）は**許可された環境のみ**で使用
- 本リポジトリの情報を悪意ある目的で使用しないこと

### 情報の鮮度
```bash
# コマンドや設定の推奨値は時間とともに変わる
# 特にセキュリティ関連の設定は必ず最新のCVE・アドバイザリと照合する

# TLSの推奨設定は毎年変わる可能性がある
# → Mozilla SSL Configuration Generator等で最新推奨設定を確認
# https://ssl-config.mozilla.org/
```

### チームへの展開時
```bash
# 社内Wikiに展開する場合、以下のコンテキストを付記
# 「このコマンドは本番環境での実行前に必ずレビューを通すこと」
# 特にiptables・ファイル削除・強制終了系のコマンドは危険を伴う
```

---

## ペルソナ設定と使い方

### ペルソナ：林 大輔（29歳・SREエンジニア・インフラ経験3年目・チームの「何でも屋」）

林さんは社内で一番若いインフラエンジニア。先輩が退職し、突然チームの主力に。「SSHの多段踏み台のコマンドってどうだっけ」「curlで証明書を確認するオプションは？」と毎日Googleを10回以上検索している。

```bash
# the-book-of-secret-knowledgeをローカルにクローンしてObsidianに統合

git clone https://github.com/trimstray/the-book-of-secret-knowledge
cp -r the-book-of-secret-knowledge ~/Obsidian/references/

# よく忘れるコマンドをすぐ検索できるようにfzfを統合
# ~/.bashrc に追加
bsearch() {
    grep -r "$1" ~/Obsidian/references/ --include="*.md" -A 3 | \
    fzf --ansi | head -20
}

# 使い方
bsearch "ssh tunnel"
# → SSHトンネルの全コマンドパターンがfzfで表示される

bsearch "curl ssl"
# → curlでSSL証明書を扱う全コマンドが表示される

# よく使うコマンドはAnkiフラッシュカードに変換
# → 週1回のレビューで暗記

# 3ヶ月後の変化:
# - Google検索回数: 1日10回 → 2〜3回
# - 「あのコマンドどうだっけ」のSlack質問: 週5回 → ほぼゼロ
# - 後輩が入ったとき「このリポジトリを最初に読むといい」と渡せるリソースになった
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| awesome-sysadmin | システム管理ツール・リソースのリスト（実践例なし） |
| tldr-pages | コマンドの簡易説明（the-book-of-secret-knowledgeより浅い） |
| cheat.sh | ターミナルからコマンド例を検索できるサービス |
| HackTricks | ペネトレーションテスト特化の知識ベース |

---

## 参考リンク

- [公式リポジトリ](https://github.com/trimstray/the-book-of-secret-knowledge)
