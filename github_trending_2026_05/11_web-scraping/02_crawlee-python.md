# apify/crawlee-python

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [apify/crawlee-python](https://github.com/apify/crawlee-python) |
| 言語 | Python |
| 総スター数 | 9,074 |
| ライセンス | Apache-2.0 |
| カテゴリ | Webスクレイピング / AI・LLMデータ収集 |

---

## 概要

crawlee-pythonは、Node.js版Crawleeの思想をPythonに移植したWebスクレイピングライブラリ。BeautifulSoup・Playwright・ParselをサポートしてHTMLスクレイピングからJavaScriptレンダリングが必要な動的サイトまで同一のAPIで処理できる。AI/LLM向けのデータ収集パイプライン構築に特化した設計が特徴。

PythonはMLエンジニアの主要言語であり、LangChain・Haystack・LlamaIndexなどのAIフレームワークとの親和性が高い。crawlee-pythonはデータ収集（Webスクレイピング）とAIデータパイプライン（前処理・ベクトル化・RAG構築）をシームレスに繋ぐポジションを担っている。非同期（asyncio）ベースで高速処理が可能。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **マルチクローラー** | BeautifulSoupCrawler・PlaywrightCrawler・ParselCrawlerに対応 |
| **非同期処理** | asyncio/aiohttpベースで高速なI/O並列処理 |
| **プロキシローテーション** | IPブロック対策の自動プロキシ切り替え |
| **リクエストキュー** | 重複URL排除・永続化キュー・優先度管理 |
| **データセット保存** | JSON・CSV自動保存とエクスポート |
| **セッション管理** | Cookieとセッションのローテーション |
| **Apify連携** | クラウドデプロイ・スケジューリング |
| **型ヒント完全対応** | TypedDictとPydanticでデータスキーマを定義可能 |

---

## あるとないとの違い

| 観点 | Scrapy | crawlee-python |
|------|--------|---------------|
| 非同期処理 | Twisted（独自非同期） | asyncio標準（FastAPIとの親和性高い） |
| ブラウザ制御 | scrapy-playwright等の追加設定が必要 | PlaywrightCrawlerとして標準搭載 |
| コードの簡潔さ | Spider・Pipeline等の概念が多い | シンプルなコールバック関数 |
| AIとの連携 | 特に考慮なし | LLM/RAGパイプラインへの受け渡しを意識した設計 |
| 型安全性 | 型ヒントは後付け | 設計当初から型ヒントを重視 |

---

## 環境構築方法

### インストール

```bash
# 基本インストール（BeautifulSoupクローラー）
pip install crawlee

# PlaywrightCrawlerを使う場合
pip install crawlee[playwright]
playwright install chromium

# すべてのオプションを含む
pip install "crawlee[all]"

# uvを使う場合（推奨）
uv add crawlee
uv add "crawlee[playwright]"
```

### 最小構成スクリプト

```python
# scraper.py
import asyncio
from crawlee.crawlers import BeautifulSoupCrawler, BeautifulSoupCrawlingContext

async def main():
    crawler = BeautifulSoupCrawler(
        max_requests_per_crawl=100,
        max_concurrency=10,
    )

    @crawler.router.default_handler
    async def request_handler(context: BeautifulSoupCrawlingContext) -> None:
        context.log.info(f"処理中: {context.request.url}")

        # BeautifulSoupでデータ抽出
        title = context.soup.find("h1")
        title_text = title.get_text(strip=True) if title else ""

        # データセットに保存
        await context.push_data({
            "url": context.request.url,
            "title": title_text,
        })

        # 同ドメインのリンクをキューに追加
        await context.enqueue_links()

    await crawler.run(["https://example.com"])

asyncio.run(main())
```

### Playwrightクローラー（動的コンテンツ対応）

```python
import asyncio
from crawlee.crawlers import PlaywrightCrawler, PlaywrightCrawlingContext

async def main():
    crawler = PlaywrightCrawler(
        headless=True,
        max_concurrency=3,
    )

    @crawler.router.default_handler
    async def request_handler(context: PlaywrightCrawlingContext) -> None:
        # JavaScript実行後のページを取得
        page = context.page

        # スクロールして遅延ロードを実行
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await page.wait_for_timeout(2000)

        # locatorでデータ抽出
        items = await page.locator(".product-item").all()
        data = []
        for item in items:
            name = await item.locator(".name").text_content()
            price = await item.locator(".price").text_content()
            data.append({"name": name, "price": price})

        await context.push_data({"url": context.request.url, "items": data})

    await crawler.run(["https://shop.example.com"])

asyncio.run(main())
```

---

## ベストプラクティス

1. **Pydanticでスクレイピングデータのスキーマを定義して品質を保証する:**
```python
from pydantic import BaseModel, HttpUrl
from datetime import datetime
from crawlee.crawlers import BeautifulSoupCrawler, BeautifulSoupCrawlingContext

class ArticleData(BaseModel):
    url: str
    title: str
    author: str = ""
    published_at: str = ""
    content: str
    word_count: int
    scraped_at: datetime = datetime.now()

    class Config:
        # 余分なフィールドは無視
        extra = "ignore"

async def main():
    crawler = BeautifulSoupCrawler()

    @crawler.router.default_handler
    async def handler(context: BeautifulSoupCrawlingContext) -> None:
        soup = context.soup

        raw_data = {
            "url": context.request.url,
            "title": soup.find("h1").get_text(strip=True) if soup.find("h1") else "",
            "author": (soup.find(class_="author") or {}).get_text("") if soup.find(class_="author") else "",
            "content": soup.find("article").get_text(" ") if soup.find("article") else "",
            "word_count": 0,
        }
        raw_data["word_count"] = len(raw_data["content"].split())

        # バリデーション
        try:
            validated = ArticleData(**raw_data)
            if validated.word_count > 100:  # 最低100単語
                await context.push_data(validated.model_dump(mode="json"))
        except Exception as e:
            context.log.warning(f"バリデーション失敗: {context.request.url} - {e}")
```

2. **プロキシローテーションと再試行で安定したクローリングを実現する:**
```python
from crawlee.proxy_configuration import ProxyConfiguration
from crawlee.crawlers import BeautifulSoupCrawler

proxy_config = ProxyConfiguration(
    proxy_urls=[
        "http://user:pass@proxy1.example.com:8080",
        "http://user:pass@proxy2.example.com:8080",
    ]
)

crawler = BeautifulSoupCrawler(
    proxy_configuration=proxy_config,
    max_request_retries=3,        # 最大3回リトライ
    request_handler_timeout=60,   # 60秒タイムアウト
    session_pool_options={
        "max_pool_size": 50,
        "session_options": {"max_usage_count": 100},
    },
)
```

3. **収集データをLangChainのRAGパイプラインに直接渡す:**
```python
import asyncio
from crawlee.crawlers import BeautifulSoupCrawler, BeautifulSoupCrawlingContext
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Qdrant

# 収集したテキストを格納するリスト
collected_texts = []

async def scrape():
    crawler = BeautifulSoupCrawler(max_requests_per_crawl=200)

    @crawler.router.default_handler
    async def handler(context: BeautifulSoupCrawlingContext) -> None:
        # 本文抽出
        soup = context.soup
        for tag in soup(["script", "style", "nav", "footer"]):
            tag.decompose()

        text = soup.get_text(" ", strip=True)
        if len(text) > 300:
            collected_texts.append({
                "text": text,
                "metadata": {"url": context.request.url, "title": soup.title.string if soup.title else ""}
            })

    await crawler.run(["https://docs.example.com"])

asyncio.run(scrape())

# テキストをチャンクに分割
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
docs = splitter.create_documents(
    [d["text"] for d in collected_texts],
    metadatas=[d["metadata"] for d in collected_texts]
)

# ベクトルストアに保存
embeddings = OpenAIEmbeddings()
vectorstore = Qdrant.from_documents(
    docs,
    embeddings,
    url="http://localhost:6333",
    collection_name="scraped_docs",
)
print(f"RAGインデックス構築完了: {len(docs)}チャンク")
```

4. **定期実行スクリプトでデータを常に最新の状態に保つ:**
```python
# scheduled_scraper.py
import asyncio
import schedule
import time
from crawlee.crawlers import BeautifulSoupCrawler

async def run_scraper():
    crawler = BeautifulSoupCrawler(max_requests_per_crawl=500)

    @crawler.router.default_handler
    async def handler(context):
        # ...スクレイピング処理...
        pass

    print(f"スクレイピング開始: {datetime.now()}")
    await crawler.run(["https://news.example.com"])
    print(f"完了: {crawler.stats.requests_succeeded}件収集")

def job():
    asyncio.run(run_scraper())

# 毎日深夜2時に実行
schedule.every().day.at("02:00").do(job)

while True:
    schedule.run_pending()
    time.sleep(60)
```

---

## セキュリティ観点

### robots.txtの尊重とレート制限

```python
from crawlee.crawlers import BeautifulSoupCrawler

crawler = BeautifulSoupCrawler(
    # robots.txtを自動チェック
    respect_robots_txt_file=True,
    # リクエスト制限
    max_requests_per_minute=60,
    # カスタムUser-Agent（連絡先を含める）
    additional_http_headers={
        "User-Agent": "MyBot/1.0 (data-collection; contact@example.com)"
    },
)
```

### 個人情報の収集回避

```python
import re

def remove_pii(text: str) -> str:
    """個人情報をマスクする"""
    # メールアドレスを除去
    text = re.sub(r'[\w.+-]+@[\w-]+\.[\w.]+', '[EMAIL]', text)
    # 電話番号を除去
    text = re.sub(r'(\+81|0\d{1,4})-?\d{2,4}-?\d{4}', '[PHONE]', text)
    # クレジットカード番号パターンを除去
    text = re.sub(r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b', '[CARD]', text)
    return text
```

### 収集データの著作権
- スクレイピングしたデータの商用利用は対象サイトの利用規約を確認する
- LLM訓練用途での使用はCC0やCC-BYなどのライセンスのコンテンツに限定することが推奨される
- sitemap.xmlを参照して効率的にクロールし、不必要なサーバー負荷を避ける

---

## ペルソナ設定と使い方

### ペルソナ：田村 裕子（27歳・データサイエンティスト・日本語RAGシステムの構築データ収集を担当）

田村さんは製薬会社のデータサイエンスチームに所属し、社内の医療情報Q&AシステムのRAG用コーパスを構築している。信頼できる日本語医療情報サイトから定期的にデータを収集してベクトルDBを更新する必要があった。

```python
# medical_corpus_builder.py
# 医療情報サイトからRAG用コーパスを構築

import asyncio
import re
from datetime import datetime
from crawlee.crawlers import BeautifulSoupCrawler, BeautifulSoupCrawlingContext
from crawlee.storages import Dataset

# 収集対象（信頼できる医療情報サイト）
MEDICAL_SOURCES = [
    "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000032120.html",  # 厚労省
    "https://www.pmda.go.jp/safety/info-services/drugs/0001.html",        # PMDA
]

# 除外パターン（広告・ナビゲーション等）
EXCLUDE_SELECTORS = ["nav", "footer", "aside", ".ad", ".advertisement", ".cookie-notice"]

def extract_medical_text(soup) -> str:
    """医療記事の本文を抽出"""
    for selector in EXCLUDE_SELECTORS:
        for tag in soup.select(selector):
            tag.decompose()

    # 本文エリアを優先的に取得
    main_content = (
        soup.find("article")
        or soup.find(id=re.compile(r"main|content|article", re.I))
        or soup.find("main")
        or soup.body
    )

    if not main_content:
        return ""

    # テキスト抽出・クリーニング
    text = main_content.get_text(" ", strip=True)
    text = re.sub(r'\s+', ' ', text)
    return text

async def main():
    crawler = BeautifulSoupCrawler(
        max_requests_per_crawl=300,
        max_concurrency=3,
        max_requests_per_minute=30,  # 医療サイトへの負荷を最小化
        respect_robots_txt_file=True,
    )

    @crawler.router.default_handler
    async def handler(context: BeautifulSoupCrawlingContext) -> None:
        text = extract_medical_text(context.soup)

        # 品質フィルタ
        if len(text) < 400:
            return

        # 日本語率チェック
        ja_chars = len(re.findall(r'[ぁ-ん゛゜ァ-ヴー一-龯]', text))
        if ja_chars / max(len(text), 1) < 0.2:
            return

        await context.push_data({
            "url": context.request.url,
            "title": context.soup.find("h1").get_text(strip=True) if context.soup.find("h1") else "",
            "text": text,
            "source_domain": context.request.url.split("/")[2],
            "collected_at": datetime.now().isoformat(),
            "char_count": len(text),
        })

        context.log.info(f"収集: {context.request.url[:60]} ({len(text)}文字)")
        await context.enqueue_links(strategy="same-domain", limit=20)

    await crawler.run(MEDICAL_SOURCES)

    # 収集結果をエクスポート
    dataset = await Dataset.open()
    await dataset.export_to_json("medical_corpus")

    stats = crawler.stats
    print(f"""
=== 医療コーパス収集完了 ===
収集ページ数: {stats.requests_succeeded}
失敗ページ数: {stats.requests_failed}
保存先: storage/datasets/default/
    """)

asyncio.run(main())
```

```python
# corpus_to_rag.py
# 収集したコーパスをQdrant RAGシステムに取り込む

import json
from pathlib import Path
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import Qdrant

# 収集データを読み込み
corpus = []
for file in Path("storage/datasets/default").glob("*.json"):
    with open(file) as f:
        corpus.extend(json.load(f))

print(f"収集データ: {len(corpus)}ページ")

# テキストを分割してチャンク化
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["。", "！", "？", "\n\n", "\n", " "],
)

texts = [d["text"] for d in corpus]
metadatas = [{"url": d["url"], "title": d["title"], "source": d["source_domain"]} for d in corpus]
docs = splitter.create_documents(texts, metadatas=metadatas)

print(f"チャンク数: {len(docs)}")

# ベクトルストアに保存
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Qdrant.from_documents(
    docs, embeddings,
    url="http://localhost:6333",
    collection_name="medical_corpus",
)
print("RAGインデックス構築完了")
```

**導入前後の変化:**
- 導入前: Beautiful Soupの手書きスクリプト → エラーハンドリングなし、クラッシュすると最初からやり直し、月100ページが限界
- 導入後: crawlee-python → 自動リトライ・永続化キューで中断からの再開が可能、月300ページを安定収集、LangChainとの統合で収集→RAG構築まで自動化

---

## 周辺情報

### 類似・関連プロジェクト

| ツール | 特徴 |
|--------|------|
| Scrapy | Pythonスクレイピングの老舗フレームワーク、高機能・高学習コスト |
| crawlee（Node.js版）(#01) | TypeScript版、大規模クロールに強い |
| BeautifulSoup4 | HTML解析ライブラリ単体、crawlee-pythonのバックエンドとして使用 |
| Playwright for Python | Microsoftのブラウザ自動化、crawlee-pythonが内部で使用 |
| Firecrawl | LLM向けコンテンツ抽出特化のAPIサービス（商用） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/apify/crawlee-python)
- [公式ドキュメント](https://crawlee.dev/python/docs/introduction)
- [APIリファレンス](https://crawlee.dev/python/api)
- [クイックスタート](https://crawlee.dev/python/docs/quick-start)
- [PyPI](https://pypi.org/project/crawlee/)
