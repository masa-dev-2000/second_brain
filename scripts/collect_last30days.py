"""
last30days-skill 相当の日次収集スクリプト
mvanhorn/last30days-skill の仕組みを参考に実装。

AIコーディングツール全般（Claude Code, Cursor, Copilot, Dify, n8n 等）について
Reddit/HackerNews/GitHub/Web の過去30日分の話題を収集し、Claude で合成レポートを生成する。
"""

import os
import json
import requests
import anthropic
from datetime import date, datetime, timedelta
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# ── 設定 ──────────────────────────────────────────────────────────────

TOPIC         = "AI coding tools Claude Code Cursor Copilot Dify n8n LLM agent"
OUTPUT_DIR    = Path(__file__).parent.parent / f"github_trending_{date.today().strftime('%Y_%m')}"
OUTPUT_FILE   = OUTPUT_DIR / f"last30days_{date.today()}.md"
MODEL         = "claude-sonnet-4-6"
MAX_TOKENS    = 4096
DAYS_BACK     = 30

SUBREDDITS = [
    "MachineLearning", "LocalLLaMA", "ClaudeAI", "ChatGPT",
    "artificial", "programming", "webdev", "devops"
]

HN_QUERIES = [
    "Claude Code", "AI coding", "LLM agent", "Dify", "n8n automation",
    "Cursor IDE", "GitHub Copilot"
]


# ── Reddit 収集 ────────────────────────────────────────────────────────

def fetch_reddit(subreddit: str, query: str) -> list[dict]:
    """Reddit 検索（APIキー不要）"""
    url = "https://www.reddit.com/search.json"
    params = {
        "q": query,
        "sort": "top",
        "t": "month",
        "limit": 10,
        "restrict_sr": False,
    }
    headers = {"User-Agent": "second-brain-collector/1.0"}
    try:
        r = requests.get(url, params=params, headers=headers, timeout=10)
        r.raise_for_status()
        posts = r.json().get("data", {}).get("children", [])
        return [
            {
                "platform": "Reddit",
                "title": p["data"].get("title", ""),
                "url": f"https://reddit.com{p['data'].get('permalink', '')}",
                "score": p["data"].get("score", 0),
                "comments": p["data"].get("num_comments", 0),
                "subreddit": p["data"].get("subreddit", ""),
            }
            for p in posts
        ]
    except Exception as e:
        print(f"  Reddit [{subreddit}] error: {e}")
        return []


def collect_reddit() -> list[dict]:
    """主要サブレディットを並列検索"""
    print("Collecting Reddit...")
    results = []
    queries = [
        "Claude Code AI coding", "LLM agent framework",
        "Dify n8n automation", "AI developer tools 2026"
    ]
    with ThreadPoolExecutor(max_workers=4) as ex:
        futures = [ex.submit(fetch_reddit, "all", q) for q in queries]
        for f in as_completed(futures):
            results.extend(f.result())

    # スコア降順・重複除去
    seen = set()
    deduped = []
    for r in sorted(results, key=lambda x: x["score"], reverse=True):
        if r["title"] not in seen:
            seen.add(r["title"])
            deduped.append(r)
    return deduped[:20]


# ── HackerNews 収集 ────────────────────────────────────────────────────

def collect_hackernews() -> list[dict]:
    """Algolia HN API（APIキー不要）"""
    print("Collecting HackerNews...")
    since = int((datetime.now() - timedelta(days=DAYS_BACK)).timestamp())
    results = []
    for query in HN_QUERIES[:4]:  # レート制限を考慮
        try:
            url = "https://hn.algolia.com/api/v1/search"
            params = {
                "query": query,
                "numericFilters": f"created_at_i>{since},points>10",
                "hitsPerPage": 5,
            }
            r = requests.get(url, params=params, timeout=10)
            r.raise_for_status()
            for hit in r.json().get("hits", []):
                results.append({
                    "platform": "HackerNews",
                    "title": hit.get("title", ""),
                    "url": hit.get("url") or f"https://news.ycombinator.com/item?id={hit.get('objectID')}",
                    "score": hit.get("points", 0),
                    "comments": hit.get("num_comments", 0),
                })
        except Exception as e:
            print(f"  HN [{query}] error: {e}")
    return sorted(results, key=lambda x: x["score"], reverse=True)[:15]


# ── GitHub 収集 ────────────────────────────────────────────────────────

