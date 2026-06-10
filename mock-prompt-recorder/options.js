const anthropicInput = document.getElementById("anthropicKey");
const openaiInput = document.getElementById("openaiKey");
const recogLangSelect = document.getElementById("recogLang");
const savedLabel = document.getElementById("saved");

chrome.storage.local
  .get(["anthropicKey", "openaiKey", "mode", "recogLang"])
  .then(({ anthropicKey, openaiKey, mode = "local", recogLang = "ja-JP" }) => {
    if (anthropicKey) anthropicInput.value = anthropicKey;
    if (openaiKey) openaiInput.value = openaiKey;
    recogLangSelect.value = recogLang;
    const radio = document.querySelector(`input[name="mode"][value="${mode}"]`);
    if (radio) radio.checked = true;
  });

document.getElementById("saveBtn").addEventListener("click", async () => {
  await chrome.storage.local.set({
    anthropicKey: anthropicInput.value.trim(),
    openaiKey: openaiInput.value.trim(),
    mode: document.querySelector('input[name="mode"]:checked').value,
    recogLang: recogLangSelect.value,
  });
  savedLabel.textContent = "✅ 保存しました";
  setTimeout(() => (savedLabel.textContent = ""), 2000);
});
