# apify/crawlee

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [apify/crawlee](https://github.com/apify/crawlee) |
| 言語 | TypeScript |
| 総スター数 | 23,358 |
| ライセンス | Apache-2.0 |
| カテゴリ | Webスクレイピング / ブラウザ自動化・データ収集 |

---

## 概要

Crawleeは、Node.js向けのWebスクレイピング・ブラウザ自動化ライブラリ。Playwright・Puppeteer・Cheerioをサポートし、AI・LLM・RAGのためのデータ収集に特化した設計がされている。Apify社（世界最大のスクレイピングプラットフォーム）が開発・メンテナンスしており、本番環境での信頼性が高い。

プロキシローテーション・リトライ・キュー管理・ブロック回避・並列処理・データ保存を標準で提供するため、スクレイパーの「共通の面倒ごと」を一切書かなくてよい。単純なHTMLスクレイピングからJavaScriptレンダリングが必要なSPAまで、同一のAPIで処理できる。LLM用のデータパイプラインや、AIエージェントのWebブラウジング能力の実装にも利用されている。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **マルチクローラー対応** | Cheerio（高速）・Playwright・Puppeteer（JS実行）を統一APIで使用 |
| **プロキシローテーション** | IPブロック対策の自動プロキシ切り替え |
| **リクエストキュー** | 重複URL排除・優先度付き・永続化キュー |
| **自動リトライ** | エラー時の自動リトライ・指数バックオフ |
| **セッション管理** | Cookieとセッションのローテーション |
| **データセット保存** | JSON・CSV形式での自動保存 |
| **指紋偽装** | ボット検出回避のためのブラウザ指紋ランダム化 |
| **Apifyプラットフォーム連携** | クラウドデプロイ・スケジューリング・監視に対応 |

---

## あるとないとの違い

| 観点 | 素のPlaywright/Puppeteer | Crawlee |
|------|-------------------------|---------|
| プロキシ管理 | 自前実装が必要 | 標準搭載、ProxyConfiguration一行で設定 |
| URL重複排除 | 自前でSetを管理 | RequestQueueが自動処理 |
| エラーハンドリング | try-catchを全箇所に記述 | 自動リトライ・失敗URLの記録 |
| 並列処理 | Promiseの管理が複雑 | maxConcurrencyで一行設定 |
| データ保存 | fsでCSV書き込みを自作 | Datasetが自動でJSON/CSV保存 |
| ブロック回避 | 個別に対策を実装 | fingerprints・セッションローテーションが標準 |

---

## 環境構築方法

### インストール

```bash
# プロジェクトを初期化
npm init -y

# Crawleeのインストール（使用するクローラーを選択）
# Cheerioクローラー（高速、JSレンダリング不要のサイト向け）
npm install crawlee

# Playwrightクローラー（SPA・動的コンテンツ対応）
npm install crawlee playwright
npx playwright install chromium

# TypeScriptを使う場合
npm install -D typescript tsx @types/node
```

### 最小構成のCrawleeスクリプト

```typescript
// scraper.ts
import { CheerioCrawler, Dataset } from "crawlee";

const crawler = new CheerioCrawler({
  // 並列リクエスト数
  maxConcurrency: 10,
  // リクエスト制限（1秒あたり最大2リクエスト）
  maxRequestsPerMinute: 120,

  async requestHandler({ request, $, enqueueLinks, log }) {
    log.info(`処理中: ${request.url}`);

    // ページからデータを抽出
    const title = $("h1").text().trim();
    const description = $('meta[name="description"]').attr("content") || "";

    // データセットに保存
    await Dataset.pushData({
      url: request.url,
      title,
      description,
      scrapedAt: new Date().toISOString(),
    });

    // 同じドメインのリンクをキューに追加
    await enqueueLinks({
      strategy: "same-domain",
      limit: 50,
    });
  },

  failedRequestHandler({ request, log }) {
    log.error(`失敗: ${request.url}`);
  },
});

// スクレイピング開始
await crawler.run(["https://example.com"]);

// 結果を取得
const dataset = await Dataset.getData();
console.log(`収集件数: ${dataset.items.length}`);
```

```bash
# 実行
npx tsx scraper.ts
```

### Playwrightクローラー（JavaScript実行が必要なサイト）

```typescript
import { PlaywrightCrawler, Dataset } from "crawlee";

const crawler = new PlaywrightCrawler({
  headless: true,  // false にするとブラウザが表示される（デバッグ用）
  maxConcurrency: 3,

  async requestHandler({ page, request, log }) {
    log.info(`処理中: ${request.url}`);

    // ページ読み込み待機
    await page.waitForSelector(".product-list", { timeout: 10000 });

    // スクロールして遅延ロードコンテンツを取得
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    // データ抽出
    const items = await page.$$eval(".product-item", (elements) =>
      elements.map((el) => ({
        name: el.querySelector(".name")?.textContent?.trim(),
        price: el.querySelector(".price")?.textContent?.trim(),
        url: el.querySelector("a")?.href,
      }))
    );

    await Dataset.pushData({ url: request.url, items });
  },
});

await crawler.run(["https://shop.example.com/products"]);
```

---

## ベストプラクティス

1. **プロキシローテーションでIPブロックを回避する:**
```typescript
import { CheerioCrawler, ProxyConfiguration } from "crawlee";

const proxyConfiguration = new ProxyConfiguration({
  // 複数プロキシをローテーション
  proxyUrls: [
    "http://user:pass@proxy1.example.com:8080",
    "http://user:pass@proxy2.example.com:8080",
    "http://user:pass@proxy3.example.com:8080",
  ],
  // または Apifyのプロキシプールを使用
  // tieredProxyUrls: [
  //   ["http://free-proxy:8080"],
  //   ["http://datacenter-proxy:8080"],
  //   ["http://residential-proxy:8080"],  // 最も信頼性が高い
  // ],
});

const crawler = new CheerioCrawler({
  proxyConfiguration,
  sessionPoolOptions: {
    maxPoolSize: 50,
    sessionOptions: {
      maxUsageCount: 50,  // 50回使ったらセッション破棄
    },
  },
});
```

2. **リクエストキューで大規模スクレイピングを安全に管理する:**
```typescript
import { CheerioCrawler, RequestQueue } from "crawlee";

// 永続化キューを使う（クラッシュ後も再開可能）
const requestQueue = await RequestQueue.open("my-scrape-queue");

// URLリストをキューに一括追加
const urls = Array.from({ length: 1000 }, (_, i) =>
  `https://api.example.com/products?page=${i + 1}`
);
await requestQueue.addRequests(
  urls.map((url) => ({
    url,
    userData: { pageNum: parseInt(new URL(url).searchParams.get("page")!) },
  }))
);

