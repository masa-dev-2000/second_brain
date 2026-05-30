# ストーリー7：「CRMを生きた情報に」
副題 ── 渡辺健一と、HubSpotと社内DBのすれ違い ──

## 登場人物
渡辺 健一（わたなべ けんいち）、42歳。BtoB SaaS企業の営業部長。  
20名の営業チームを率いており、顧客情報管理にHubSpot CRMを利用。  
自社の契約管理DB（PostgreSQL）は開発チームが管理しており、顧客の契約状況・利用データとHubSpotの情報がしばしば乖離していた。

## 問題
HubSpotの「顧客フェーズ」と実際の契約DBの状態が常に1〜3日ズレていた。  
営業担当者が「まだトライアル中」と思って営業しているのに、実はすでに本契約済みだった事例が月に6件。  
逆にトライアルが終了してから4日間、誰もアップセル連絡をしないケースも月7件発生。  
手動でのCSVエクスポート＆インポートによる同期作業に毎週月曜3時間かかっていた。

## 出会い
開発チームのエンジニアが「n8nならHubSpotとPostgreSQLを直接繋げる」と提案。  
営業部とエンジニアがペアを組んで週末の2日間でプロトタイプを構築した。

## 実装
```
【契約DB → HubSpot 同期フロー（リアルタイム）】
[PostgreSQL Trigger] contractsテーブルの
UPDATE/INSERTイベントを検知
    ↓
[HubSpot] contact_idでHubSpot連絡先を検索
    ↓
[IF] HubSpotに連絡先が存在するか？
    ↓ YES
[HubSpot] 契約ステータス・プラン・利用開始日を更新
    ↓ NO
[HubSpot] 新規コンタクトを作成

【HubSpot → 契約DB 同期フロー（日次）】
[Schedule Trigger] 毎日深夜2:00
    ↓
[HubSpot] 過去24時間に更新されたコンタクト一覧取得
    ↓
[Loop] 各コンタクトを処理
    ↓
[PostgreSQL] 顧客テーブルを UPSERT
    ↓
[IF] 差異があった件数 > 0 ?
    ↓
[Slack] #crm-syncチャンネルに同期サマリーを投稿

【アップセルトリガーフロー】
[PostgreSQL Trigger] trial_end_dateが今日のレコードを検出
    ↓
[HubSpot] 担当営業担当者を取得
    ↓
[Slack] 担当者にDMで「本日トライアル終了・要フォロー」通知
    ↓
[HubSpot] タスク「アップセル連絡」を自動作成
```

## 壁
PostgreSQL TriggerはWAL（Write-Ahead Logging）を有効にする必要があり、本番DBへの設定変更をDBAが許可しなかった。セキュリティ審査に3週間かかった。

## 解決
WALを使うトリガー方式を諦め、5分ごとに「last_updated > 5分前」のレコードをポーリングするSchedule Trigger方式に変更。リアルタイム性は落ちたが許容範囲内（最大5分の遅延）として合意した。セキュリティ審査不要でその日のうちに本番稼働できた。

## 結果
| 指標 | Before | After |
|------|--------|-------|
| CRM同期の遅延 | 最大3日 | 最大5分 |
| 誤フェーズ営業の発生（月） | 6件 | 0件 |
| アップセル機会損失（月） | 7件 | 0件 |
| 手動CSV同期作業（週） | 3時間 | 0時間 |

## 使ったn8nノード・機能
| ノード/機能 | 用途 |
|-----------|------|
| PostgreSQL Trigger / Schedule Trigger | DBの変更検知・定時ポーリング |
| HubSpot（検索・更新・作成） | CRMデータの読み書き |
| PostgreSQL（UPSERT） | 社内DBの更新 |
| IF | 存在チェック・差異チェック |
| Loop（SplitInBatches） | 大量レコードの分割処理 |
| Slack | 担当者DM・同期サマリー通知 |
