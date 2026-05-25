# openwa/openwa

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [openwa/openwa](https://github.com/openwa/openwa) |
| 言語 | TypeScript / Node.js |
| 総スター数 | 31,847 |
| 本日のスター | +445 |
| ライセンス | AGPL-3.0 |
| トレンド順位 | #24相当（2026/05/22） |
| カテゴリ | インフラ・開発ツール / WhatsApp APIゲートウェイ |

---

## 概要

WhatsApp Businessを自社サーバーで運用できるオープンソースAPIゲートウェイ。WhatsApp Business APIは公式クラウドが必須で月額費用がかかるが、OpenWAは自己ホスト型のREST APIとして提供し、メッセージの送受信・グループ管理・メディア転送・Webhookを無料で運用できる。

Node.js + TypeScriptで構築され、WhatsAppのWeb版プロトコルを使用。CRMシステム・カスタマーサポートツール・通知システムとの統合が容易。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **メッセージ送受信** | テキスト・画像・動画・音声・ファイルの送受信 |
| **グループ管理** | グループ作成・メンバー管理・一斉送信 |
| **Webhook** | 受信メッセージをWebhookで任意のシステムに転送 |
| **REST API** | シンプルなHTTP APIで全機能を操作 |
| **セッション管理** | 複数WhatsAppアカウントを1サーバーで管理 |
| **メディア処理** | 画像・動画の送信・受信・保存 |

---

## あるとないとの違い

| 観点 | 公式WhatsApp Business API | OpenWA |
|------|--------------------------|--------|
| 費用 | $0.05〜$0.15/メッセージ＋月額基本料 | 自己ホストで無料 |
| データの場所 | Metaのサーバー | 自社サーバー |
| セットアップ | Business認証（数日〜数週間） | QRコード認証で即日 |
| カスタマイズ | Meta承認テンプレートのみ | 任意のメッセージ形式 |
| 利用規約 | Meta規約に従う | 自己責任で運用 |

---

## 環境構築方法

### 前提条件
- Node.js 18以上
- WhatsAppアカウント（Businessアカウント推奨）
- Docker（推奨）

### Docker構築（推奨）
```bash
git clone https://github.com/openwa/openwa
cd openwa

cp .env.example .env
# .envでポートとAPI認証トークンを設定

docker-compose up -d

# QRコードを表示してWhatsAppでスキャン
docker logs openwa -f
# → QRコードがターミナルに表示される
# WhatsApp → その他のデバイスにリンク → QRコードをスキャン
```

### .envの設定
```bash
PORT=3000
API_TOKEN=your-secret-token-here  # REST API認証用
SESSION_DATA_PATH=./sessions       # セッション保存パス
WEBHOOK_URL=https://your-app.com/webhook  # 受信メッセージの転送先
```

### Node.js直接インストール
```bash
npm install
npm run build
npm start

# → http://localhost:3000 でAPIが起動
```

### 動作確認
```bash
# テストメッセージを送信
curl -X POST http://localhost:3000/api/send \
  -H "Authorization: Bearer your-secret-token-here" \
  -H "Content-Type: application/json" \
  -d '{"to": "819012345678@c.us", "message": "テスト送信"}'

# → WhatsAppにメッセージが届けば成功
# 電話番号形式: 国番号+番号@c.us（日本: 819012345678@c.us）
```

---

## ベストプラクティス

1. **Webhookでメッセージを受信してCRMに記録:**
```javascript
// Webhookハンドラ（Express.js）
app.post('/webhook', (req, res) => {
    const { from, body, timestamp } = req.body;
    
    // CRMにメッセージを記録
    crm.addMessage({
        channel: 'whatsapp',
        from: from,
        content: body,
        timestamp: new Date(timestamp * 1000)
    });
    
    // 自動返信（営業時間外）
    const hour = new Date().getHours();
    if (hour < 9 || hour >= 18) {
        sendMessage(from, "営業時間外のため、翌営業日9時以降に返信いたします。");
    }
    
    res.sendStatus(200);
});
```

2. **グループへの一斉通知を自動化:**
```javascript
// 在庫アラートをグループに自動送信
async function sendInventoryAlert(productName, quantity) {
    const groupId = '1234567890-1234567890@g.us';
    
    await fetch('http://localhost:3000/api/send', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${API_TOKEN}` },
        body: JSON.stringify({
            to: groupId,
            message: `⚠️ 在庫アラート\n商品: ${productName}\n残数: ${quantity}個\n発注が必要です`
        })
    });
}
```

3. **メディアファイルの送信:**
```javascript
// 請求書PDFをWhatsAppで送信
async function sendInvoice(phoneNumber, pdfPath) {
    const formData = new FormData();
    formData.append('to', `${phoneNumber}@c.us`);
    formData.append('file', fs.createReadStream(pdfPath));
    formData.append('caption', '請求書をお送りします。ご確認ください。');
    
    await fetch('http://localhost:3000/api/send-file', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${API_TOKEN}` },
        body: formData
    });
}
```

4. **セッションの永続化と再接続:**
```javascript
// QRコードスキャン後のセッションを保存
// → サーバー再起動後も自動再接続
// sessions/ ディレクトリを定期的にバックアップ
// (QRコードの再スキャンが不要になる)
```

---

## セキュリティ観点

### WhatsApp利用規約の問題
- **重要:** OpenWAはWhatsAppの利用規約に違反する可能性がある
- Metaは非公式APIの使用によるアカウント凍結を実施している
- ビジネスクリティカルな用途では**公式WhatsApp Business API**を使用を検討する

```bash
# リスク軽減策:
# 1. 専用のWhatsAppアカウントを使用（個人アカウントを使わない）
# 2. スパム送信・大量メッセージングを避ける
# 3. ユーザーが希望した通知のみ送信する
```

### API認証の強化
```bash
# .envで強力なトークンを使用
API_TOKEN=$(openssl rand -hex 32)

# HTTPS必須（HTTP通信はトークンが平文で流れる）
# Nginx + Let's Encrypt でTLS化
```

### データの保護
```bash
# セッションデータは認証情報を含む → 厳重に管理
chmod 700 ./sessions
# バックアップ時は暗号化
tar czf - sessions/ | gpg --symmetric > sessions_backup.tar.gz.gpg
```

---

## ペルソナ設定と使い方

### ペルソナ：田中 由美（37歳・不動産仲介業・顧客の90%がWhatsAppで問い合わせ）

田中さんが働くタイ・バンコクの不動産仲介会社では、顧客の大半がLINEではなくWhatsAppで問い合わせてくる（外国人客が多いため）。月に200件以上の問い合わせをエージェント6人で対応しているが、担当者が離席中の問い合わせを見落とすことが多く、クレームになっていた。

```javascript
// 不動産問い合わせ自動応答システム

const express = require('express');
const app = express();

// 物件情報データベース（簡略化）
const properties = {
    'スクンビット': ['2BR, 45,000THB/月', '1BR, 28,000THB/月'],
    'シーロム': ['3BR, 80,000THB/月', '2BR, 55,000THB/月']
};

app.post('/webhook', async (req, res) => {
    const { from, body } = req.body;
    
    // キーワードに応じて自動返信
    let reply = null;
    
    if (body.includes('スクンビット') || body.includes('sukhumvit')) {
        reply = `スクンビットエリアの空室物件:\n` +
                properties['スクンビット'].map(p => `• ${p}`).join('\n') +
                `\n\nご内見のご希望はこちらからどうぞ:\nhttps://cal.com/tanaka/viewing`;
    } else if (body.match(/こんにちは|hello|สวัสดี/i)) {
        reply = `田中不動産へようこそ！\n\n` +
                `お探しのエリアをお知らせください:\n` +
                `• スクンビット\n• シーロム\n• アソーク\n• プロンポン`;
    }
    
    if (reply) {
        await sendWhatsApp(from, reply);
    } else {
        // 担当者にエスカレーション通知
        await sendWhatsApp(AGENT_PHONE, `⚡ 未対応の問い合わせ\nFrom: ${from}\n内容: ${body}`);
    }
    
    res.sendStatus(200);
});

// 内見予約確認を自動送信
async function sendViewingConfirmation(clientPhone, propertyName, datetime) {
    await sendWhatsApp(clientPhone,
        `内見予約を承りました✅\n\n` +
        `物件: ${propertyName}\n` +
        `日時: ${datetime}\n\n` +
        `前日に再度ご連絡いたします。`
    );
}

// 結果:
// - 問い合わせ返信速度: 平均2時間 → 即時（自動返信）+ 30分以内（要対応）
// - 見落とし件数: 月5〜10件 → ほぼゼロ
// - エージェント1人あたりの対応件数: +30%向上
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| WhatsApp Business API（公式） | Meta公式・規約準拠・費用あり |
| Twilio WhatsApp API | 公式パートナー経由のクラウドAPI |
| Baileys | WhatsApp Web APIライブラリ（OpenWAの基盤） |
| wa-automate | 別の非公式WhatsApp自動化ライブラリ |

---

## 参考リンク

- [公式リポジトリ](https://github.com/openwa/openwa)

> **免責事項:** 本ツールはWhatsAppの利用規約に違反する可能性があります。使用前に規約を確認し、自己責任で使用してください。
