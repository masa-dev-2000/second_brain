// ローカル無料モード: Chrome内蔵のGemini Nano(Prompt API)でプロンプト生成
// APIキー不要・通信なし・完全無料。Chrome 138以降が必要

import { SYSTEM_PROMPT } from "./api.js";

export async function generateMockPromptLocal(transcript, onStatus = () => {}) {
  if (typeof LanguageModel === "undefined") {
    throw new Error(
      "このChromeはPrompt API(Gemini Nano)に未対応です。Chromeを最新版(138以降)に更新するか、設定からクラウドモードに切り替えてください"
    );
  }

  const availability = await LanguageModel.availability();
  if (availability === "unavailable") {
    throw new Error(
      "この端末ではGemini Nanoを利用できません(空きディスク約22GB・対応GPUが必要)。設定からクラウドモードに切り替えてください"
    );
  }

  const session = await LanguageModel.create({
    initialPrompts: [{ role: "system", content: SYSTEM_PROMPT }],
    monitor(m) {
      m.addEventListener("downloadprogress", (e) => {
        onStatus(`Gemini Nanoをダウンロード中... ${Math.round(e.loaded * 100)}% (初回のみ)`);
      });
    },
  });

  try {
    return await session.prompt(
      `以下は会議・ブレストの文字起こしです。この内容からモック作成プロンプトを生成してください。\n\n---\n${transcript}`
    );
  } finally {
    session.destroy();
  }
}
