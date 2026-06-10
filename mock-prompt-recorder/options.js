const anthropicInput = document.getElementById("anthropicKey");
const openaiInput = document.getElementById("openaiKey");
const savedLabel = document.getElementById("saved");

chrome.storage.local
  .get(["anthropicKey", "openaiKey"])
  .then(({ anthropicKey, openaiKey }) => {
    if (anthropicKey) anthropicInput.value = anthropicKey;
    if (openaiKey) openaiInput.value = openaiKey;
  });

document.getElementById("saveBtn").addEventListener("click", async () => {
  await chrome.storage.local.set({
    anthropicKey: anthropicInput.value.trim(),
    openaiKey: openaiInput.value.trim(),
  });
  savedLabel.textContent = "✅ 保存しました";
  setTimeout(() => (savedLabel.textContent = ""), 2000);
});
