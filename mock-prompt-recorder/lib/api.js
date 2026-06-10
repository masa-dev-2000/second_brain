// 外部API呼び出し: OpenAI Whisperで文字起こし → Claudeでモックプロンプト生成

const SYSTEM_PROMPT = `あなたはプロダクトデザインの専門家です。会議やブレストの文字起こしを読み、そこで語られたプロダクトアイデアを「モック(プロトタイプ)生成AIツールにそのまま貼り付けられるプロンプト」に変換してください。

出力ルール:
- v0 / Figma Make / Claude などのUI生成ツールに1回で貼れる、単一の完結したプロンプトのみを出力する
- 前置きや解説は書かない
- プロンプトには次を含める: プロダクト概要 / ターゲットユーザー / 主要機能(箇条書き) / 必要な画面と各画面の要素 / デザインの方向性
- 会話で曖昧だった部分は、文脈から最も自然な形で具体化して補う
- 日本語の会話なら日本語で、英語の会話なら英語で出力する`;

export async function transcribe(audioBlob, openaiApiKey) {
  const form = new FormData();
  form.append("file", audioBlob, "recording.webm");
  form.append("model", "whisper-1");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${openaiApiKey}` },
    body: form,
  });
  if (!res.ok) {
    throw new Error(`文字起こしに失敗しました (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  return data.text;
}

export async function generateMockPrompt(transcript, anthropicApiKey) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": anthropicApiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-opus-4-8",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `以下は会議・ブレストの文字起こしです。この内容からモック作成プロンプトを生成してください。\n\n---\n${transcript}`,
        },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`プロンプト生成に失敗しました (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  const textBlock = data.content.find((b) => b.type === "text");
  if (!textBlock) throw new Error("生成結果にテキストが含まれていません");
  return textBlock.text;
}

export function dataUrlToBlob(dataUrl) {
  const [meta, base64] = dataUrl.split(",");
  const mime = meta.match(/data:(.*?);/)[1];
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}
