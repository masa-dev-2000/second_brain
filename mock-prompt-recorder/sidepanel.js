import { transcribe, generateMockPrompt, dataUrlToBlob } from "./lib/api.js";

const recordBtn = document.getElementById("recordBtn");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const output = document.getElementById("output");
const status = document.getElementById("status");

let isRecording = false;
let recordedBlob = null;

function setStatus(text) {
  status.textContent = text;
}

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
    generateBtn.disabled = false;
    setStatus(`録音完了 (${Math.round(recordedBlob.size / 1024)} KB)。生成ボタンを押してください`);
  }
});

generateBtn.addEventListener("click", async () => {
  if (!recordedBlob) return;

  const { anthropicKey, openaiKey } = await chrome.storage.local.get([
    "anthropicKey",
    "openaiKey",
  ]);
  if (!anthropicKey || !openaiKey) {
    setStatus("⚠️ 先に「APIキー設定」からキーを保存してください");
    return;
  }

  generateBtn.disabled = true;
  try {
    setStatus("文字起こし中...");
    const transcript = await transcribe(recordedBlob, openaiKey);

    setStatus("モックプロンプトを生成中...");
    const prompt = await generateMockPrompt(transcript, anthropicKey);

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
