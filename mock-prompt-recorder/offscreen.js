// オフスクリーンドキュメント: タブ音声+マイクをミックスして録音する
// (MV3ではサービスワーカーから getUserMedia を呼べないためここで行う)
// ローカル無料モードでは、ミックス音声をWeb Speech APIのオンデバイス認識で
// リアルタイム文字起こしする(Chrome 139+、通信なし・無料)

let recorder = null;
let chunks = [];
let streams = [];
let audioContext = null;

let recognizer = null;
let recognizing = false;
let transcriptParts = [];
let recogNote = null;

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

  // ローカル無料モードならオンデバイス文字起こしを並走させる
  const { mode = "local", recogLang = "ja-JP" } = await chrome.storage.local.get([
    "mode",
    "recogLang",
  ]);
  if (mode === "local") {
    await startRecognition(destination.stream, recogLang);
  }

  chunks = [];
  recorder = new MediaRecorder(destination.stream, {
    mimeType: "audio/webm;codecs=opus",
  });
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  recorder.onstop = async () => {
    // 認識器が最後の確定結果を吐き出すのを少し待つ
    if (recognizer) await new Promise((r) => setTimeout(r, 800));
    const blob = new Blob(chunks, { type: "audio/webm" });
    const base64 = await blobToDataUrl(blob);
    chrome.runtime.sendMessage({
      type: "recording-complete",
      target: "sidepanel",
      dataUrl: base64,
      transcript: transcriptParts.join(" ").trim() || null,
      recogNote,
    });
    cleanup();
  };
  recorder.start(1000);
}

async function startRecognition(stream, lang) {
  transcriptParts = [];
  recogNote = null;
  const SR = self.SpeechRecognition || self.webkitSpeechRecognition;
  if (!SR) {
    recogNote = "このChromeは音声認識に未対応です(Chrome 139以降が必要)";
    return;
  }

  try {
    // オンデバイス用の言語パックが無ければ裏でダウンロードを開始し、今回はスキップ
    if (typeof SR.available === "function") {
      const status = await SR.available({ langs: [lang], processLocally: true });
      if (status === "downloadable" || status === "downloading") {
        SR.install({ langs: [lang], processLocally: true });
        recogNote =
          "音声認識の言語パックをダウンロード中です(初回のみ)。次回の録音から無料文字起こしが使えます";
        return;
      }
      if (status === "unavailable") {
        recogNote = `この環境ではオンデバイス音声認識(${lang})を利用できません`;
        return;
      }
    }

    recognizer = new SR();
    recognizer.lang = lang;
    recognizer.continuous = true;
    recognizer.interimResults = false;
    if ("processLocally" in recognizer) recognizer.processLocally = true;
    recognizer.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          transcriptParts.push(e.results[i][0].transcript);
        }
      }
    };
    // 無音などで勝手に止まったら録音中は再開する
    recognizer.onend = () => {
      if (recognizing) {
        try {
          recognizer.start(stream.getAudioTracks()[0]);
        } catch (_) {}
      }
    };
    recognizing = true;
    // MediaStreamTrack指定でタブ音声+マイクのミックスを認識(Chrome 139+)
    recognizer.start(stream.getAudioTracks()[0]);
  } catch (e) {
    recogNote = "音声認識を開始できませんでした: " + e;
    recognizing = false;
    recognizer = null;
  }
}

function stopRecording() {
  recognizing = false;
  if (recognizer) {
    try {
      recognizer.stop();
    } catch (_) {}
  }
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
  recognizer = null;
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
