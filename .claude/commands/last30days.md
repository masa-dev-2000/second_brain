---
description: 指定トピックの過去30日間の話題をReddit/HN/GitHub/Webから収集し合成レポートを生成する
argument-hint: "[トピック] [--emit=html]"
---

Research the topic **$ARGUMENTS** across Reddit, HackerNews, GitHub, and the web for the last 30 days, then synthesize into a Japanese report.

## Mandatory Steps

**Step 0 — Badge line (first line of output, no exceptions):**
```
🌐 last30days v1.0 · synced {today's date}
```

**Step 0.5 — Pre-research planning:**
Identify for the topic:
- Most relevant subreddits (3-5)
- Key GitHub search terms
- HackerNews query keywords
- X/Twitter hashtags if applicable

**Step 1 — Parallel data collection (use WebSearch for each):**

1. Reddit: Search `site:reddit.com "$ARGUMENTS" -site:old.reddit.com` — get top posts last 30 days with upvote signals
2. Reddit communities: Search `reddit "$ARGUMENTS" discussion 2025 OR 2026` — get community reactions
3. HackerNews: Search `site:news.ycombinator.com "$ARGUMENTS"` — find threads
4. GitHub: Search `github.com "$ARGUMENTS" new repository 2026` — find trending repos
5. Web/News: Search `"$ARGUMENTS" site:news.ycombinator.com OR site:lobste.rs OR dev.to 2026` — dev community posts
6. General: Search `"$ARGUMENTS" review opinion 2026` — broader web sentiment

**Step 2 — Synthesis rules (Eight Laws):**

1. **No trailing Sources block** — use inline `[name](url)` citations only; emoji-tree footer is the only citation block
2. **Opening line is always** `What I learned:` (not a title)
3. **No em-dashes** — use ` - ` (hyphen with spaces)
4. **No `##` section headers in body** — narrative prose + KEY PATTERNS list
5. **Include the emoji-tree footer block verbatim** from search results if present
6. **Synthesize into prose** — no raw cluster dumps or bullet-only sections
7. **YOU generate the query plan** — don't rely on external scripts
8. **Every citation is inline markdown** — `[name](url)` at first mention

## Output Format

```
🌐 last30days v1.0 · synced {TODAY}

What I learned:

[2-3 paragraphs of narrative synthesis in Japanese, weaving together Reddit reactions,
HN developer discussion, GitHub activity, and broader web sentiment. Include engagement
signals: upvote counts, comment counts, star counts where available. Quote directly from
community members using inline citations. Use Polymarket odds if found.]

KEY PATTERNS:
- [Pattern 1 with inline citation]
- [Pattern 2 with inline citation]
- [Pattern 3 with inline citation]
- [Pattern 4 with inline citation]
- [Pattern 5 with inline citation]

[If comparison query, add: Quick Verdict / Head-to-Head / Bottom Line sections]

---
🔍 Sources scanned: Reddit · HackerNews · GitHub · Web
📅 Period: last 30 days  · Generated: {TODAY}
```

## Output Destination

After generating the report:
1. Save to `github_trending_{YYYY_MM}/last30days_{YYYY-MM-DD}.md` (create dir if needed)
2. Print the report to the conversation

If `--emit=html` flag is present, also render as a self-contained dark-mode HTML file at the same path with `.html` extension.

## Error Handling

- If WebSearch is unavailable: note it, use WebFetch on Reddit/HN URLs directly
- If a platform returns no results: note "(no signal)" for that platform and continue
- Minimum viable output requires at least 2 platforms with data
