# frappe/erpnext

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [frappe/erpnext](https://github.com/frappe/erpnext) |
| 言語 | Python / JavaScript |
| 総スター数 | 24,156 |
| 本日のスター | +287 |
| ライセンス | GPL-3.0 |
| トレンド順位 | #31相当（2026/05/22） |
| カテゴリ | インフラ・開発ツール / オープンソースERP |

---

## 概要

SAP・Oracle NetSuite・Microsoft Dynamicsの完全オープンソース代替ERP（Enterprise Resource Planning）システム。会計・在庫・製造・購買・販売・HRM・プロジェクト管理・CRMを1つのシステムで統合管理できる。

Frappe Frameworkをベースに構築され、Python + JavaScript（Vue.js）で動作。中小企業から数百名規模の企業まで自己ホストで運用可能。商用ERP（SAP等）と比べて初期費用が1/10〜1/100で済む。

---

## 主なモジュール

| モジュール | 機能 |
|-----------|------|
| **会計** | 複式簿記・財務諸表・税務・多通貨対応 |
| **在庫管理** | ロット管理・シリアル番号・バーコード・倉庫管理 |
| **製造** | BOM（部品表）・生産計画・ワークオーダー |
| **購買** | 発注・仕入先管理・受入検査 |
| **販売** | 見積→受注→出荷→請求のパイプライン |
| **HRM** | 従業員管理・勤怠・給与計算・採用 |
| **CRM** | リード管理・商談・顧客分析 |
| **プロジェクト** | タスク・タイムシート・工数管理 |

---

## あるとないとの違い

| 観点 | 個別ツール（Excel・Freee等） | ERPNext |
|------|---------------------------|---------|
| データ統合 | 部門間でExcelを送り合う | 全部門が同一データベースを参照 |
| 在庫と会計の連動 | 手動で仕訳を起票 | 入出庫と同時に自動仕訳 |
| 受注〜請求 | 複数システムに二重入力 | 受注から請求まで1つのシステムで完結 |
| 導入コスト | SAP: 数千万〜数億円 | 自己ホストで初期費用ゼロ |

---

## 環境構築方法

### 方法1：Easy Install Script（推奨）
```bash
# Ubuntu 22.04 LTS の場合
sudo apt update && sudo apt install -y git python3-pip

# Frappe Benchをインストール
pip3 install frappe-bench

# ERPNextをインストール
bench init frappe-bench --frappe-branch version-15
cd frappe-bench

# 新しいサイトを作成
bench new-site mycompany.local
bench get-app erpnext --branch version-15
bench --site mycompany.local install-app erpnext

# 開発サーバー起動
bench start
# → http://mycompany.local:8000 にアクセス
```

### 方法2：Docker（最速）
```bash
git clone https://github.com/frappe/frappe_docker
cd frappe_docker

cp example.env .env
# .envでドメイン・DB設定を変更

docker-compose -f compose.yaml \
  -f overrides/compose.erpnext.yaml \
  -f overrides/compose.https.yaml up -d

# → https://your-domain.com でERPNextが起動
```

### 初期設定
```
1. http://localhost:8000 にアクセス
2. 管理者パスワードを設定
3. セットアップウィザードで以下を設定:
   - 会社名・国・通貨
   - 業種（製造/小売/サービス等）
   - 会計期間（1月〜12月等）
4. 最初のユーザーを作成
```

### 動作確認
```bash
# 管理者でログインしてダッシュボードが表示されれば成功
# テスト：勘定科目一覧の確認
# 会計 > 勘定科目 > 勘定科目一覧
```

---

## ベストプラクティス

1. **カスタムフォームで業務に合わせて拡張:**
```python
# Frappe Frameworkでカスタムフィールドを追加
# ERPNext > カスタマイズ > カスタムフィールド

# 例：発注書に「承認者」フィールドを追加
{
    "doctype": "Purchase Order",
    "fieldname": "custom_approver",
    "fieldtype": "Link",
    "options": "User",
    "label": "承認者",
    "insert_after": "company"
}
```

2. **ワークフローで承認プロセスを自動化:**
```
発注書のワークフロー例:
草稿 → 申請中（担当者が提出）
→ 部長承認待ち（10万円以上）
→ 役員承認待ち（100万円以上）
→ 承認済み → 発注

設定場所: 設定 > ワークフロー > 新しいワークフロー
```

3. **APIで外部システムと連携:**
```python
import requests

# ERPNextのREST APIで受注一覧を取得
response = requests.get(
    'https://erp.company.com/api/resource/Sales Order',
    params={
        'filters': '[["status", "=", "To Deliver and Bill"]]',
        'fields': '["name", "customer", "grand_total", "delivery_date"]',
        'limit': 100
    },
    auth=('api_key', 'api_secret')
)

orders = response.json()['data']

# 倉庫システムに未出荷の受注を連携
for order in orders:
    warehouse_system.create_pick_order(order)
```

4. **定期レポートを自動生成:**
```python
# ERPNext内のスケジューラーで月次レポートを自動生成
# 設定 > メール > メールダイジェスト で設定

# またはAPIで月次PLを取得
response = requests.get(
    'https://erp.company.com/api/method/erpnext.accounts.report.profit_and_loss_statement.profit_and_loss_statement.execute',
    params={
        'filters': {
            'company': 'My Company',
            'fiscal_year': '2026',
            'period': 'Monthly'
        }
    }
)
```

---

## セキュリティ観点

### 本番環境のハードニング
```bash
# 1. HTTPSの必須化
# /etc/nginx/sites-available/erpnext でSSLリダイレクト設定

# 2. ファイアウォール設定
ufw allow 80/tcp
ufw allow 443/tcp
ufw deny 8000/tcp  # 開発ポートをブロック

# 3. 定期バックアップの設定
bench --site mycompany.local set-config backup_limit 30  # 30世代保持
# cronで毎日バックアップ
0 2 * * * cd /home/frappe/frappe-bench && bench --site all backup
```

### ユーザー権限の管理
```
ERPNextのロールベースアクセス制御:
- 会計ユーザー: 会計モジュールのみアクセス
- 倉庫スタッフ: 在庫モジュールのみ
- 営業担当: CRM・販売モジュールのみ
- 管理者: 全モジュール

設定 > ユーザーと権限 > ロールの権限管理 で細かく制御
```

### データのバックアップと復元
```bash
# バックアップ
bench --site mycompany.local backup --with-files

# 別サーバーへの復元
bench --site mycompany.local restore /path/to/backup.sql.gz \
    --with-public-files /path/to/files.tar.gz \
    --with-private-files /path/to/private-files.tar.gz
```

---

## ペルソナ設定と使い方

### ペルソナ：松本 剛（45歳・製造業社長・従業員80名・年商15億円）

松本さんの会社では在庫管理はExcel、会計はfreee、販売管理は別の受発注システムを使い、データを月次で手動集計していた。システム間のデータ齟齬が頻発し、経理担当者が月末に残業して突き合わせていた。SAPの導入見積もりは3,000万円だったため諦めていた。

```bash
# ERPNextをVPSに自己ホスト（月額5,000円のVPSで動作）

# 段階的導入計画:
# Phase 1（1ヶ月目）: 会計モジュールのみ導入
#   → freeeからERPNextに移行
#   → freeeの月額¥3,300を削減

# Phase 2（3ヶ月目）: 在庫・購買モジュールを追加
#   → ExcelのPO管理をERPNextに移行
#   → 発注書が自動で仕入先にメール送信

# Phase 3（6ヶ月目）: 製造・販売モジュールを追加
#   → 受注→BOM展開→製造指示→出荷→請求が一気通貫

# 1年後の効果:
# - 月次決算作業: 5日 → 1日（データが既に統合されているため）
# - 経理残業時間: 月40時間 → 月8時間
# - 在庫差異: 月平均3件 → ほぼゼロ
# - システム費用: 月¥15万（freee+受発注SaaS） → 月¥0.5万（VPS代のみ）
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| Odoo | 別のOSS ERP（よりモジュール数が多い・有料版あり） |
| Dolibarr | シンプルなOSS ERP/CRM |
| SAP S/4HANA | エンタープライズ向け商用ERP |
| freee / マネーフォワード | 会計特化SaaS（ERP機能は限定的） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/frappe/erpnext)
- [公式ドキュメント](https://docs.erpnext.com/)
- [Frappe Cloud（ホスティングサービス）](https://frappecloud.com/)
