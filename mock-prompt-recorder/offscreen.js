// オフスクリーンドキュメント: タブ音声+マイクをミックスして録音する
// (MV3ではサービスワーカーから getUserMedia を呼べないためここで行う)

let recorder = null;
let chunks = [];
let streams = [];
let audioContext = null;

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.target !== "offscreen") return;

  if (message.type === "offscreen-start") {
    startRecording(message.streamId)
      .then(() => sendResponse({ ok: true }))
      .catch((e) => sendResponse({ ok: false, error: String(e) }));
    return true;
  }

  if (message.type === "offscreen-stop") {
    stopRecording();
    sendResponse({ ok: true });
  }
});

async function startRecording(tabStreamId) {
  audioContext = new AudioContext();
  const destination = audioContext.createMediaStreamDestination();
  streams = [];

  // タブ音声(Meet等で相手の声が含まれる)。streamIdが無ければスキップ
  if (tabStreamId) {
    const tabStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: tabStreamId,
        },
      },
    });
    streams.push(tabStream);
    const tabSource = audioContext.createMediaStreamSource(tabStream);
    tabSource.connect(destination);
    // タブキャプチャ中も会議音声が聞こえ続けるようスピーカーにも流す
    tabSource.connect(audioContext.destination);
  }

  // マイク(自分の声)。拒否されてもタブ音声だけで続行
  try {
    const micStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    streams.push(micStream);
    audioContext.createMediaStreamSource(micStream).connect(destination);
  } catch (e) {
    if (streams.length === 0) throw new Error("マイクもタブ音声も利用できません: " + e);
  }

  chunks = [];
  recorder = new MediaRecorder(destination.stream, {
    mimeType: "audio/webm;codecs=opus",
  });
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  recorder.onstop = async () => {
    const blob = new Blob(chunks, { type: "audio/webm" });
    const base64 = await blobToDataUrl(blob);
    chrome.runtime.sendMessage({
      type: "recording-complete",
      target: "sidepanel",
      dataUrl: base64,
    });
    cleanup();
  };
  recorder.start(1000);
}

function stopRecording() {
  if (recorder && recorder.state !== "inactive") recorder.stop();
}

function cleanup() {
  streams.forEach((s) => s.getTracks().forEach((t) => t.stop()));
  streams = [];
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  recorder = null;
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
