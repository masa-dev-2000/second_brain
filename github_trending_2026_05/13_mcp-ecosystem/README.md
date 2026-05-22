# 13_mcp-ecosystem

## フォルダの概要

Model Context Protocol（MCP）エコシステムに関するツール・リソースをまとめたカテゴリ。MCPサーバーのキュレーションリスト（awesome-mcp-servers）と、MCPクライアントとして機能するデスクトップAIアシスタント（5ire）を収録している。MCPは2024年11月にAnthropicが策定したオープン標準プロトコルで、AIアシスタントが外部ツール・データソース・サービスと安全かつ一貫した方法で連携するための仕組み。2025〜2026年にかけてVSCode・Cursor・Claude Desktop・Zedなどの主要ツールが対応を発表し、「AIとツールの相互運用標準」として急速に普及している。

---

## 収録リポジトリ一覧

| # | ファイル | リポジトリ | スター数 | 概要 |
|---|---------|-----------|---------|------|
| 1 | [01_awesome-mcp-servers.md](./01_awesome-mcp-servers.md) | appcypher/awesome-mcp-servers | 5,556 | MCPサーバーのキュレーションリスト、エコシステム発見の起点 |
| 2 | [02_5ire.md](./02_5ire.md) | nanbingxyz/5ire | 5,226 | クロスプラットフォームデスクトップAIアシスタント＆MCPクライアント |

---

## カテゴリの傾向

- **MCPがAI相互運用の業界標準に**: AnthropicのMCPは公開後わずか半年でCursor・Windsurf・Zed・GitHub Copilot等の主要AIコーディングツールが対応を発表。「AIとツールを繋ぐUSB規格」とも称され、各SaaSベンダーが公式MCPサーバーを提供し始めており、ツール連携のデファクトスタンダードとしての地位を固めつつある。
- **MCPサーバーエコシステムの爆発的成長**: 公式実装に加え、コミュニティ製のMCPサーバーが数百種類に達している。GitHub・Slack・Notion・AWS・Jira・PostgreSQLなど主要サービスのMCPサーバーが整備され、AIアシスタントが業務ツールを横断的に操作できる環境が整いつつある。
- **マルチLLMクライアントの台頭**: Claude Desktop単体ではなく、OpenAI・Gemini・Ollama等の複数LLMをMCPサーバーと組み合わせて使えるマルチLLMクライアント（5ire等）が登場し、LLMの選択肢と拡張性を両立するアプローチが評価されている。ローカルLLM（Ollama）とMCPを組み合わせることで完全プライベートなAIエージェント環境が実現可能になっている。
