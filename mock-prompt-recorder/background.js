// サービスワーカー: サイドパネルとオフスクリーンドキュメントの橋渡しを行う

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

const OFFSCREEN_URL = "offscreen.html";

async function ensureOffscreenDocument() {
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
  });
  if (contexts.length > 0) return;
  await chrome.offscreen.createDocument({
    url: OFFSCREEN_URL,
    reasons: ["USER_MEDIA"],
    justification: "会議タブの音声とマイクを録音するため",
  });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "start-recording") {
    (async () => {
      try {
        await ensureOffscreenDocument();

        // アクティブタブの音声キャプチャ用ストリームIDを取得。
        // chrome:// ページ等では取得できないため、その場合はマイクのみで録音する
        let streamId = null;
        try {
          const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
          });
          if (tab?.id) {
            streamId = await chrome.tabCapture.getMediaStreamId({
              targetTabId: tab.id,
            });
          }
        } catch (e) {
          console.warn("タブ音声を取得できないためマイクのみで録音します", e);
        }

        await chrome.runtime.sendMessage({
          type: "offscreen-start",
          target: "offscreen",
          streamId,
        });
        sendResponse({ ok: true, tabAudio: streamId !== null });
      } catch (e) {
        sendResponse({ ok: false, error: String(e) });
      }
    })();
    return true; // 非同期レスポンス
  }

  if (message.type === "stop-recording") {
    chrome.runtime
      .sendMessage({ type: "offscreen-stop", target: "offscreen" })
      .then(() => sendResponse({ ok: true }))
      .catch((e) => sendResponse({ ok: false, error: String(e) }));
    return true;
  }
});