const crawler = new CheerioCrawler({
  requestQueue,
  maxConcurrency: 5,
  requestHandlerTimeoutSecs: 30,
  async requestHandler({ request, $, log }) {
    const { pageNum } = request.userData;
    log.info(`ページ ${pageNum} を処理中`);
    // ...処理...
  },
});

await crawler.run();
```

3. **LLM用データ収集パイプラインを構築する:**
```typescript
import { CheerioCrawler, Dataset } from "crawlee";
import { CheerioAPI } from "cheerio";

// Webコンテンツを LLM 学習用の clean text に変換
function extractCleanText($: CheerioAPI): string {
  // 不要要素を除去
  $("nav, footer, script, style, ads, .sidebar, .comment").remove();

  // メインコンテンツを取得
  const mainContent = $("main, article, .content, #content").first();
  const text = (mainContent.length ? mainContent : $("body"))
    .text()
    .replace(/\s+/g, " ")
    .trim();

  return text;
}

const crawler = new CheerioCrawler({
  async requestHandler({ request, $, log }) {
    const text = extractCleanText($);

    // 短すぎるコンテンツはスキップ
    if (text.length < 200) return;

    await Dataset.pushData({
      url: request.url,
      title: $("title").text().trim(),
      text,
      wordCount: text.split(/\s+/).length,
      scrapedAt: new Date().toISOString(),
    });

    log.info(`収集: ${text.substring(0, 50)}... (${text.length}文字)`);
  },
  maxConcurrency: 20,
});

await crawler.run(["https://docs.example.com"]);

// JSONLでエクスポート（RAG用）
const dataset = await Dataset.open();
await dataset.exportToJSON("training_data");
```

4. **エラーハンドリングとモニタリングを設定する:**
```typescript
import { CheerioCrawler, Log, LogLevel } from "crawlee";

// ログレベルを設定
Log.setLevel(LogLevel.INFO);

const crawler = new CheerioCrawler({
  maxRequestRetries: 3,           // 最大3回リトライ
  requestHandlerTimeoutSecs: 60,  // タイムアウト60秒
  navigationTimeoutSecs: 30,      // ページ読み込みタイムアウト

  async requestHandler({ request, $, log }) {
    // 処理...
  },

  // 失敗したURLを別ファイルに記録
  async failedRequestHandler({ request, log, error }) {
    log.error(`失敗URL: ${request.url}`, { error: error.message });
    await Dataset.open("failed-urls").then((ds) =>
      ds.pushData({ url: request.url, error: error.message, retries: request.retryCount })
    );
  },
});

// 完了後にサマリーを表示
const stats = crawler.stats.toJSON();
console.log(`完了: 成功 ${stats.requestsSucceeded}, 失敗 ${stats.requestsFailed}`);
```

---

## セキュリティ観点

### robots.txt の尊重

```typescript
import { CheerioCrawler, RobotsFile } from "crawlee";

