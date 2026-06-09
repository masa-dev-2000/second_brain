"""
GitHub Trending 日次収集スクリプト
毎日 github.com/trending をリサーチして、日付別 Markdown に保存する。
"""

import os
import requests
import anthropic
from datetime import date, datetime
from pathlib import Path


# ── 設定 ──────────────────────────────────────────────────────────────

JINA_READER   = "https://r.jina.ai/https://github.com/trending"
OUTPUT_DIR    = Path(__file__).parent.parent / f"github_trending_{date.today().strftime('%Y_%m')}"
OUTPUT_FILE   = OUTPUT_DIR / f"{date.today()}.md"
MODEL         = "claude-sonnet-4-6"
MAX_TOKENS    = 4096


# ── フェッチ ───────────────────────────────────────────────────────────

def fetch_trending_page() -> str:
    """Jina AI Reader 経由で github.com/trending を Markdown 取得"""
    print("Fetching github.com/trending via Jina AI Reader...")
    resp = requests.get(JINA_READER, timeout=30, headers={"Accept": "text/markdown"})
    resp.raise_for_status()
    return resp.text[:12000]  # コンテキスト節約のため先頭 12000 文字


# ── Claude 分析 ────────────────────────────────────────────────────────

SYSTEM_PROMPT = """あなたは GitHub トレンドを分析するリサーチャーです。
与えられた GitHub Trending ページの内容を解析し、
指定の Markdown フォーマットで日次レポートを作成してください。
情報が不足している場合は「不明」と記載し、推測で補わないこと。"""

USER_TEMPLATE = """以下は {today} の GitHub Trending ページの内容です。

---
{page_content}
---

この内容をもとに、以下のフォーマットで日次レポートを作成してください：

# GitHub Trending — {today}

調査日時: {today}
取得元: github.com/trending

---

## トップリポジトリ一覧

| # | リポジトリ | スター(総数) | 今日の★ | 言語 | 一言説明 |
|---|-----------|------------|--------|------|---------|
（上位20件を表で記載）

---

## カテゴリ別まとめ

取得したリポジトリをカテゴリ（AIツール / LLMフレームワーク / 開発ツール / その他）に分類して箇条書き。

---

## 今日の注目ポイント

トレンドから読み取れる傾向・注目技術を3〜5点。

---

*調査日: {today} — GitHub Trending 自動収集*
"""


def analyze_with_claude(page_content: str) -> str:
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    today  = date.today().isoformat()

    print(f"Analyzing with Claude ({MODEL})...")
    message = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        system=SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": USER_TEMPLATE.format(today=today, page_content=page_content)
        }]
    )
    return message.content[0].text


# ── 保存 ───────────────────────────────────────────────────────────────

def save_report(content: str) -> Path:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(content, encoding="utf-8")
    print(f"Saved: {OUTPUT_FILE}")
    return OUTPUT_FILE


# ── エントリーポイント ─────────────────────────────────────────────────

def main():
    if not os.environ.get("ANTHROPIC_API_KEY"):
        raise EnvironmentError("ANTHROPIC_API_KEY が設定されていません")

    page_content = fetch_trending_page()
    report       = analyze_with_claude(page_content)
    save_report(report)
    print("Done.")


if __name__ == "__main__":
    main()
