# alireza0/s-ui

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [alireza0/s-ui](https://github.com/alireza0/s-ui) |
| 言語 | Go / Vue.js |
| 総スター数 | 18,934 |
| 本日のスター | +356 |
| ライセンス | GPL-3.0 |
| トレンド順位 | #28相当（2026/05/22） |
| カテゴリ | インフラ・開発ツール / プロキシ管理パネル |

---

## 概要

Sing-Box（高性能プロキシ/VPNツール）のWebUIパネル。Sing-BoxはVMess・VLESS・Trojan・Shadowsocks・Hysteria2等の多数プロトコルに対応したプロキシツールだが、設定がJSONで複雑。S-UIはブラウザからGUIでSing-Boxを管理できるようにする。

GoバックエンドとVue.jsフロントエンドで構築。複数ユーザーの接続管理・トラフィック制限・有効期限設定・QRコードによるクライアント設定共有が可能。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **マルチプロトコル** | VLESS・VMess・Trojan・Shadowsocks・Hysteria2・Reality対応 |
| **ユーザー管理** | 接続ごとのトラフィック制限・有効期限・使用量モニタリング |
| **QRコード共有** | クライアント設定をQRコードで簡単に共有 |
| **リアルタイム統計** | 接続数・帯域使用量・ユーザーごとの使用統計 |
| **自動TLS** | Let's Encryptによる自動証明書取得・更新 |
| **Telegram Bot** | ボットで接続状況・ユーザー追加をリモート管理 |

---

## あるとないとの違い

| 観点 | Sing-Box設定ファイルのみ | S-UI |
|------|------------------------|------|
| ユーザー追加 | JSONを手動編集 | ブラウザで数クリック |
| 使用量確認 | ログを手動解析 | ダッシュボードでリアルタイム確認 |
| 設定配布 | 設定ファイルを手動配布 | QRコードをスキャンするだけ |
| 複数ユーザー管理 | 設定が煩雑 | 一覧画面で一括管理 |

---

## 環境構築方法

### 前提条件
- Ubuntu/Debian Linux（推奨）
- ドメイン（TLS証明書のため）
- ポート443・ポート管理用ポート（デフォルト2053）の開放

### 自動インストールスクリプト
```bash
# ワンライナーインストール（Ubuntu/Debian）
bash <(curl -Ls https://raw.githubusercontent.com/alireza0/s-ui/master/install.sh)

# インストール後、管理パネルのURL・ユーザー名・パスワードが表示される
# → https://your-server:2053/panel でアクセス
```

### Dockerでのインストール
```bash
docker run -d \
  --name s-ui \
  --restart unless-stopped \
  -p 443:443 \
  -p 2053:2053 \
  -v /etc/s-ui:/etc/s-ui \
  alireza0/s-ui:latest
```

### 初期設定
```
1. https://your-server:2053/panel にアクセス
2. インストール時に表示されたユーザー名・パスワードでログイン
3. 証明書設定:
   - パネル設定 > SSL > Let's Encrypt でドメインを設定
4. 最初のインバウンド（接続設定）を作成:
   - インバウンド > 追加 > プロトコル選択（VLESS推奨）
   - ポート・UUIDを設定
5. ユーザーを追加してQRコードを取得
```

### 動作確認
```bash
# サービスの状態確認
systemctl status s-ui

# ログ確認
journalctl -u s-ui -f

# → パネルにアクセスできれば成功
```

---

## ベストプラクティス

1. **Reality プロトコルで検知を回避:**
```json
{
    "protocol": "vless",
    "settings": {
        "flow": "xtls-rprx-vision"
    },
    "streamSettings": {
        "security": "reality",
        "realitySettings": {
            "dest": "www.microsoft.com:443",
            "serverNames": ["www.microsoft.com"],
            "privateKey": "自動生成",
            "shortIds": ["自動生成"]
        }
    }
}
// → 正規のTLSトラフィックと区別がつかない
```

2. **ユーザーごとのトラフィック制限を設定:**
```
パネル > クライアント > 追加
- トータルトラフィック: 100 GB
- 有効期限: 30日
- IPごとの最大接続数: 2

→ 月100GBを超えると自動的に無効化
→ 30日後に自動失効
```

3. **Telegram Botで管理を自動化:**
```
パネル設定 > Telegram Bot
- Bot Token: BotFatherで取得したトークン
- Admin IDs: 管理者のTelegram IDを設定

→ Telegramから:
  /usage → 全ユーザーの使用量を確認
  /add_user 田中 30d 50gb → ユーザーを追加
  /status → サーバーの状態を確認
```

4. **Nginx でパネルを保護:**
```nginx
# パネルを特定IPのみアクセス可能に
location /panel {
    allow 203.0.113.0;  # 管理者のIP
    deny all;
    proxy_pass http://localhost:2053;
}
```

---

## セキュリティ観点

### 法的・倫理的考慮事項
- プロキシ・VPNツールの使用は国・地域によって規制が異なる
- 日本では自己のトラフィックの暗号化は合法だが、第三者へのサービス提供は要確認
- 検閲回避目的の使用が禁止されている国での使用は違法になりうる

### パネルのセキュリティ
```bash
# 1. デフォルトの管理者パスワードを即座に変更
# 2. パネルのポートを標準以外に変更
# 3. 2FAを有効化（パネル設定 > セキュリティ）
# 4. 管理パネルへのアクセスをIPホワイトリストで制限
```

### TLS証明書の管理
```bash
# Let's Encrypt証明書の自動更新を確認
systemctl status certbot.timer

# 証明書の有効期限を確認
openssl s_client -connect your-server:443 2>/dev/null | openssl x509 -noout -dates
```

---

## ペルソナ設定と使い方

### ペルソナ：加藤 誠（33歳・ITエンジニア・中国在住・日本のサービスにアクセスが必要）

加藤さんは上海勤務の日本人エンジニア。中国のグレートファイアウォールにより、GitHubへのアクセスが不安定、Google検索ができない、Slackが遅延するなど業務に支障が出ていた。市販VPNサービスは中国当局にブロックされることが多く、自前のサーバーが必要だと判断した。

```bash
# 日本のVPSに自前プロキシサーバーを構築

# 1. さくらVPS（東京リージョン）にUbuntu 22.04でVPSを契約
# 2. S-UIをインストール
bash <(curl -Ls https://raw.githubusercontent.com/alireza0/s-ui/master/install.sh)

# 3. Realityプロトコルで接続設定を作成（検知されにくい）
# パネル > インバウンド > 追加
# Protocol: VLESS + Reality
# Dest: www.microsoft.com:443（正規サイトになりすます）

# 4. iPhoneのQRコードをスキャン
# → Shadowrocket（iOS）やv2rayNG（Android）でスキャン

# 結果:
# - GitHubへのアクセス: 安定して繋がるように
# - Google Workspace: 正常動作
# - Slack: 遅延なく使用可能
# - 月額コスト: VPS ¥880/月 のみ
# （市販VPNサービスは$10〜15/月 かつ中国でブロックされることも多い）
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| 3x-ui | 同様のXray/V2rayパネル（より歴史が長い） |
| Marzban | Xrayベースの別管理パネル（APIが充実） |
| Outline | 個人・チーム向けのシンプルなShadowsocksパネル |
| WireGuard | オープンソースVPNプロトコル（プロキシとは異なる） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/alireza0/s-ui)
- [Sing-Box 公式ドキュメント](https://sing-box.sagernet.org/)

> **注意:** 本ツールの使用にあたっては、各国の法律・規制を遵守してください。