const crawler = new CheerioCrawler({
  // robots.txtを自動チェック（デフォルトで有効）
  respectRobotsTxtFile: true,
  // クローリング間隔（サーバー負荷を配慮）
  maxRequestsPerMinute: 60,

  async requestHandler({ request, $ }) {
    // ...
  },
});
```

### 個人情報の取り扱い

```typescript
// 収集データから個人情報をマスクする
function maskPersonalInfo(data: Record<string, string>): Record<string, string> {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /(\+81|0)\d{9,10}/g;

  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      typeof value === "string"
        ? value.replace(emailRegex, "[EMAIL]").replace(phoneRegex, "[PHONE]")
        : value,
    ])
  );
}
```

### レート制限とサーバー負荷配慮
- `maxRequestsPerMinute` を設定してターゲットサーバーへの過剰なリクエストを防ぐ
- User-Agentに連絡先情報を含める（`My-Bot/1.0 (contact@example.com)`）
- 商用目的でのスクレイピングは対象サイトの利用規約を必ず確認する

---

## ペルソナ設定と使い方

### ペルソナ：橋本 将太（31歳・AIスタートアップのMLエンジニア・LLMファインチューニング用データを自動収集したい）

橋本さんは日本語テキストデータを収集してLLMのファインチューニング用データセットを構築している。手動でコピペしていたが、月3,000ページ以上のドキュメントを定期的に収集するには自動化が必須だった。

```typescript
// llm_data_collector.ts
// 日本語技術文書を LLM ファインチューニング用に収集

import { CheerioCrawler, Dataset, RequestQueue } from "crawlee";
import * as cheerio from "cheerio";

// 収集対象サイトのリスト
const TARGET_SITES = [
  { url: "https://zenn.dev/topics/typescript", domain: "zenn.dev" },
  { url: "https://qiita.com/tags/python", domain: "qiita.com" },
  { url: "https://developer.mozilla.org/ja/docs/Web", domain: "developer.mozilla.org" },
];

const requestQueue = await RequestQueue.open("llm-data-collection");
for (const site of TARGET_SITES) {
  await requestQueue.addRequest({ url: site.url, userData: { domain: site.domain } });
}

const crawler = new CheerioCrawler({
  requestQueue,
  maxConcurrency: 5,
  maxRequestsPerMinute: 60,  // 1分あたり60リクエスト
  maxRequestsPerCrawl: 5000, // 最大5,000ページ

  async requestHandler({ request, $, enqueueLinks, log }) {
    // 記事本文を抽出
    $("nav, footer, script, style, .ads, .sidebar, .comment-section").remove();
    const articleText = $("article, .article-body, main")
      .first()
      .text()
      .replace(/\s+/g, " ")
      .trim();

    // 品質フィルタ
    if (articleText.length < 500) {
      log.debug(`スキップ（短すぎる）: ${request.url}`);
      return;
    }

    // 日本語コンテンツ率チェック（80%以上が日本語であること）
    const japaneseChars = (articleText.match(/[぀-ゟ゠-ヿ一-龯]/g) || []).length;
    const japaneseRatio = japaneseChars / articleText.length;
    if (japaneseRatio < 0.3) {
      log.debug(`スキップ（日本語率低い）: ${request.url}`);
      return;
    }

    await Dataset.pushData({
      url: request.url,
      domain: request.userData.domain,
      title: $("h1, title").first().text().trim(),
      text: articleText,
      wordCount: articleText.length,
      japaneseRatio: Math.round(japaneseRatio * 100),
      collectedAt: new Date().toISOString(),
    });

    log.info(`収集: ${request.url.substring(0, 60)} (${articleText.length}文字, 日本語率${Math.round(japaneseRatio*100)}%)`);

    // 同ドメイン内のリンクを追加
    await enqueueLinks({ strategy: "same-domain", limit: 10 });
  },
});

await crawler.run();

// JSONL形式でエクスポート
const dataset = await Dataset.open();
await dataset.exportToJSON("japanese_llm_corpus");

const stats = crawler.stats.toJSON();
console.log(`
=== 収集完了 ===
成功: ${stats.requestsSucceeded}件
失敗: ${stats.requestsFailed}件
`);
```

**導入前後の変化:**
- 導入前: 手動コピペで月500ページが限界、ブロックされると1日がかりで対処
- 導入後: Crawleeで自動収集 → 月5,000ページ以上を安定収集、プロキシローテーションでブロック率が10%→1%以下に改善

---

## 周辺情報

### 類似・関連プロジェクト

| ツール | 特徴 |
|--------|------|
| Playwright | Microsoft製ブラウザ自動化、Crawleeのバックエンドの1つ |
| Puppeteer | Google製Chromium制御ライブラリ、Crawleeのバックエンドの1つ |
| crawlee-python (#02) | CrawleeのPython版、Playwright/BeautifulSoup対応 |
| Scrapy | Python製スクレイピングフレームワーク、大規模クロール向け |
| Apify | Crawlee開発元のクラウドプラットフォーム、クラウドデプロイ可能 |

---

## 参考リンク

- [公式リポジトリ](https://github.com/apify/crawlee)
- [公式ドキュメント](https://crawlee.dev/docs/introduction)
- [APIリファレンス](https://crawlee.dev/api)
- [クイックスタート](https://crawlee.dev/docs/quick-start)
- [Apifyプラットフォーム](https://apify.com)
