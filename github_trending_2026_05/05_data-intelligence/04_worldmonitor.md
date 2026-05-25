# worldmonitor/worldmonitor

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [worldmonitor/worldmonitor](https://github.com/worldmonitor/worldmonitor) |
| 言語 | TypeScript / Python |
| 総スター数 | 47,812 |
| 本日のスター | +198 |
| ライセンス | MIT |
| トレンド順位 | #38相当（2026/05/22） |
| カテゴリ | データ・インテリジェンス / 地政学インテリジェンス |

---

## 概要

500以上のニュースフィード・衛星データ・政府発表・SNSを統合し、地政学リスク・経済指標・自然災害・紛争を3Dグローブ上でリアルタイム可視化するオープンソースインテリジェンスダッシュボード。

92の証券取引所データと組み合わせることで、地政学イベントが金融市場に与える影響をリアルタイムで追跡できる。企業のリスク管理・研究機関・ジャーナリストがOSINT（オープンソースインテリジェンス）活動に使用する。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **3Dグローブ可視化** | Three.jsベースのインタラクティブ地球儀にイベントをリアルタイムプロット |
| **500+フィード統合** | AP・Reuters・BBC・政府発表・衛星画像を統合インジェスト |
| **92取引所データ** | 株価・為替・コモディティと地政学イベントを時系列で相関分析 |
| **AIサマリー** | LLMが複数ソースを統合して地域別・トピック別サマリーを自動生成 |
| **アラートシステム** | キーワード・地域・リスクレベルに応じたSlack/Email通知 |
| **タイムライン分析** | 過去イベントの時系列を再生してパターン分析 |

---

## あるとないとの違い

| 観点 | ない場合 | ある場合 |
|------|----------|----------|
| 地政学リスク把握 | 各メディアを個別にチェック（30〜60分/日） | 1画面で全世界のリスクを視覚的に把握（5分） |
| 市場への影響分析 | ニュースと株価を別ツールで手動照合 | 地政学イベントと市場変動が同一画面で相関表示 |
| 早期警戒 | 大手メディアが報じてから気づく | 政府発表・衛星データから先行して把握 |
| 地域横断分析 | 地域ごとに専門家が必要 | AIが複数地域の動向を統合サマリー |

---

## 環境構築方法

### 前提条件
- Docker & Docker Compose
- Node.js 18以上（開発時のみ）
- Python 3.11以上（バックエンド開発時のみ）
- APIキー（オプション：取引所データ・LLM用）

### Docker構築（推奨）
```bash
git clone https://github.com/worldmonitor/worldmonitor
cd worldmonitor

cp .env.example .env
# .envを編集してAPIキーを設定

docker-compose up -d

# → http://localhost:8080 でダッシュボードにアクセス
```

### .envの設定
```bash
# LLM（サマリー生成用）
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# 金融データ（オプション）
ALPHA_VANTAGE_KEY=...
POLYGON_API_KEY=...

# 通知
SLACK_WEBHOOK_URL=...

# データ保存
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
```

### ローカル開発環境
```bash
# フロントエンド
cd frontend
npm install
npm run dev  # http://localhost:3000

# バックエンド
cd backend
pip install -r requirements.txt
python main.py  # http://localhost:8000

# フィードインジェスター
cd ingester
python ingester.py --feeds config/feeds.yaml
```

### 動作確認
```bash
# フィードが取得されているか確認
curl http://localhost:8000/api/events?limit=10

# → JSONでイベントリストが返れば成功
```

---

## ベストプラクティス

1. **カスタムフィードを追加してカバレッジを広げる:**
```yaml
# config/feeds.yaml に追加
feeds:
  - name: "外務省プレスリリース"
    url: "https://www.mofa.go.jp/rss/news.rss"
    category: "government"
    language: "ja"
    region: "APAC"
  
  - name: "Bloomberg Asia"
    url: "https://feeds.bloomberg.com/asia/news.rss"
    category: "financial"
    region: "APAC"
```

2. **特定地域・トピックのアラートを設定:**
```yaml
# config/alerts.yaml
alerts:
  - name: "台湾海峡モニタリング"
    keywords: ["台湾", "Taiwan Strait", "TSMC", "半導体供給"]
    regions: ["East Asia"]
    risk_level: medium
    notify:
      slack: "#geopolitical-risk"
      email: "risk@company.com"
    cooldown_hours: 4  # 4時間以内の重複通知をブロック
```

3. **金融相関分析をAPIで取得:**
```python
import requests

# 過去30日間の台湾関連イベントと半導体株の相関を取得
response = requests.get('http://localhost:8000/api/correlations', params={
    'keywords': 'Taiwan,TSMC',
    'tickers': 'TSM,NVDA,ASML',
    'days': 30
})

correlation_data = response.json()
# → 地政学イベント発生から何日後に市場が動いたかの統計
```

4. **定期レポートをSlackに自動送信:**
```python
# 毎朝9時に前日の地政学サマリーを送信
import requests

def send_daily_briefing():
    summary = requests.get('http://localhost:8000/api/summary/daily').json()
    
    slack_payload = {
        "text": f"🌍 地政学デイリーブリーフ\n\n{summary['text']}\n\n高リスクイベント: {summary['high_risk_count']}件"
    }
    requests.post(SLACK_WEBHOOK_URL, json=slack_payload)
```

---

## セキュリティ観点

### データソースの信頼性
- **フィードの検証:** RSS/APIソースのドメインと証明書を定期確認
- **偽情報フィルタ:** 複数ソースで裏付けが取れていない情報は「未確認」フラグを表示

```yaml
# config/feeds.yaml でソースの信頼度を設定
feeds:
  - name: "Unknown Blog"
    url: "..."
    trust_level: low  # サマリー生成には含めるが表示に「未確認」ラベル
```

### アクセス制御
```nginx
# 社内専用ダッシュボードにする場合
location / {
    auth_basic "WorldMonitor";
    auth_basic_user_file /etc/nginx/.htpasswd;
    allow 10.0.0.0/8;
    deny all;
}
```

### 機密情報の扱い
- ダッシュボードに表示される情報は公開情報（OSINT）のみ
- 組織の意思決定・内部リスク評価をシステムに入力しない
- ログに個人の閲覧履歴が残る点をプライバシーポリシーで明示

---

## ペルソナ設定と使い方

### ペルソナ：渡辺 真一（48歳・製造業の調達部長・東南アジア6カ国でサプライチェーン管理）

渡辺さんの会社はタイ・ベトナム・マレーシア・インドネシア・フィリピン・インドに工場・調達先を持つ。2024年のミャンマー政変・2025年のベトナム洪水で供給が止まり、代替調達に2週間かかった。「もっと早く気づけた」という反省から、地政学リスクモニタリングを本格化したい。

```python
# 毎朝のサプライチェーンリスクブリーフィングを自動生成

import requests

SUPPLY_CHAIN_REGIONS = ["Southeast Asia", "South Asia"]
SUPPLY_CHAIN_KEYWORDS = [
    "flood", "typhoon", "strike", "coup", "sanctions",
    "洪水", "台風", "ストライキ", "クーデター", "制裁"
]

def morning_supply_chain_brief():
    # 過去24時間のリスクイベントを取得
    events = requests.get('http://worldmonitor.company.internal/api/events', params={
        'regions': ','.join(SUPPLY_CHAIN_REGIONS),
        'keywords': ','.join(SUPPLY_CHAIN_KEYWORDS),
        'hours': 24,
        'min_risk': 'medium'
    }).json()
    
    if not events['items']:
        return "✅ 本日のサプライチェーン地域: 重大リスクなし"
    
    brief = "⚠️ サプライチェーンリスクアラート\n\n"
    for event in events['items']:
        brief += f"• [{event['region']}] {event['title']}\n"
        brief += f"  リスク: {event['risk_level']} | ソース: {event['source']}\n\n"
    
    return brief

# → 毎朝8時にSlack #supply-chain-risk に自動投稿
# 渡辺さんは出勤前にスマホで確認し、必要なら工場担当者に事前連絡

# 2ヶ月の運用結果:
# - 2件の気象リスクを5日前に把握 → 代替調達の事前手配で供給停止ゼロ
# - リスク対応コスト: 従来比 -60%（緊急対応→予防対応）
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| daily_stock_analysis (#33) | 株式特化の分析（地政学データなし） |
| GDELT Project | 地政学イベントDB（可視化なし・APIのみ） |
| Global Incident Map | 商用インシデントマップ（カスタマイズ不可） |
| Palantir Gotham | エンタープライズ向け（数億円規模） |

### 活用ユースケース
- 多国展開企業のサプライチェーンリスク管理
- 投資ファンドのカントリーリスク分析
- ジャーナリスト・研究者のOSINT調査
- 政府機関・NGOの人道支援活動モニタリング

---

## 参考リンク

- [公式リポジトリ](https://github.com/worldmonitor/worldmonitor)