def collect_github() -> list[dict]:
    """GitHub Search API（APIキー不要・レート制限60req/h）"""
    print("Collecting GitHub...")
    since = (datetime.now() - timedelta(days=DAYS_BACK)).strftime("%Y-%m-%d")
    queries = [
        "AI coding assistant stars:>100",
        "LLM agent framework stars:>50",
        "claude code tool stars:>50",
    ]
    results = []
    for query in queries:
        try:
            url = "https://api.github.com/search/repositories"
            params = {
                "q": f"{query} created:>{since}",
                "sort": "stars",
                "per_page": 5,
            }
            headers = {"Accept": "application/vnd.github+json"}
            r = requests.get(url, params=params, headers=headers, timeout=10)
            r.raise_for_status()
            for repo in r.json().get("items", []):
                results.append({
                    "platform": "GitHub",
                    "title": repo["full_name"],
                    "url": repo["html_url"],
                    "score": repo["stargazers_count"],
                    "description": repo.get("description", ""),
                })
        except Exception as e:
            print(f"  GitHub [{query}] error: {e}")
    return sorted(results, key=lambda x: x["score"], reverse=True)[:10]


# ── Web 検索（Jina AI） ────────────────────────────────────────────────

def collect_web() -> str:
    """Jina AI Search で直近の Web 記事を取得"""
    print("Collecting Web via Jina AI...")
    query = "AI coding tools Claude Code 2026 review"
    url = f"https://s.jina.ai/{requests.utils.quote(query)}"
    try:
        r = requests.get(url, timeout=15, headers={"Accept": "text/markdown"})
        r.raise_for_status()
        return r.text[:4000]
    except Exception as e:
        print(f"  Jina error: {e}")
        return ""


# ── Claude 合成 ────────────────────────────────────────────────────────

SYSTEM_PROMPT = """あなたは AIコーディングツール専門のリサーチアナリストです。
複数プラットフォームから収集した情報を統合し、開発者コミュニティの"今の空気感"を伝える
週次レポートを作成してください。"""

USER_TEMPLATE = """以下は {today} 時点の「AIコーディングツール全般」に関する
過去30日分のコミュニティ動向データです。

## Reddit（上位投稿）
{reddit_data}

## HackerNews（注目スレッド）
{hn_data}

## GitHub（新着リポジトリ）
{github_data}

## Web記事
{web_data}

---

このデータを統合して、以下のMarkdownフォーマットでレポートを作成してください：

# AIコーディングツール 過去30日の話題 — {today}

## サマリー（3行以内）

## 🔥 今月最も盛り上がったトピック（上位5つ）
各トピックについて：プラットフォーム・エンゲージメント数・なぜ盛り上がったかを1〜2行で

## 💬 Redditの本音（開発者コミュニティの声）

## 🛠️ HackerNewsで話題になった技術トレンド

## 📦 注目の新着GitHubリポジトリ

## 🌊 全体的な空気感・トレンドの方向性

---
*収集元: Reddit / HackerNews / GitHub / Web
収集日: {today}
対象期間: 過去30日*
"""


def synthesize(reddit: list, hn: list, github: list, web: str) -> str:
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    today  = date.today().isoformat()

    def fmt(items: list, keys: list) -> str:
        lines = []
        for i in items[:10]:
            parts = [f"{k}: {i.get(k, '')}" for k in keys if i.get(k)]
            lines.append("- " + " | ".join(parts))
        return "\n".join(lines) if lines else "（データなし）"

    print(f"Synthesizing with Claude ({MODEL})...")
    msg = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        system=SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": USER_TEMPLATE.format(
                today=today,
                reddit_data=fmt(reddit, ["title", "score", "comments", "subreddit"]),
                hn_data=fmt(hn, ["title", "score", "comments"]),
                github_data=fmt(github, ["title", "score", "description"]),
                web_data=web[:2000] if web else "（データなし）",
            )
        }]
    )
    return msg.content[0].text


# ── エントリーポイント ─────────────────────────────────────────────────

def main():
    if not os.environ.get("ANTHROPIC_API_KEY"):
        raise EnvironmentError("ANTHROPIC_API_KEY が設定されていません")

    # 並列収集
    with ThreadPoolExecutor(max_workers=3) as ex:
        f_reddit  = ex.submit(collect_reddit)
        f_hn      = ex.submit(collect_hackernews)
        f_github  = ex.submit(collect_github)
        f_web     = ex.submit(collect_web)

    reddit  = f_reddit.result()
    hn      = f_hn.result()
    github  = f_github.result()
    web     = f_web.result()

    print(f"  Reddit: {len(reddit)} posts, HN: {len(hn)} threads, GitHub: {len(github)} repos")

    report = synthesize(reddit, hn, github, web)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(report, encoding="utf-8")
    print(f"Saved: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
