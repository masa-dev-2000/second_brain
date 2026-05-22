# appcypher/awesome-mcp-servers

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [appcypher/awesome-mcp-servers](https://github.com/appcypher/awesome-mcp-servers) |
| 言語 | Markdown |
| 総スター数 | 5,556 |
| ライセンス | CC0 |
| カテゴリ | MCPエコシステム / MCPサーバーキュレーションリスト |

---

## 概要

awesome-mcp-serversは、Model Context Protocol（MCP）サーバーのキュレーションリスト。MCP（Anthropicが策定したLLMとツール間の標準プロトコル）に対応したサーバーを全カテゴリにわたって網羅的に紹介している。MCPエコシステムを探索する際の出発点として機能する。

MCP（Model Context Protocol）は2024年11月にAnthropicが発表したオープン標準で、AIアシスタントが外部ツール・データソース・サービスと安全かつ一貫した方法で連携するためのプロトコル。このリストはGitHub・Slack・Google Drive・データベース・ファイルシステムなど、あらゆるカテゴリのMCPサーバーを横断的に発見できる起点となっている。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **網羅的なカテゴリ分類** | ファイルシステム・DB・クラウド・Web・通信等の全カテゴリを収録 |
| **品質フィルタリング** | コミュニティによる精選で信頼性の高いサーバーのみ掲載 |
| **公式・コミュニティ分離** | 公式MCP実装とコミュニティ製を明確に区別 |
| **CC0ライセンス** | パブリックドメインのため自由に転用・再配布可能 |
| **定期メンテナンス** | PRで新しいMCPサーバーが継続的に追加される |

---

## あるとないとの違い

| 観点 | 個別に検索・調査 | awesome-mcp-servers |
|------|-----------------|---------------------|
| 発見効率 | 「MCP GitHub」で検索、品質まちまち | キュレーション済みで即座に発見 |
| カテゴリ全体の把握 | 散在した情報を手動整理 | カテゴリ別に整理済みで全体像が一目瞭然 |
| 信頼性 | 個別に品質確認が必要 | コミュニティフィルタリング済み |
| 更新速度 | ブックマークが陳腐化 | コミュニティPRで常に最新 |

---

## 環境構築方法

### MCPの基本的な仕組みを理解する

```
MCPアーキテクチャ:

[AIクライアント]  ←→  [MCPサーバー]  ←→  [外部サービス]
 (Claude等)         (ブリッジ)          (GitHub/DB/ファイル等)

通信: JSON-RPC 2.0 over stdio or HTTP
```

### Claude Desktopへの設定例

```json
// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/yourname/Documents"
      ]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..."
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://user:pass@localhost:5432/mydb"
      }
    }
  }
}
```

### よく使われるMCPサーバーのインストール例

```bash
# 公式MCPサーバーパッケージ（Anthropic提供）
# GitHub連携
npx @modelcontextprotocol/server-github

# ファイルシステムアクセス
npx @modelcontextprotocol/server-filesystem /path/to/allowed/dir

# PostgreSQL
npx @modelcontextprotocol/server-postgres

# Slack
npx @modelcontextprotocol/server-slack

# Google Drive
npx @modelcontextprotocol/server-gdrive

# Brave Search
npx @modelcontextprotocol/server-brave-search
```

---

## ベストプラクティス

1. **自分のユースケースに合ったカテゴリから探し始める:**
```
awesome-mcp-servers のカテゴリ構成:

📁 ファイルシステム
  - filesystem, S3, GDrive, Dropbox

🗄️ データベース
  - PostgreSQL, MySQL, SQLite, MongoDB, Redis

🌐 Web・検索
  - Brave Search, Puppeteer, Fetch

📡 通信・コラボレーション
  - Slack, Gmail, Linear, Jira

☁️ クラウドサービス
  - AWS, GCP, Cloudflare

🔧 開発ツール
  - GitHub, GitLab, Sentry, Docker

📊 データ・分析
  - Notion, Airtable, Google Sheets
```

2. **Claude Desktopで複数のMCPサーバーを組み合わせる:**
```json
// 開発者向けの推奨MCPサーバーセット
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/projects"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..." }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": { "POSTGRES_CONNECTION_STRING": "postgresql://localhost:5432/devdb" }
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": { "BRAVE_API_KEY": "BSA..." }
    }
  }
}
```

3. **カスタムMCPサーバーを自作して社内ツールに対応させる:**
```python
# custom_mcp_server.py
# 社内APIをMCPサーバーとしてラップする例

from mcp.server import Server
from mcp.server.models import InitializationOptions
import mcp.server.stdio
import mcp.types as types
import httpx

app = Server("company-internal-api")

@app.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="get_sales_data",
            description="社内の売上データをクエリします",
            inputSchema={
                "type": "object",
                "properties": {
                    "date_from": {"type": "string", "description": "開始日 (YYYY-MM-DD)"},
                    "date_to": {"type": "string", "description": "終了日 (YYYY-MM-DD)"},
                    "product_id": {"type": "string", "description": "商品ID（省略可）"},
                },
                "required": ["date_from", "date_to"],
            },
        ),
    ]

@app.call_tool()
async def handle_call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    if name == "get_sales_data":
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://internal-api.company.com/sales",
                params=arguments,
                headers={"Authorization": f"Bearer {INTERNAL_API_KEY}"},
            )
            data = response.json()
            return [types.TextContent(type="text", text=str(data))]

    raise ValueError(f"Unknown tool: {name}")

async def main():
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream,
            write_stream,
            InitializationOptions(server_name="company-internal-api", server_version="0.1.0"),
        )

import asyncio
asyncio.run(main())
```

4. **セキュリティを考慮したMCPサーバー選定基準を設ける:**
```markdown
## MCPサーバー選定チェックリスト

### 信頼性
- [ ] GitHubスター数100以上
- [ ] 最終コミットが3ヶ月以内
- [ ] Anthropic公式または著名な組織が開発
- [ ] issueへの対応が活発

### セキュリティ
- [ ] OAuth2またはAPIキーによる認証対応
- [ ] 最小権限の原則（ReadOnly版があるか）
- [ ] ソースコードが公開されている
- [ ] 依存パッケージに既知の脆弱性なし（npm audit / pip audit）

### 機能
- [ ] ユースケースに必要なツールがすべて揃っているか
- [ ] エラーハンドリングが適切か
- [ ] ドキュメントが充実しているか
```

---

## セキュリティ観点

### MCPサーバーへのアクセス制限

```json
// ファイルシステムMCPサーバーは許可ディレクトリを明示的に指定
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        // 許可するディレクトリのみを指定（ルート / は指定しない）
        "/home/user/projects",
        "/home/user/documents"
        // /etc や /var/lib などシステムディレクトリは指定しない
      ]
    }
  }
}
```

### APIキーの最小権限設定

```bash
# GitHubのPersonal Access Tokenは必要な権限のみ付与
# repo（read-only）のみ → write権限は付与しない
# Fine-grained tokens を使って権限を最小化

# Slack Bot Tokenも必要なスコープのみ:
# channels:read, messages:read のみ（send権限は不要なら付与しない）
```

### MCPサーバーの信頼性評価
- awesome-mcp-servers に掲載されているからといって安全性が保証されるわけではない
- カスタムMCPサーバーをnpx経由で実行する場合、パッケージの中身を事前に確認する
- 本番環境のAIアプリケーションではMCPサーバーをDocker等でサンドボックス化する

---

## ペルソナ設定と使い方

### ペルソナ：西村 亮（32歳・SREエンジニア・Claude Desktopを使って運用業務を効率化したい）

西村さんはSREとして複数のAWSサービス・GrafanaダッシュボードのアラートトリアージとGitHubのincidentチケット対応を日々行っている。Claude DesktopにMCPサーバーを設定して、これらのツールをAIで横断的に操作できないか試している。

```json
// Claude Desktop設定（SRE向けMCPセット）
// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_...(repo:read, issues:write)"
      }
    },
    "aws": {
      "command": "npx",
      "args": ["-y", "mcp-server-aws-cloudwatch"],
      "env": {
        "AWS_ACCESS_KEY_ID": "AKIA...",
        "AWS_SECRET_ACCESS_KEY": "...",
        "AWS_DEFAULT_REGION": "ap-northeast-1"
      }
    },
    "pagerduty": {
      "command": "npx",
      "args": ["-y", "mcp-server-pagerduty"],
      "env": {
        "PAGERDUTY_API_KEY": "u+..."
      }
    },
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-...",
        "SLACK_TEAM_ID": "T..."
      }
    }
  }
}
```

```
# Claude Desktopでの実際の操作例

西村: 「今日の14:00〜14:30にCloudWatchでerrorのスパイクが
       あったが、その時間帯のGitHub incidentチケットと
       PagerDutyのアラートを確認して原因候補をまとめて」

Claude:
[MCPツールを使って並列に情報収集]
1. CloudWatch: エラーログ取得 → API-Gatewayで504が急増
2. GitHub Issues: #1234 "deploy v2.3.1" が14:05にマージ
3. PagerDuty: "high-latency" アラートが14:03に発火
4. GitHub commits: v2.3.1のコード差分を確認

→ 「14:05のデプロイ(v2.3.1)でN+1クエリが混入したと思われます。
   該当コミットは abc1234 のUserControllerの変更です。
   ロールバックを推奨しますか？」
```

**導入前後の変化:**
- 導入前: AWS Console・GitHub・PagerDutyを個別に開いて手動でインシデント調査 → 1件のトリアージに15〜30分
- 導入後: Claude DesktopにMCPサーバーを設定 → 自然言語で横断調査を指示、3〜5分でサマリーを取得

---

## 周辺情報

### 類似・関連プロジェクト

| ツール | 特徴 |
|--------|------|
| awesome-mcp-servers (punkpeye版) | 別コミュニティのMCPサーバーリスト、こちらも有名 |
| MCP公式サーバー集（Anthropic） | Anthropic公式のリファレンス実装 |
| 5ire (#02) | MCPクライアント、MCPサーバーを管理・実行するデスクトップアプリ |
| Smithery | MCPサーバーのマーケットプレイス |
| MCP公式ドキュメント | Model Context Protocolの仕様・SDK |

---

## 参考リンク

- [公式リポジトリ](https://github.com/appcypher/awesome-mcp-servers)
- [MCPプロトコル公式サイト](https://modelcontextprotocol.io)
- [Anthropic公式MCPサーバー集](https://github.com/modelcontextprotocol/servers)
- [MCP仕様書](https://spec.modelcontextprotocol.io)
- [Claude Desktop設定ガイド](https://modelcontextprotocol.io/quickstart/user)
