import { transcribe, generateMockPrompt, dataUrlToBlob } from "./lib/api.js";
import { generateMockPromptLocal } from "./lib/local.js";

const recordBtn = document.getElementById("recordBtn");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const output = document.getElementById("output");
const status = document.getElementById("status");
const modeLabel = document.getElementById("modeLabel");

let isRecording = false;
let recordedBlob = null;
let recordedTranscript = null;
let recogNote = null;

function setStatus(text) {
  status.textContent = text;
}

async function getMode() {
  const { mode = "local" } = await chrome.storage.local.get("mode");
  return mode;
}

async function refreshModeLabel() {
  const mode = await getMode();
  modeLabel.textContent =
    mode === "local" ? "🆓 ローカル無料モード" : "☁️ クラウド高品質モード";
}
refreshModeLabel();
chrome.storage.onChanged.addListener(refreshModeLabel);

recordBtn.addEventListener("click", async () => {
  if (!isRecording) {
    const res = await chrome.runtime.sendMessage({ type: "start-recording" });
    if (!res?.ok) {
      setStatus(`録音を開始できません: ${res?.error ?? "不明なエラー"}`);
      return;
    }
    isRecording = true;
    recordBtn.textContent = "■ 録音停止";
    recordBtn.classList.add("recording");
    setStatus(res.tabAudio ? "🔴 録音中(タブ音声+マイク)" : "🔴 録音中(マイクのみ)");
  } else {
    await chrome.runtime.sendMessage({ type: "stop-recording" });
    isRecording = false;
    recordBtn.textContent = "録音開始";
    recordBtn.classList.remove("recording");
    setStatus("録音データを処理中...");
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "recording-complete" && message.target === "sidepanel") {
    recordedBlob = dataUrlToBlob(message.dataUrl);
    recordedTranscript = message.transcript ?? null;
    recogNote = message.recogNote ?? null;
    generateBtn.disabled = false;
    let text = `録音完了 (${Math.round(recordedBlob.size / 1024)} KB)。生成ボタンを押してください`;
    if (recogNote) text += `\n⚠️ ${recogNote}`;
    setStatus(text);
  }
});

generateBtn.addEventListener("click", async () => {
  if (!recordedBlob) return;

  const mode = await getMode();
  generateBtn.disabled = true;
  try {
    let prompt;
    if (mode === "local") {
      // 無料モード: オンデバイス文字起こし + Gemini Nano。通信もAPIキーも不要
      if (!recordedTranscript) {
        setStatus(
          `⚠️ 無料モードの文字起こしが取得できませんでした。${
            recogNote ?? "もう一度録音するか、設定からクラウドモードに切り替えてください"
          }`
        );
        return;
      }
      setStatus("Gemini Nanoでモックプロンプトを生成中...(端末内で処理)");
      prompt = await generateMockPromptLocal(recordedTranscript, setStatus);
    } else {
      const { anthropicKey, openaiKey } = await chrome.storage.local.get([
        "anthropicKey",
        "openaiKey",
      ]);
      if (!anthropicKey || !openaiKey) {
        setStatus("⚠️ クラウドモードには設定からAPIキーの保存が必要です");
        return;
      }
      setStatus("文字起こし中...");
      const transcript = await transcribe(recordedBlob, openaiKey);
      setStatus("モックプロンプトを生成中...");
      prompt = await generateMockPrompt(transcript, anthropicKey);
    }

    output.value = prompt;
    copyBtn.disabled = false;
    setStatus("✅ 完了。コピーして v0 / Figma Make 等に貼り付けてください");
  } catch (e) {
    setStatus(`エラー: ${e.message}`);
  } finally {
    generateBtn.disabled = false;
  }
});

copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(output.value);
  setStatus("📋 クリップボードにコピーしました");
});

document.getElementById("openOptions").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});
