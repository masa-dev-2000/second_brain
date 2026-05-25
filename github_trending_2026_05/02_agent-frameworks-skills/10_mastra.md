# mastra-ai/mastra

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [mastra-ai/mastra](https://github.com/mastra-ai/mastra) |
| 言語 | TypeScript |
| 総スター数 | 24,170 |
| ライセンス | Elastic-2.0 |
| カテゴリ | エージェントフレームワーク / TypeScript AIフレームワーク |

---

## 概要

Gatsby.jsを作ったチームによるTypeScript製AIフレームワーク。エージェント・ワークフロー・RAG・評価（evals）・MCPクライアントを1つのフレームワークで統合。Next.js・Hono・Fastify等と組み合わせてプロダクションレディなAIアプリを構築できる。

PythonのLangGraph/CrewAIに相当するものをTypeScriptエコシステムで提供する。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **エージェント** | ツール・メモリ・MCPサーバーを持つエージェントを定義 |
| **ワークフロー** | ステップ・分岐・並列実行を型安全に定義 |
| **RAG** | ドキュメントの取り込み・チャンク・ベクトル化・検索 |
| **Evals** | エージェントの出力品質を自動評価 |
| **MCPクライアント** | MCPサーバーのツールをエージェントに統合 |
| **メモリ** | 会話履歴・ユーザー記憶を自動管理 |

---

## あるとないとの違い

| 観点 | LangChain(Python)+Next.js | Mastra |
|------|--------------------------|--------|
| 型安全性 | PythonとTSの境界で型が失われる | End-to-endでTypeScript型安全 |
| フロントとの統合 | REST API経由で繋ぐ | Next.jsと直接統合（Server Actions等） |
| evals | 別ツールが必要 | フレームワーク内蔵 |
| MCPサポート | 別途実装 | 内蔵MCPクライアント |

---

## 環境構築方法

### インストール
```bash
npm install @mastra/core

# または新規プロジェクトを作成
npx create-mastra-app my-ai-app
cd my-ai-app
npm install
```

### 基本構成
```typescript
// src/mastra/index.ts
import { Mastra } from "@mastra/core";
import { anthropic } from "@ai-sdk/anthropic";

export const mastra = new Mastra({
  agents: { myAgent },
});

// エージェント定義
const myAgent = mastra.agent({
  name: "アシスタント",
  instructions: "丁寧な日本語で答えてください。",
  model: anthropic("claude-opus-4-7"),
  tools: { webSearch, calculator },
});
```

### Next.jsとの統合
```typescript
// app/api/chat/route.ts
import { mastra } from "@/mastra";

export async function POST(req: Request) {
  const { message } = await req.json();
  const agent = mastra.getAgent("myAgent");
  
  const stream = await agent.stream(message);
  return stream.toDataStreamResponse();
}
```

---

## ベストプラクティス

1. **型安全なワークフローを定義:**
```typescript
import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";

const extractStep = createStep({
  id: "extract",
  inputSchema: z.object({ pdfUrl: z.string() }),
  outputSchema: z.object({ text: z.string(), metadata: z.record(z.string()) }),
  execute: async ({ inputData }) => {
    const text = await extractPdf(inputData.pdfUrl);
    return { text, metadata: {} };
  },
});

const summarizeStep = createStep({
  id: "summarize",
  inputSchema: extractStep.outputSchema,
  outputSchema: z.object({ summary: z.string() }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent("summarizer");
    const result = await agent.generate(inputData.text);
    return { summary: result.text };
  },
});

const pdfWorkflow = createWorkflow({
  id: "pdf-processing",
  steps: [extractStep, summarizeStep],
});
```

2. **RAGをフレームワーク内で完結させる:**
```typescript
import { MastraVector } from "@mastra/core";
import { PgVector } from "@mastra/pg";

const vectorStore = new PgVector(process.env.DATABASE_URL!);

// ドキュメントを取り込む
await vectorStore.upsert("knowledge-base", documents);

// エージェントのツールとして使う
const ragTool = mastra.createVectorQueryTool({
  vectorStoreName: "knowledge-base",
  topK: 5,
});
```

3. **Evalsでエージェント品質を継続的に評価:**
```typescript
import { evaluate } from "@mastra/evals";

const results = await evaluate({
  agent: mastra.getAgent("myAgent"),
  testCases: [
    { input: "東京の人口は？", expectedOutput: "約1400万人" },
    { input: "富士山の高さは？", expectedOutput: "3776m" },
  ],
  metrics: ["accuracy", "latency", "cost"],
});

console.log(results);
// { accuracy: 0.95, avgLatency: 1.2s, avgCost: $0.002 }
```

4. **MCPサーバーのツールをエージェントに統合:**
```typescript
import { MCPClient } from "@mastra/mcp";

const mcp = new MCPClient({
  servers: {
    filesystem: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"],
    },
    github: {
      url: new URL("https://api.githubcopilot.com/mcp/"),
      requestInit: { headers: { Authorization: `Bearer ${GITHUB_TOKEN}` } },
    },
  },
});

const agent = mastra.agent({
  name: "コーディングアシスタント",
  tools: await mcp.getTools(),  // MCPのツールを自動取得
});
```

---

## セキュリティ観点

```typescript
// 環境変数の管理
// .env.local に記述（Gitにコミットしない）
// ANTHROPIC_API_KEY=sk-ant-...
// DATABASE_URL=postgresql://...

// ユーザー入力のサニタイズ
const agent = mastra.agent({
  name: "安全なエージェント",
  instructions: "ユーザーの個人情報を返答に含めないでください。",
  // 出力検証
  outputValidator: (output) => !containsPII(output),
});
```

---

## ペルソナ設定と使い方

### ペルソナ：石川 雄介（32歳・フルスタックTS開発者・SaaSにAI機能を追加したい）

```typescript
// 既存のNext.js SaaSに請求書解析AIを追加

// 1. エージェント定義（1ファイルで完結）
const invoiceAgent = mastra.agent({
  name: "請求書解析AI",
  model: anthropic("claude-opus-4-7"),
  instructions: `
    請求書を解析して以下のJSON形式で返してください:
    { vendor, amount, dueDate, lineItems }
  `,
  tools: { readFile, validateData },
});

// 2. Next.js Server Actionから呼び出す
async function analyzeInvoice(file: File) {
  "use server";
  const result = await invoiceAgent.generate(
    `この請求書を解析してください: ${await file.text()}`
  );
  return JSON.parse(result.text);
}

// 3. クライアントからそのまま使う
const data = await analyzeInvoice(uploadedFile);
// → 既存のNext.jsアプリに3ファイル追加するだけでAI機能が完成
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| LangGraph (#08) | Python版グラフ型オーケストレーション |
| openai-agents-python (#09) | Python版軽量フレームワーク |
| Vercel AI SDK | ストリーミングに特化したNext.js向けAIライブラリ |
| LangChain.js | TypeScript版LangChain |

---

## 参考リンク

- [公式リポジトリ](https://github.com/mastra-ai/mastra)
- [公式ドキュメント](https://mastra.ai/docs)
